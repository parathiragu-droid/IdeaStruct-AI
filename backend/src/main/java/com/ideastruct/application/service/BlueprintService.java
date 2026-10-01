package com.ideastruct.application.service;

import com.ideastruct.infrastructure.ai.AiBlueprintProvider;
import com.ideastruct.infrastructure.ai.DemoBlueprintProvider;
import com.ideastruct.api.dto.RegenerateRequest;
import com.ideastruct.api.dto.RegenerateResponse;
import com.ideastruct.exception.BadRequestException;
import com.ideastruct.exception.ConflictException;
import com.ideastruct.exception.ResourceNotFoundException;
import com.ideastruct.domain.model.GenerationMetadata;
import com.ideastruct.domain.model.Project;
import com.ideastruct.infrastructure.database.repository.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@SuppressWarnings("null")
public class BlueprintService {

    private static final Logger log = LoggerFactory.getLogger(BlueprintService.class);

    private static final Set<String> ALLOWED_SECTIONS = Set.of(
            "all", "overview", "features", "roles", "requirements",
            "database", "apis", "uiScreens", "roadmap", "assumptions", "openQuestions",
            "projectType", "classification", "estimates", "software", "hardware", "risks", "recommendations", "prototype"
    );

    private final ProjectRepository projectRepository;
    private final AiBlueprintProvider liveProvider;
    private final DemoBlueprintProvider demoProvider;
    private final com.ideastruct.domain.validation.ValidationRuleEngine validationRuleEngine;

    public BlueprintService(
            ProjectRepository projectRepository,
            @Qualifier("geminiAiBlueprintProvider") AiBlueprintProvider liveProvider,
            DemoBlueprintProvider demoProvider,
            com.ideastruct.domain.validation.ValidationRuleEngine validationRuleEngine) {
        this.projectRepository = projectRepository;
        this.liveProvider = liveProvider;
        this.demoProvider = demoProvider;
        this.validationRuleEngine = validationRuleEngine;
    }

    public Project generateInitialBlueprint(String projectId, Long expectedRevision, String requestedMode) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (expectedRevision == null) {
            throw new BadRequestException("expectedRevision is required for blueprint generation.");
        }

        if (project.getRevision() != expectedRevision) {
            throw new ConflictException(
                    String.format("Revision conflict: current project revision is %d, expected %d.",
                            project.getRevision(), expectedRevision),
                    project.getRevision(), expectedRevision);
        }

        if (project.getBlueprint() != null && !project.getBlueprint().isEmpty()) {
            throw new ConflictException(
                    "Project already has an existing blueprint. Use regenerate to propose modifications.",
                    project.getRevision(), expectedRevision);
        }

        AiBlueprintProvider selectedProvider = selectProvider(requestedMode);

        log.info("Generating initial blueprint for project '{}' using source '{}' (provider: '{}')",
                project.getTitle(), selectedProvider.getSource(), selectedProvider.getProviderName());

        Map<String, Object> generatedBlueprint;
        try {
            if (project.getTypeOverride() != null) {
                generatedBlueprint = selectedProvider.generateBlueprint(project.getTitle(), project.getIdea(), project.getTypeOverride());
            } else {
                generatedBlueprint = selectedProvider.generateBlueprint(project.getTitle(), project.getIdea());
            }
        } catch (Exception ex) {
            project.setLastGenerationError(ex.getMessage());
            projectRepository.save(project);
            throw ex;
        }

        Project freshProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project disappeared while generating blueprint: " + projectId));

        if (freshProject.getRevision() != expectedRevision) {
            throw new ConflictException(
                    String.format("Concurrent modification detected while generating blueprint. Current revision is %d, expected %d.",
                            freshProject.getRevision(), expectedRevision),
                    freshProject.getRevision(), expectedRevision);
        }

        String ideaHash = ProjectService.computeIdeaHash(freshProject.getIdea());

        Map<String, Object> normalizedBlueprint = normalizeBlueprint(generatedBlueprint, freshProject.getTypeOverride());
        freshProject.setBlueprint(normalizedBlueprint);
        freshProject.setBlueprintBasedOnIdeaHash(ideaHash);
        freshProject.setBlueprintOutdated(false);
        freshProject.setGenerationMetadata(new GenerationMetadata(
                selectedProvider.getSource(),
                selectedProvider.getProviderName(),
                selectedProvider.getModelName(),
                Instant.now()
        ));
        freshProject.setRevision(freshProject.getRevision() + 1);
        freshProject.setUpdatedAt(Instant.now());
        freshProject.setLastGenerationError(null);

        // Deterministic validation findings
        freshProject.setValidationIssues(validationRuleEngine.validate(normalizedBlueprint));
        freshProject.setValidationCheckedAt(Instant.now());

        return projectRepository.save(freshProject);
    }

    public Project updateBlueprint(String projectId, Map<String, Object> newBlueprint, Long expectedRevision) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (expectedRevision == null) {
            throw new BadRequestException("Expected revision must be provided via If-Match header or expectedRevision field.");
        }

        if (project.getRevision() != expectedRevision) {
            throw new ConflictException(
                    String.format("Revision conflict: current revision is %d, expected %d.",
                            project.getRevision(), expectedRevision),
                    project.getRevision(), expectedRevision);
        }

        validateBlueprintStructure(newBlueprint);
        Map<String, Object> normalized = normalizeBlueprint(newBlueprint, project.getTypeOverride());

        project.setBlueprint(normalized);
        if (project.getGenerationMetadata() != null) {
            project.getGenerationMetadata().setSource("USER_EDITED");
            project.getGenerationMetadata().setProvider(null);
            project.getGenerationMetadata().setModel(null);
            project.getGenerationMetadata().setGeneratedAt(Instant.now());
        } else {
            project.setGenerationMetadata(new GenerationMetadata("USER_EDITED", null, null, Instant.now()));
        }

        project.setRevision(project.getRevision() + 1);
        project.setUpdatedAt(Instant.now());

        // Update validation findings on save
        project.setValidationIssues(validationRuleEngine.validate(normalized));
        project.setValidationCheckedAt(Instant.now());

        return projectRepository.save(project);
    }

    public RegenerateResponse proposeRegeneration(String projectId, RegenerateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (request.getExpectedRevision() == null) {
            throw new BadRequestException("expectedRevision is required for regeneration review.");
        }

        if (project.getRevision() != request.getExpectedRevision()) {
            throw new ConflictException(
                    String.format("Revision conflict: current revision is %d, expected %d.",
                            project.getRevision(), request.getExpectedRevision()),
                    project.getRevision(), request.getExpectedRevision());
        }

        if (project.getBlueprint() == null || project.getBlueprint().isEmpty()) {
            throw new BadRequestException("No blueprint exists to regenerate. Generate an initial blueprint first.");
        }

        String targetSection = request.getSection() != null ? request.getSection().trim() : "all";
        if (!ALLOWED_SECTIONS.contains(targetSection)) {
            throw new BadRequestException("Unsupported regeneration section: " + targetSection + ". Allowed: " + ALLOWED_SECTIONS);
        }

        AiBlueprintProvider selectedProvider = selectProvider(request.getMode());

        String promptContext = project.getIdea();
        if (request.getInstructions() != null && !request.getInstructions().isBlank()) {
            promptContext += "\n\nADDITIONAL REVISION INSTRUCTIONS:\n" + request.getInstructions().trim();
        }

        log.info("Proposing regeneration for section '{}' on project '{}'", targetSection, project.getTitle());

        String intendedType = project.getTypeOverride();
        if ((intendedType == null || intendedType.isBlank() || "AUTO".equalsIgnoreCase(intendedType))
                && project.getBlueprint() != null && project.getBlueprint().containsKey("projectType")) {
            intendedType = String.valueOf(project.getBlueprint().get("projectType"));
        }

        Map<String, Object> freshGenerated = selectedProvider.generateBlueprint(project.getTitle(), promptContext, intendedType);
        freshGenerated = normalizeBlueprint(freshGenerated, intendedType);

        Map<String, Object> candidate;
        String diffSummary;

        if ("all".equalsIgnoreCase(targetSection)) {
            candidate = freshGenerated;
            diffSummary = "Full blueprint regenerated with candidate proposals across all sections.";
        } else {
            // Section-level regeneration: Merge ONLY the target section into an exact clone of the saved blueprint
            candidate = new LinkedHashMap<>(project.getBlueprint());
            Object freshSectionData = freshGenerated.get(targetSection);
            if (freshSectionData != null) {
                candidate.put(targetSection, freshSectionData);
                diffSummary = String.format("Candidate update for section '%s'. All other blueprint sections preserved untouched.", targetSection);
            } else {
                candidate = freshGenerated;
                diffSummary = String.format("Full candidate returned as section '%s' was not individually isolatable.", targetSection);
            }
        }

        // Validate candidate structure before proposing to user
        validateBlueprintStructure(candidate);

        // Return candidate proposal WITHOUT overwriting saved database state
        return new RegenerateResponse(project.getRevision(), targetSection, candidate, diffSummary);
    }

    private AiBlueprintProvider selectProvider(String requestedMode) {
        if ("LIVE_AI".equalsIgnoreCase(requestedMode)) {
            if (!liveProvider.isAvailable()) {
                throw new BadRequestException("Live AI generation requested, but GEMINI_API_KEY is not configured in backend environment.");
            }
            return liveProvider;
        } else if ("DEMO".equalsIgnoreCase(requestedMode)) {
            return demoProvider;
        } else {
            return liveProvider.isAvailable() ? liveProvider : demoProvider;
        }
    }

    public static final Set<String> ALLOWED_PROTOTYPE_COMPONENTS = Set.of(
            "Heading", "Text", "Button", "Input", "Textarea", "Select", "Card", "List", "Table",
            "ImagePlaceholder", "Navbar", "Sidebar", "Tabs", "Badge", "Form", "Modal", "StatCard"
    );

    public static final Set<String> ALLOWED_PROTOTYPE_ACTIONS = Set.of(
            "NAVIGATE", "OPEN_MODAL", "CLOSE_MODAL", "SET_VALUE", "SUBMIT_DEMO", "SHOW_MESSAGE",
            "FILTER_DEMO_DATA", "SELECT_ITEM", "BACK"
    );

    public static final Set<String> ALLOWED_3D_PRIMITIVES = Set.of(
            "BOX", "CYLINDER", "SPHERE", "BOARD", "SENSOR_MODULE", "DISPLAY_PANEL",
            "LED", "BUTTON", "BUZZER", "CONNECTOR", "GENERIC_MODULE"
    );

    public static Map<String, Object> normalizeBlueprint(Map<String, Object> input) {
        return normalizeBlueprint(input, null);
    }

    public static Map<String, Object> normalizeBlueprint(Map<String, Object> input, String typeOverride) {
        if (input == null) return null;
        Map<String, Object> bp;
        try {
            input.putIfAbsent("__probe__", "__probe__");
            input.remove("__probe__");
            bp = input;
        } catch (UnsupportedOperationException e) {
            bp = new LinkedHashMap<>(input);
        }

        if (typeOverride != null && !typeOverride.isBlank() && !"AUTO".equalsIgnoreCase(typeOverride)) {
            String upper = typeOverride.toUpperCase(java.util.Locale.ROOT);
            bp.put("projectType", upper);
            Map<String, Object> cl = new LinkedHashMap<>();
            cl.put("type", upper);
            cl.put("reason", "Manual project type override specified as " + upper + ".");
            cl.put("confidence", "HIGH");
            bp.put("classification", cl);
        } else {
            boolean hadExplicitProjectType = bp.containsKey("projectType") && bp.get("projectType") != null;
            if (!hadExplicitProjectType) {
                if (bp.containsKey("hardware") && bp.get("hardware") instanceof Map &&
                        Boolean.TRUE.equals(((Map<?, ?>) bp.get("hardware")).get("applicable"))) {
                    if (bp.containsKey("software") && bp.get("software") instanceof Map &&
                            Boolean.TRUE.equals(((Map<?, ?>) bp.get("software")).get("applicable"))) {
                        bp.put("projectType", "HYBRID");
                    } else {
                        bp.put("projectType", "HARDWARE");
                    }
                } else {
                    bp.put("projectType", "SOFTWARE");
                }
            }
            if (!bp.containsKey("classification") || !(bp.get("classification") instanceof Map)) {
                Map<String, Object> cl = new LinkedHashMap<>();
                String assignedType = String.valueOf(bp.get("projectType"));
                cl.put("type", assignedType);

                if (hadExplicitProjectType) {
                    cl.put("reason", "Inferred classification from explicit projectType in blueprint.");
                    cl.put("confidence", "HIGH");
                } else {
                    // Truthful legacy v1 blueprint normalization
                    boolean hasFullSoftwareArtifacts = bp.containsKey("database") && bp.get("database") instanceof Map
                            && bp.containsKey("apis") && bp.get("apis") instanceof Iterable
                            && bp.containsKey("uiScreens") && bp.get("uiScreens") instanceof Iterable;

                    if ("SOFTWARE".equals(assignedType)) {
                        if (hasFullSoftwareArtifacts) {
                            cl.put("reason", "Legacy v1 blueprint contains verified software artifacts (database collections, REST APIs, and UI screens).");
                            cl.put("confidence", "HIGH");
                        } else {
                            cl.put("reason", "Legacy v1 blueprint normalized to SOFTWARE by default; baseline software requirements present.");
                            cl.put("confidence", "MEDIUM");
                        }
                    } else if ("HYBRID".equals(assignedType)) {
                        cl.put("reason", "Legacy blueprint contains both active software and hardware sections.");
                        cl.put("confidence", "MEDIUM");
                    } else {
                        cl.put("reason", "Legacy blueprint contains active hardware section.");
                        cl.put("confidence", "MEDIUM");
                    }
                }
                bp.put("classification", cl);
            }
        }
        // Mirror software.database <-> root database if one is missing
        if (bp.containsKey("software") && bp.get("software") instanceof Map) {
            Map<String, Object> sw;
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> rawSw = (Map<String, Object>) bp.get("software");
                rawSw.putIfAbsent("__probe__", "__probe__");
                rawSw.remove("__probe__");
                sw = rawSw;
            } catch (UnsupportedOperationException e) {
                @SuppressWarnings("unchecked")
                Map<String, Object> rawSw = (Map<String, Object>) bp.get("software");
                sw = new LinkedHashMap<>(rawSw);
                bp.put("software", sw);
            }
            if (!bp.containsKey("database") && sw.containsKey("database")) {
                bp.put("database", sw.get("database"));
            } else if (bp.containsKey("database") && !sw.containsKey("database")) {
                sw.put("database", bp.get("database"));
            }
            if (!bp.containsKey("apis") && sw.containsKey("apis")) {
                bp.put("apis", sw.get("apis"));
            } else if (bp.containsKey("apis") && !sw.containsKey("apis")) {
                sw.put("apis", bp.get("apis"));
            }
            if (!bp.containsKey("uiScreens") && sw.containsKey("screens")) {
                bp.put("uiScreens", sw.get("screens"));
            } else if (!bp.containsKey("uiScreens") && sw.containsKey("uiScreens")) {
                bp.put("uiScreens", sw.get("uiScreens"));
            } else if (bp.containsKey("uiScreens") && !sw.containsKey("screens")) {
                sw.put("screens", bp.get("uiScreens"));
            }
        }

        // Canonical normalization for roadmap phases (converts string completionCriteria/tasks into Lists)
        if (bp.containsKey("roadmap") && bp.get("roadmap") instanceof List<?> rawRoadmap) {
            List<Map<String, Object>> normalizedRoadmap = new ArrayList<>();
            for (Object phaseObj : rawRoadmap) {
                if (phaseObj instanceof Map<?, ?> rawPhase) {
                    Map<String, Object> phase = new LinkedHashMap<>();
                    for (Map.Entry<?, ?> entry : rawPhase.entrySet()) {
                        phase.put(String.valueOf(entry.getKey()), entry.getValue());
                    }
                    Object cc = phase.get("completionCriteria");
                    if (cc instanceof String s) {
                        phase.put("completionCriteria", s.isBlank() ? Collections.emptyList() : List.of(s.trim()));
                    } else if (cc == null) {
                        phase.put("completionCriteria", Collections.emptyList());
                    }
                    Object tasks = phase.get("tasks");
                    if (tasks instanceof String s) {
                        phase.put("tasks", s.isBlank() ? Collections.emptyList() : List.of(s.trim()));
                    } else if (tasks == null) {
                        phase.put("tasks", Collections.emptyList());
                    }
                    Object fIds = phase.get("featureIds");
                    if (fIds instanceof String s) {
                        phase.put("featureIds", s.isBlank() ? Collections.emptyList() : List.of(s.trim()));
                    } else if (fIds == null) {
                        phase.put("featureIds", Collections.emptyList());
                    }
                    Object depIds = phase.get("dependsOnPhaseIds");
                    if (depIds instanceof String s) {
                        phase.put("dependsOnPhaseIds", s.isBlank() ? Collections.emptyList() : List.of(s.trim()));
                    } else if (depIds == null) {
                        phase.put("dependsOnPhaseIds", Collections.emptyList());
                    }
                    normalizedRoadmap.add(phase);
                }
            }
            bp.put("roadmap", normalizedRoadmap);
        }
        return bp;
    }

    private void validateBlueprintStructure(Map<String, Object> bp) {
        if (bp == null) {
            throw new BadRequestException("Blueprint cannot be null.");
        }

        String projectType = bp.containsKey("projectType") && bp.get("projectType") != null
                ? String.valueOf(bp.get("projectType")).toUpperCase()
                : null;

        if (projectType != null && !"SOFTWARE".equals(projectType) && !"HARDWARE".equals(projectType) && !"HYBRID".equals(projectType)) {
            throw new BadRequestException("Invalid projectType in blueprint: " + projectType + ". Allowed: SOFTWARE, HARDWARE, HYBRID.");
        }

        String[] requiredSections = {
                "schemaVersion", "overview", "features", "roles", "requirements",
                "database", "apis", "uiScreens", "roadmap", "assumptions", "openQuestions"
        };
        for (String section : requiredSections) {
            if ("HARDWARE".equalsIgnoreCase(projectType) && ("database".equals(section) || "apis".equals(section) || "uiScreens".equals(section))) {
                continue;
            }
            if (!bp.containsKey(section) || bp.get(section) == null) {
                throw new BadRequestException("Blueprint is missing required top-level section: " + section);
            }
        }

        Object versionObj = bp.get("schemaVersion");
        String schemaVersion = versionObj != null ? String.valueOf(versionObj) : "";
        if (!"1.0".equals(schemaVersion) && !"2.0".equals(schemaVersion)) {
            throw new BadRequestException("Unsupported blueprint schemaVersion: " + schemaVersion + ". Expected '1.0' or '2.0'.");
        }

        if ("HARDWARE".equalsIgnoreCase(projectType) || "HYBRID".equalsIgnoreCase(projectType)) {
            if (!bp.containsKey("hardware") || bp.get("hardware") == null) {
                throw new BadRequestException("Blueprint is missing required top-level section: hardware");
            }
        }

        if (!(bp.get("overview") instanceof Map)) {
            throw new BadRequestException("Section 'overview' must be a JSON object.");
        }
        if (bp.containsKey("database") && bp.get("database") != null && !(bp.get("database") instanceof Map)) {
            throw new BadRequestException("Section 'database' must be a JSON object.");
        }

        String[] listSections = {
                "features", "roles", "requirements", "roadmap", "assumptions", "openQuestions"
        };
        for (String listSection : listSections) {
            if (!(bp.get(listSection) instanceof Iterable)) {
                throw new BadRequestException("Section '" + listSection + "' must be a JSON array/list.");
            }
        }
        if (bp.containsKey("apis") && bp.get("apis") != null && !(bp.get("apis") instanceof Iterable)) {
            throw new BadRequestException("Section 'apis' must be a JSON array/list.");
        }
        if (bp.containsKey("uiScreens") && bp.get("uiScreens") != null && !(bp.get("uiScreens") instanceof Iterable)) {
            throw new BadRequestException("Section 'uiScreens' must be a JSON array/list.");
        }

        // Schema 2.0 Authoritative Validation for Prototype & Hardware Primitives
        if ("2.0".equals(schemaVersion)) {
            validateSchemaV2Extensions(bp);
        }
    }

    private void validateSchemaV2Extensions(Map<String, Object> bp) {
        if (bp.containsKey("classification") && bp.get("classification") != null) {
            if (!(bp.get("classification") instanceof Map)) {
                throw new BadRequestException("Section 'classification' must be a JSON object.");
            }
        }

        if (bp.containsKey("estimates") && bp.get("estimates") != null) {
            if (!(bp.get("estimates") instanceof Map)) {
                throw new BadRequestException("Section 'estimates' must be a JSON object.");
            }
        }

        // Prototype Validation under software.prototype or root prototype
        Object protoObj = null;
        if (bp.get("software") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> sw = (Map<String, Object>) bp.get("software");
            protoObj = sw.get("prototype");
        }
        if (protoObj == null && bp.get("prototype") instanceof Map) {
            protoObj = bp.get("prototype");
        }

        if (protoObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> proto = (Map<String, Object>) protoObj;
            if (proto.containsKey("screens") && proto.get("screens") instanceof Iterable) {
                Iterable<?> screens = (Iterable<?>) proto.get("screens");
                for (Object scrObj : screens) {
                    if (scrObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> screen = (Map<String, Object>) scrObj;
                        if (screen.containsKey("components") && screen.get("components") instanceof Iterable) {
                            Iterable<?> components = (Iterable<?>) screen.get("components");
                            for (Object cmpObj : components) {
                                if (cmpObj instanceof Map) {
                                    @SuppressWarnings("unchecked")
                                    Map<String, Object> cmp = (Map<String, Object>) cmpObj;
                                    String cmpType = String.valueOf(cmp.get("type"));
                                    if (cmp.get("type") != null && !ALLOWED_PROTOTYPE_COMPONENTS.contains(cmpType)) {
                                        throw new BadRequestException("Unknown prototype component type: " + cmpType + ". Allowed: " + ALLOWED_PROTOTYPE_COMPONENTS);
                                    }
                                    if (cmp.containsKey("action") && cmp.get("action") instanceof Map) {
                                        @SuppressWarnings("unchecked")
                                        Map<String, Object> act = (Map<String, Object>) cmp.get("action");
                                        String actType = String.valueOf(act.getOrDefault("type", act.get("kind")));
                                        if (!ALLOWED_PROTOTYPE_ACTIONS.contains(actType)) {
                                            throw new BadRequestException("Unknown prototype action type: " + actType + ". Allowed: " + ALLOWED_PROTOTYPE_ACTIONS);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Hardware 3D Model Primitive Validation
        if (bp.get("hardware") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> hw = (Map<String, Object>) bp.get("hardware");
            if (hw.get("threeDModel") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> threeD = (Map<String, Object>) hw.get("threeDModel");
                if (threeD.get("components") instanceof Iterable) {
                    Iterable<?> comps = (Iterable<?>) threeD.get("components");
                    for (Object cObj : comps) {
                        if (cObj instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> c = (Map<String, Object>) cObj;
                            String primType = String.valueOf(c.get("type"));
                            if (c.get("type") != null && !ALLOWED_3D_PRIMITIVES.contains(primType.toUpperCase(java.util.Locale.ROOT))) {
                                throw new BadRequestException("Unknown 3D model primitive type: " + primType + ". Allowed: " + ALLOWED_3D_PRIMITIVES);
                            }
                        }
                    }
                }
            }
            if (hw.get("spatialLayout3D") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> spatial = (Map<String, Object>) hw.get("spatialLayout3D");
                if (spatial.get("componentPlacements") instanceof Iterable) {
                    Iterable<?> comps = (Iterable<?>) spatial.get("componentPlacements");
                    for (Object cObj : comps) {
                        if (cObj instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> c = (Map<String, Object>) cObj;
                            Object primObj = c.getOrDefault("primitive", c.get("type"));
                            if (primObj != null) {
                                String primType = String.valueOf(primObj);
                                if (!ALLOWED_3D_PRIMITIVES.contains(primType.toUpperCase(java.util.Locale.ROOT))) {
                                    throw new BadRequestException("Unknown 3D spatial primitive type: " + primType + ". Allowed: " + ALLOWED_3D_PRIMITIVES);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
