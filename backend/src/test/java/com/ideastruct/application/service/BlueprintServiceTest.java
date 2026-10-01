package com.ideastruct.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ideastruct.infrastructure.ai.AiBlueprintProvider;
import com.ideastruct.infrastructure.ai.DemoBlueprintProvider;
import com.ideastruct.api.dto.RegenerateRequest;
import com.ideastruct.api.dto.RegenerateResponse;
import com.ideastruct.exception.BadRequestException;
import com.ideastruct.exception.ConflictException;
import com.ideastruct.domain.model.Project;
import com.ideastruct.infrastructure.database.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BlueprintServiceTest {

    private ProjectRepository projectRepository;
    private AiBlueprintProvider liveProvider;
    private DemoBlueprintProvider demoProvider;
    private BlueprintService blueprintService;

    @BeforeEach
    void setUp() {
        projectRepository = mock(ProjectRepository.class);
        liveProvider = mock(AiBlueprintProvider.class);
        demoProvider = new DemoBlueprintProvider(new ObjectMapper());
        blueprintService = new BlueprintService(projectRepository, liveProvider, demoProvider, new com.ideastruct.domain.validation.ValidationRuleEngine());
    }

    @Test
    @DisplayName("Generate blueprint with demo provider saves blueprint and sets truthful DEMO metadata without live provider")
    void shouldGenerateDemoBlueprintSuccessfully() {
        Project project = new Project("Campus Food App", "A platform for campus ordering with more than fifty characters to pass length bounds.");
        project.setId("proj-1");
        project.setRevision(1L);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project updated = blueprintService.generateInitialBlueprint("proj-1", 1L, "DEMO");

        assertNotNull(updated.getBlueprint());
        assertEquals("DEMO", updated.getGenerationMetadata().getSource());
        assertNull(updated.getGenerationMetadata().getProvider(), "DEMO metadata must not claim any live provider");
        assertNotEquals("google", updated.getGenerationMetadata().getProvider());
        assertNotEquals("gemini", updated.getGenerationMetadata().getProvider());
        assertEquals("deterministic-fixture-v1", updated.getGenerationMetadata().getModel());
        assertEquals(2L, updated.getRevision());
        assertFalse(updated.isBlueprintOutdated());
        assertNotNull(updated.getBlueprintBasedOnIdeaHash());
    }

    @Test
    @DisplayName("Generate blueprint with LIVE_AI sets LIVE_AI source and configured real provider")
    void shouldSetLiveAiMetadataWhenLiveProviderUsed() {
        Project project = new Project("Campus Food App", "A platform for campus ordering with more than fifty characters to pass length bounds.");
        project.setId("proj-1");
        project.setRevision(1L);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));
        when(liveProvider.isAvailable()).thenReturn(true);
        when(liveProvider.getSource()).thenReturn("LIVE_AI");
        when(liveProvider.getProviderName()).thenReturn("google");
        when(liveProvider.getModelName()).thenReturn("gemini-2.5-flash");
        when(liveProvider.generateBlueprint(anyString(), anyString())).thenReturn(Map.of("schemaVersion", "1.0"));

        Project updated = blueprintService.generateInitialBlueprint("proj-1", 1L, "LIVE_AI");

        assertNotNull(updated.getBlueprint());
        assertEquals("LIVE_AI", updated.getGenerationMetadata().getSource());
        assertEquals("google", updated.getGenerationMetadata().getProvider());
        assertEquals("gemini-2.5-flash", updated.getGenerationMetadata().getModel());
        assertEquals(2L, updated.getRevision());
    }

    @Test
    @DisplayName("Generate blueprint rejects stale expected revision")
    void shouldRejectStaleRevision() {
        Project project = new Project("Campus Food App", "A platform for campus ordering with more than fifty characters to pass length bounds.");
        project.setId("proj-1");
        project.setRevision(2L);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));

        assertThrows(ConflictException.class, () -> blueprintService.generateInitialBlueprint("proj-1", 1L, "DEMO"));
    }

    @Test
    @DisplayName("Generate blueprint rejects if blueprint already exists")
    void shouldRejectIfBlueprintAlreadyExists() {
        Project project = new Project("Campus Food App", "A platform for campus ordering with more than fifty characters to pass length bounds.");
        project.setId("proj-1");
        project.setRevision(1L);
        project.setBlueprint(Map.of("schemaVersion", "1.0"));

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));

        assertThrows(ConflictException.class, () -> blueprintService.generateInitialBlueprint("proj-1", 1L, "DEMO"));
    }

    @Test
    @DisplayName("Requesting LIVE_AI when Gemini API key is missing throws BadRequestException honestly")
    void shouldFailHonestlyWhenLiveAiUnavailable() {
        Project project = new Project("Campus Food App", "A platform for campus ordering with more than fifty characters to pass length bounds.");
        project.setId("proj-1");
        project.setRevision(1L);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));
        when(liveProvider.isAvailable()).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> blueprintService.generateInitialBlueprint("proj-1", 1L, "LIVE_AI"));

        assertTrue(ex.getMessage().contains("GEMINI_API_KEY is not configured"));
        assertNull(project.getBlueprint(), "Blueprint must not be set on LIVE_AI failure (no silent DEMO fallback)");
        assertEquals(1L, project.getRevision());
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Update blueprint saves edits, increments revision, and marks USER_EDITED")
    void shouldUpdateBlueprintSuccessfully() {
        Project project = new Project("Campus App", "Valid description that satisfies fifty characters minimum requirement.");
        project.setId("proj-1");
        project.setRevision(2L);
        Map<String, Object> bp = demoProvider.generateBlueprint("Campus App", "idea");
        project.setBlueprint(bp);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> editedBp = new LinkedHashMap<>(bp);
        editedBp.put("customField", "customValue");

        Project saved = blueprintService.updateBlueprint("proj-1", editedBp, 2L);

        assertEquals(3L, saved.getRevision());
        assertEquals("USER_EDITED", saved.getGenerationMetadata().getSource());
        verify(projectRepository).save(project);
    }

    @Test
    @DisplayName("Propose regeneration returns candidate without mutating saved database project")
    void shouldProposeRegenerationWithoutOverwritingDatabase() {
        Project project = new Project("Campus App", "Valid description that satisfies fifty characters minimum requirement.");
        project.setId("proj-1");
        project.setRevision(2L);
        Map<String, Object> bp = demoProvider.generateBlueprint("Campus App", "idea");
        project.setBlueprint(bp);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));

        RegenerateRequest req = new RegenerateRequest(2L, "database", "Add reviews collection", "DEMO");
        RegenerateResponse response = blueprintService.proposeRegeneration("proj-1", req);

        assertNotNull(response);
        assertEquals(2L, response.getBaseRevision());
        assertEquals("database", response.getSection());
        assertNotNull(response.getCandidate());
        assertTrue(response.getDiffSummary().contains("database"));

        // Verify project in repository was NEVER saved or modified
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Concurrent edit during generation rejects stale result and preserves newer state")
    void shouldProtectAgainstConcurrentModificationDuringGeneration() {
        Project projectAtStart = new Project("Initial Title", "Valid description that satisfies fifty characters minimum requirement.");
        projectAtStart.setId("proj-1");
        projectAtStart.setRevision(1L);

        // While generation is ongoing, user edited project to revision 2 with new title
        Project projectAtEnd = new Project("Updated Title", "Valid description that satisfies fifty characters minimum requirement.");
        projectAtEnd.setId("proj-1");
        projectAtEnd.setRevision(2L);

        // First findById returns rev 1, second findById (post-generation check) returns rev 2
        when(projectRepository.findById("proj-1"))
                .thenReturn(Optional.of(projectAtStart))
                .thenReturn(Optional.of(projectAtEnd));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                blueprintService.generateInitialBlueprint("proj-1", 1L, "DEMO")
        );

        assertTrue(ex.getMessage().contains("Concurrent modification detected"));
        assertEquals(2L, ex.getCurrentRevision());
        assertEquals(1L, ex.getExpectedRevision());
        // Verify blueprint was NOT saved on projectAtEnd
        assertNull(projectAtEnd.getBlueprint());
    }

    @Test
    @DisplayName("Deleted project during generation does not recreate the project")
    void shouldProtectAgainstDeletedProjectDuringGeneration() {
        Project projectAtStart = new Project("Title", "Valid description that satisfies fifty characters minimum requirement.");
        projectAtStart.setId("proj-1");
        projectAtStart.setRevision(1L);

        // First findById returns project, second findById returns empty (deleted)
        when(projectRepository.findById("proj-1"))
                .thenReturn(Optional.of(projectAtStart))
                .thenReturn(Optional.empty());

        com.ideastruct.exception.ResourceNotFoundException ex = assertThrows(
                com.ideastruct.exception.ResourceNotFoundException.class,
                () -> blueprintService.generateInitialBlueprint("proj-1", 1L, "DEMO")
        );

        assertTrue(ex.getMessage().contains("Project disappeared"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Provider error during generation records error and preserves project state")
    void shouldPreserveProjectStateWhenProviderFails() {
        Project project = new Project("Title", "Valid description that satisfies fifty characters minimum requirement.");
        project.setId("proj-1");
        project.setRevision(1L);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));
        when(liveProvider.isAvailable()).thenReturn(true);
        when(liveProvider.generateBlueprint(anyString(), anyString()))
                .thenThrow(new RuntimeException("Gemini API timeout"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                blueprintService.generateInitialBlueprint("proj-1", 1L, "LIVE_AI")
        );

        assertTrue(ex.getMessage().contains("Gemini API timeout"));
        // Project lastGenerationError is updated, but revision remains 1 and blueprint is null
        assertEquals(1L, project.getRevision());
        assertNull(project.getBlueprint());
        assertEquals("Gemini API timeout", project.getLastGenerationError());
        verify(projectRepository).save(project);
    }

    @Test
    @DisplayName("Update blueprint rejects schema when required section is missing")
    void shouldRejectUpdateWhenSectionIsMissing() {
        Project project = new Project("Campus App", "Valid description that satisfies fifty characters minimum requirement.");
        project.setId("proj-1");
        project.setRevision(2L);
        Map<String, Object> bp = demoProvider.generateBlueprint("Campus App", "idea");
        project.setBlueprint(bp);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));

        Map<String, Object> invalidBp = new LinkedHashMap<>(bp);
        invalidBp.remove("database");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                blueprintService.updateBlueprint("proj-1", invalidBp, 2L)
        );
        assertTrue(ex.getMessage().contains("missing required top-level section: database"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Update blueprint rejects invalid data type for section (e.g. features as string)")
    void shouldRejectUpdateWhenSectionTypeIsInvalid() {
        Project project = new Project("Campus App", "Valid description that satisfies fifty characters minimum requirement.");
        project.setId("proj-1");
        project.setRevision(2L);
        Map<String, Object> bp = demoProvider.generateBlueprint("Campus App", "idea");
        project.setBlueprint(bp);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));

        Map<String, Object> invalidBp = new LinkedHashMap<>(bp);
        invalidBp.put("features", "invalid-string-not-a-list");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                blueprintService.updateBlueprint("proj-1", invalidBp, 2L)
        );
        assertTrue(ex.getMessage().contains("must be a JSON array/list"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Update blueprint rejects stale expected revision with 409 Conflict")
    void shouldRejectUpdateOnStaleRevision() {
        Project project = new Project("Campus App", "Valid description that satisfies fifty characters minimum requirement.");
        project.setId("proj-1");
        project.setRevision(3L);
        Map<String, Object> bp = demoProvider.generateBlueprint("Campus App", "idea");
        project.setBlueprint(bp);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                blueprintService.updateBlueprint("proj-1", bp, 2L)
        );
        assertEquals(3L, ex.getCurrentRevision());
        assertEquals(2L, ex.getExpectedRevision());
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Section regeneration merges target section and preserves all unrelated sections identically")
    void shouldMergeOnlyTargetSectionInRegeneration() {
        Project project = new Project("Campus App", "Valid description that satisfies fifty characters minimum requirement.");
        project.setId("proj-1");
        project.setRevision(2L);
        Map<String, Object> bp = demoProvider.generateBlueprint("Campus App", "idea");
        project.setBlueprint(bp);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));

        RegenerateRequest req = new RegenerateRequest(2L, "database", "Add analytics collection", "DEMO");
        RegenerateResponse response = blueprintService.proposeRegeneration("proj-1", req);

        assertNotNull(response);
        assertEquals("database", response.getSection());
        Map<String, Object> candidate = response.getCandidate();

        // Unrelated sections must be identical to saved project blueprint
        assertEquals(bp.get("overview"), candidate.get("overview"));
        assertEquals(bp.get("features"), candidate.get("features"));
        assertEquals(bp.get("roles"), candidate.get("roles"));
        assertEquals(bp.get("requirements"), candidate.get("requirements"));
        assertEquals(bp.get("apis"), candidate.get("apis"));
        assertEquals(bp.get("uiScreens"), candidate.get("uiScreens"));
        assertEquals(bp.get("roadmap"), candidate.get("roadmap"));
        assertEquals(bp.get("assumptions"), candidate.get("assumptions"));
        assertEquals(bp.get("openQuestions"), candidate.get("openQuestions"));

        // Saved project in repository remains completely unmutated
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Propose regeneration rejects malformed candidate from provider")
    void shouldRejectMalformedCandidateFromProvider() {
        Project project = new Project("Campus App", "Valid description that satisfies fifty characters minimum requirement.");
        project.setId("proj-1");
        project.setRevision(2L);
        Map<String, Object> bp = demoProvider.generateBlueprint("Campus App", "idea");
        project.setBlueprint(bp);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(project));
        when(liveProvider.isAvailable()).thenReturn(true);
        // Malformed blueprint missing required sections
        when(liveProvider.generateBlueprint(anyString(), anyString())).thenReturn(Map.of("invalid", "data"));

        RegenerateRequest req = new RegenerateRequest(2L, "all", "instructions", "LIVE_AI");
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                blueprintService.proposeRegeneration("proj-1", req)
        );
        assertTrue(ex.getMessage().contains("missing required top-level section"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Generate hardware blueprint populates components, wiring, and 3D model")
    void shouldGenerateHardwareBlueprintWithComponentsAnd3DModel() {
        Project project = new Project("Gas Sentinel", "An ESP32 microcontroller circuit with MQ-135 gas sensor, buzzer, and 5V power supply.");
        project.setId("proj-hw");
        project.setRevision(1L);

        when(projectRepository.findById("proj-hw")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project updated = blueprintService.generateInitialBlueprint("proj-hw", 1L, "DEMO");

        assertNotNull(updated.getBlueprint());
        Map<String, Object> bp = updated.getBlueprint();
        assertEquals("HARDWARE", bp.get("projectType"));
        assertNotNull(bp.get("estimates"));
        assertNotNull(bp.get("hardware"));

        @SuppressWarnings("unchecked")
        Map<String, Object> hw = (Map<String, Object>) bp.get("hardware");
        assertEquals(true, hw.get("applicable"));
        assertNotNull(hw.get("components"));
        assertNotNull(hw.get("connections"));
        assertNotNull(hw.get("threeDModel"));
    }

    @Test
    @DisplayName("Generate hybrid blueprint populates both software and hardware with integrations")
    void shouldGenerateHybridBlueprintWithIntegrations() {
        Project project = new Project("IoT Cold Chain", "An IoT connected tracking device with ESP32 and temperature sensor publishing to a cloud dashboard.");
        project.setId("proj-hy");
        project.setRevision(1L);

        when(projectRepository.findById("proj-hy")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project updated = blueprintService.generateInitialBlueprint("proj-hy", 1L, "DEMO");

        assertNotNull(updated.getBlueprint());
        Map<String, Object> bp = updated.getBlueprint();
        assertEquals("HYBRID", bp.get("projectType"));
        assertNotNull(bp.get("estimates"));
        assertNotNull(bp.get("software"));
        assertNotNull(bp.get("hardware"));

        @SuppressWarnings("unchecked")
        Map<String, Object> sw = (Map<String, Object>) bp.get("software");
        assertEquals(true, sw.get("applicable"));
        assertNotNull(sw.get("prototype"));
        assertNotNull(sw.get("integrations"));

        @SuppressWarnings("unchecked")
        Map<String, Object> hw = (Map<String, Object>) bp.get("hardware");
        assertEquals(true, hw.get("applicable"));
        assertNotNull(hw.get("threeDModel"));
    }

    @Test
    @DisplayName("Normalize legacy blueprint with full software artifacts gets HIGH confidence")
    void shouldNormalizeLegacyBlueprintWithFullSoftwareArtifacts() {
        Map<String, Object> legacy = new LinkedHashMap<>();
        legacy.put("schemaVersion", "1.0");
        legacy.put("database", Map.of("collections", List.of()));
        legacy.put("apis", List.of());
        legacy.put("uiScreens", List.of());

        Map<String, Object> normalized = BlueprintService.normalizeBlueprint(legacy);

        assertEquals("SOFTWARE", normalized.get("projectType"));
        @SuppressWarnings("unchecked")
        Map<String, Object> cl = (Map<String, Object>) normalized.get("classification");
        assertNotNull(cl);
        assertEquals("SOFTWARE", cl.get("type"));
        assertEquals("HIGH", cl.get("confidence"));
        assertTrue(String.valueOf(cl.get("reason")).contains("verified software artifacts"));
    }

    @Test
    @DisplayName("Normalize legacy blueprint with baseline requirements only gets MEDIUM confidence")
    void shouldNormalizeLegacyBlueprintWithBaselineRequirementsGetsMediumConfidence() {
        Map<String, Object> legacy = new LinkedHashMap<>();
        legacy.put("schemaVersion", "1.0");
        legacy.put("requirements", List.of("Simple text requirement"));

        Map<String, Object> normalized = BlueprintService.normalizeBlueprint(legacy);

        assertEquals("SOFTWARE", normalized.get("projectType"));
        @SuppressWarnings("unchecked")
        Map<String, Object> cl = (Map<String, Object>) normalized.get("classification");
        assertNotNull(cl);
        assertEquals("SOFTWARE", cl.get("type"));
        assertEquals("MEDIUM", cl.get("confidence"));
        assertTrue(String.valueOf(cl.get("reason")).contains("baseline software requirements"));
    }

    @Test
    @DisplayName("Generate initial blueprint honors typeOverride for HARDWARE in DEMO mode")
    void shouldHonorHardwareTypeOverrideInDemoMode() {
        // Idea text is purely software words, but user sets HARDWARE override
        Project project = new Project("Override Test", "A web app and mobile app for tracking personal habits with user login, dashboard, and database.");
        project.setId("proj-hw-override");
        project.setRevision(1L);
        project.setTypeOverride("HARDWARE");

        when(projectRepository.findById("proj-hw-override")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project generated = blueprintService.generateInitialBlueprint("proj-hw-override", 1L, "DEMO");

        assertNotNull(generated.getBlueprint());
        assertEquals("HARDWARE", generated.getBlueprint().get("projectType"));
        @SuppressWarnings("unchecked")
        Map<String, Object> cl = (Map<String, Object>) generated.getBlueprint().get("classification");
        assertEquals("HARDWARE", cl.get("type"));
    }

    @Test
    @DisplayName("Generate initial blueprint honors typeOverride for HYBRID in DEMO mode")
    void shouldHonorHybridTypeOverrideInDemoMode() {
        Project project = new Project("Override Test Hybrid", "A web app and mobile app for tracking personal habits with user login, dashboard, and database.");
        project.setId("proj-hy-override");
        project.setRevision(1L);
        project.setTypeOverride("HYBRID");

        when(projectRepository.findById("proj-hy-override")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project generated = blueprintService.generateInitialBlueprint("proj-hy-override", 1L, "DEMO");

        assertNotNull(generated.getBlueprint());
        assertEquals("HYBRID", generated.getBlueprint().get("projectType"));
        @SuppressWarnings("unchecked")
        Map<String, Object> cl = (Map<String, Object>) generated.getBlueprint().get("classification");
        assertEquals("HYBRID", cl.get("type"));
    }

    @Test
    @DisplayName("Regeneration preserves intended project type from typeOverride or saved blueprint")
    void shouldPreserveIntendedProjectTypeOnRegeneration() {
        Project project = new Project("Preserved Type Project", "A project idea description meeting minimum length requirements for testing purposes.");
        project.setId("proj-regen-type");
        project.setRevision(2L);
        project.setTypeOverride("HARDWARE");

        Map<String, Object> bp = new LinkedHashMap<>();
        bp.put("schemaVersion", "2.0");
        bp.put("projectType", "HARDWARE");
        bp.put("overview", Map.of("projectName", "Preserved Type Project", "summary", "Hardware summary", "problemStatement", "prob", "targetUsers", List.of(), "goals", List.of(), "scope", List.of(), "outOfScope", List.of()));
        bp.put("features", List.of());
        bp.put("roles", List.of());
        bp.put("requirements", List.of());
        bp.put("hardware", Map.of("applicable", true));
        bp.put("roadmap", List.of());
        bp.put("assumptions", List.of());
        bp.put("openQuestions", List.of());
        project.setBlueprint(bp);

        when(projectRepository.findById("proj-regen-type")).thenReturn(Optional.of(project));

        RegenerateRequest req = new RegenerateRequest(2L, "overview", "Make it more detailed", "DEMO");
        RegenerateResponse res = blueprintService.proposeRegeneration("proj-regen-type", req);

        assertNotNull(res);
        assertNotNull(res.getCandidate());
        assertEquals("HARDWARE", res.getCandidate().get("projectType"));
    }

    @Test
    @DisplayName("Backward compatibility: updateBlueprint accepts schemaVersion 1.0 and 2.0")
    void shouldAcceptBothSchemaVersion1And2() {
        Project project = new Project("Version Test Project", "A project idea description meeting minimum length requirements for testing purposes.");
        project.setId("proj-ver");
        project.setRevision(1L);

        when(projectRepository.findById("proj-ver")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        // Schema 1.0
        Map<String, Object> bp1 = new LinkedHashMap<>();
        bp1.put("schemaVersion", "1.0");
        bp1.put("overview", Map.of("projectName", "Legacy v1", "summary", "sum", "problemStatement", "prob", "targetUsers", List.of(), "goals", List.of(), "scope", List.of(), "outOfScope", List.of()));
        bp1.put("features", List.of());
        bp1.put("roles", List.of());
        bp1.put("requirements", List.of());
        bp1.put("database", Map.of());
        bp1.put("apis", List.of());
        bp1.put("uiScreens", List.of());
        bp1.put("roadmap", List.of());
        bp1.put("assumptions", List.of());
        bp1.put("openQuestions", List.of());

        Project saved1 = blueprintService.updateBlueprint("proj-ver", bp1, 1L);
        assertEquals("1.0", saved1.getBlueprint().get("schemaVersion"));

        // Schema 2.0
        project.setRevision(2L);
        Map<String, Object> bp2 = new LinkedHashMap<>(bp1);
        bp2.put("schemaVersion", "2.0");
        bp2.put("projectType", "SOFTWARE");

        Project saved2 = blueprintService.updateBlueprint("proj-ver", bp2, 2L);
        assertEquals("2.0", saved2.getBlueprint().get("schemaVersion"));
    }

    @Test
    @DisplayName("updateBlueprint rejects unknown prototype component type with BadRequestException")
    void shouldRejectInvalidPrototypeComponent() {
        Project project = new Project("Component Test", "A project idea description meeting minimum length requirements for testing purposes.");
        project.setId("proj-cmp");
        project.setRevision(1L);

        when(projectRepository.findById("proj-cmp")).thenReturn(Optional.of(project));

        Map<String, Object> bp = new LinkedHashMap<>();
        bp.put("schemaVersion", "2.0");
        bp.put("projectType", "SOFTWARE");
        bp.put("overview", Map.of("projectName", "Comp Test", "summary", "sum", "problemStatement", "prob", "targetUsers", List.of(), "goals", List.of(), "scope", List.of(), "outOfScope", List.of()));
        bp.put("features", List.of());
        bp.put("roles", List.of());
        bp.put("requirements", List.of());
        bp.put("roadmap", List.of());
        bp.put("assumptions", List.of());
        bp.put("openQuestions", List.of());

        bp.put("database", Map.of("collections", List.of()));
        bp.put("apis", List.of());
        bp.put("uiScreens", List.of());

        // Injected invalid component
        bp.put("software", Map.of(
                "applicable", true,
                "prototype", Map.of(
                        "screens", List.of(
                                Map.of(
                                        "id", "scr-1",
                                        "components", List.of(
                                                Map.of("id", "c1", "type", "MALICIOUS_SCRIPT_INJECTOR")
                                        )
                                )
                        )
                )
        ));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                blueprintService.updateBlueprint("proj-cmp", bp, 1L));
        assertTrue(ex.getMessage().contains("Unknown prototype component type: MALICIOUS_SCRIPT_INJECTOR"));
    }

    @Test
    @DisplayName("updateBlueprint rejects unknown prototype action type with BadRequestException")
    void shouldRejectInvalidPrototypeAction() {
        Project project = new Project("Action Test", "A project idea description meeting minimum length requirements for testing purposes.");
        project.setId("proj-act");
        project.setRevision(1L);

        when(projectRepository.findById("proj-act")).thenReturn(Optional.of(project));

        Map<String, Object> bp = new LinkedHashMap<>();
        bp.put("schemaVersion", "2.0");
        bp.put("projectType", "SOFTWARE");
        bp.put("overview", Map.of("projectName", "Action Test", "summary", "sum", "problemStatement", "prob", "targetUsers", List.of(), "goals", List.of(), "scope", List.of(), "outOfScope", List.of()));
        bp.put("features", List.of());
        bp.put("roles", List.of());
        bp.put("requirements", List.of());
        bp.put("roadmap", List.of());
        bp.put("assumptions", List.of());
        bp.put("openQuestions", List.of());
        bp.put("database", Map.of("collections", List.of()));
        bp.put("apis", List.of());
        bp.put("uiScreens", List.of());

        // Injected invalid action
        bp.put("software", Map.of(
                "applicable", true,
                "prototype", Map.of(
                        "screens", List.of(
                                Map.of(
                                        "id", "scr-1",
                                        "components", List.of(
                                                Map.of(
                                                        "id", "c1",
                                                        "type", "Button",
                                                        "action", Map.of("type", "EXECUTE_ARBITRARY_CODE")
                                                )
                                        )
                                )
                        )
                )
        ));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                blueprintService.updateBlueprint("proj-act", bp, 1L));
        assertTrue(ex.getMessage().contains("Unknown prototype action type: EXECUTE_ARBITRARY_CODE"));
    }

    @Test
    @DisplayName("updateBlueprint rejects unknown 3D primitive type with BadRequestException")
    void shouldRejectInvalid3DPrimitive() {
        Project project = new Project("3D Primitive Test", "A project idea description meeting minimum length requirements for testing purposes.");
        project.setId("proj-3d");
        project.setRevision(1L);

        when(projectRepository.findById("proj-3d")).thenReturn(Optional.of(project));

        Map<String, Object> bp = new LinkedHashMap<>();
        bp.put("schemaVersion", "2.0");
        bp.put("projectType", "HARDWARE");
        bp.put("overview", Map.of("projectName", "3D Test", "summary", "sum", "problemStatement", "prob", "targetUsers", List.of(), "goals", List.of(), "scope", List.of(), "outOfScope", List.of()));
        bp.put("features", List.of());
        bp.put("roles", List.of());
        bp.put("requirements", List.of());
        bp.put("roadmap", List.of());
        bp.put("assumptions", List.of());
        bp.put("openQuestions", List.of());

        // Injected invalid 3D primitive in spatialLayout3D
        bp.put("hardware", Map.of(
                "applicable", true,
                "spatialLayout3D", Map.of(
                        "componentPlacements", List.of(
                                Map.of("componentId", "comp-1", "primitive", "INVALID_POLYGON_MESH")
                        )
                )
        ));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                blueprintService.updateBlueprint("proj-3d", bp, 1L));
        assertTrue(ex.getMessage().contains("Unknown 3D spatial primitive type: INVALID_POLYGON_MESH"));
    }

    @Test
    @DisplayName("Demo provider generates archetype-specific hardware blueprints based on project idea")
    void shouldGenerateArchetypeSpecificHardwareBlueprintsInDemoMode() {
        // 1. Agriculture
        Map<String, Object> agriBp = demoProvider.generateBlueprint("Smart Irrigation System", "Automated plant watering controller with soil moisture sensor and solenoid valve");
        assertEquals("HARDWARE", agriBp.get("projectType"));
        Map<?, ?> agriHw = (Map<?, ?>) agriBp.get("hardware");
        assertNotNull(agriHw);
        Map<?, ?> agriEnclosure = (Map<?, ?>) agriHw.get("enclosureConcept");
        assertEquals("WEATHERPROOF_BOX", agriEnclosure.get("type"));

        // 2. Wearable
        Map<String, Object> wearableBp = demoProvider.generateBlueprint("Health Monitoring Wristband", "Wearable fitness tracker with optical pulse oximeter sensor and haptic feedback");
        assertEquals("HARDWARE", wearableBp.get("projectType"));
        Map<?, ?> wearableHw = (Map<?, ?>) wearableBp.get("hardware");
        assertNotNull(wearableHw);
        Map<?, ?> wearableEnclosure = (Map<?, ?>) wearableHw.get("enclosureConcept");
        assertEquals("WEARABLE_CASE", wearableEnclosure.get("type"));

        // 3. Robotics
        Map<String, Object> robotBp = demoProvider.generateBlueprint("Obstacle Avoiding Rover", "Autonomous robot car with ultrasonic sonar sensor and dual motor driver");
        assertEquals("HARDWARE", robotBp.get("projectType"));
        Map<?, ?> robotHw = (Map<?, ?>) robotBp.get("hardware");
        assertNotNull(robotHw);
        Map<?, ?> robotEnclosure = (Map<?, ?>) robotHw.get("enclosureConcept");
        assertEquals("ROBOTIC_CHASSIS", robotEnclosure.get("type"));

        // 4. Gas Detector (default hardware)
        Map<String, Object> gasBp = demoProvider.generateBlueprint("Gas Leakage Detector", "LPG and smoke detector with buzzer alarm and OLED display");
        assertEquals("HARDWARE", gasBp.get("projectType"));
        Map<?, ?> gasHw = (Map<?, ?>) gasBp.get("hardware");
        assertNotNull(gasHw);
        Map<?, ?> gasEnclosure = (Map<?, ?>) gasHw.get("enclosureConcept");
        assertEquals("WALL_MOUNT", gasEnclosure.get("type"));
    }
}

