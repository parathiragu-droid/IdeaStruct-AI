package com.ideastruct.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ideastruct.exception.BadRequestException;
import com.ideastruct.exception.ConflictException;
import com.ideastruct.exception.ResourceNotFoundException;
import com.ideastruct.domain.model.Project;
import com.ideastruct.domain.model.ValidationIssue;
import com.ideastruct.infrastructure.database.repository.ProjectRepository;
import com.ideastruct.domain.validation.ValidationRuleEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ValidationServiceTest {

    private ProjectRepository projectRepository;
    private ValidationRuleEngine validationRuleEngine;
    private ValidationService validationService;
    private ObjectMapper objectMapper;
    private Map<String, Object> canonicalBlueprint;

    @BeforeEach
    void setUp() throws Exception {
        projectRepository = mock(ProjectRepository.class);
        validationRuleEngine = new ValidationRuleEngine();
        validationService = new ValidationService(projectRepository, validationRuleEngine);
        objectMapper = new ObjectMapper();

        try (InputStream is = getClass().getResourceAsStream("/fixtures/food_ordering_blueprint.json")) {
            assertNotNull(is, "food_ordering_blueprint.json fixture must be present");
            canonicalBlueprint = objectMapper.readValue(is, new TypeReference<Map<String, Object>>() {});
        }
    }

    @Test
    @DisplayName("Validation fails when project is not found")
    void shouldThrowWhenProjectNotFound() {
        when(projectRepository.findById("missing-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                validationService.validateProject("missing-id", null));
    }

    @Test
    @DisplayName("Validation fails on revision conflict")
    void shouldThrowOnRevisionConflict() {
        Project project = new Project("Test", "Valid test idea with enough characters for bounds.");
        project.setId("p1");
        project.setRevision(2L);
        when(projectRepository.findById("p1")).thenReturn(Optional.of(project));

        assertThrows(ConflictException.class, () ->
                validationService.validateProject("p1", 1L));
    }

    @Test
    @DisplayName("Validation fails when blueprint is null or empty")
    void shouldThrowWhenBlueprintNull() {
        Project project = new Project("Test", "Valid test idea with enough characters for bounds.");
        project.setId("p1");
        project.setRevision(1L);
        project.setBlueprint(null);
        when(projectRepository.findById("p1")).thenReturn(Optional.of(project));

        assertThrows(BadRequestException.class, () ->
                validationService.validateProject("p1", 1L));
    }

    @Test
    @DisplayName("Canonical blueprint passes validation with zero errors and zero warnings")
    void shouldValidateCanonicalBlueprintWithNoErrors() {
        Project project = new Project("CampusBite", "Valid campus food app idea with over fifty characters for testing.");
        project.setId("p1");
        project.setRevision(1L);
        project.setBlueprint(canonicalBlueprint);

        when(projectRepository.findById("p1")).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project validated = validationService.validateProject("p1", 1L);

        assertNotNull(validated.getValidationCheckedAt());
        List<ValidationIssue> issues = validated.getValidationIssues();
        assertNotNull(issues);

        long errorCount = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).count();
        long warningCount = issues.stream().filter(i -> "WARNING".equals(i.getSeverity())).count();

        assertEquals(0, errorCount, "Canonical fixture should have 0 ERROR issues");
        assertEquals(0, warningCount, "Canonical fixture should have 0 WARNING issues");

        // Verify INFO and NEEDS_CLARIFICATION are captured from assumptions and open questions
        boolean hasClarifications = issues.stream().anyMatch(i -> "NEEDS_CLARIFICATION".equals(i.getSeverity()));
        boolean hasInfo = issues.stream().anyMatch(i -> "INFO".equals(i.getSeverity()));
        assertTrue(hasClarifications, "Open questions should produce NEEDS_CLARIFICATION findings");
        assertTrue(hasInfo, "Assumptions should produce INFO findings");
    }

    @Test
    @DisplayName("Rule 1: Detect duplicate entity IDs across sections")
    void shouldDetectDuplicateIds() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> features = (List<Map<String, Object>>) bp.get("features");
        // Duplicate feature ID
        Map<String, Object> dupFeature = new HashMap<>(features.get(0));
        features.add(dupFeature);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_DUPLICATE_ID".equals(i.getRuleCode())));
    }

    @Test
    @DisplayName("Rule 2: Detect feature requiring API with no mapping")
    void shouldDetectFeatureNeedingApiWithoutMapping() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> features = (List<Map<String, Object>>) bp.get("features");
        Map<String, Object> newFeat = new HashMap<>();
        newFeat.put("id", "feature-unmapped-api");
        newFeat.put("name", "Unmapped API Feature");
        newFeat.put("needsApi", true);
        features.add(newFeat);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_FEATURE_NO_API".equals(i.getRuleCode()) &&
                i.getAffectedEntityIds().contains("feature-unmapped-api")));
    }

    @Test
    @DisplayName("Rule 3: Detect feature requiring UI with no screen mapping")
    void shouldDetectFeatureNeedingUiWithoutMapping() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> features = (List<Map<String, Object>>) bp.get("features");
        Map<String, Object> newFeat = new HashMap<>();
        newFeat.put("id", "feature-unmapped-ui");
        newFeat.put("name", "Unmapped UI Feature");
        newFeat.put("needsUi", true);
        features.add(newFeat);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_FEATURE_NO_UI".equals(i.getRuleCode()) &&
                i.getAffectedEntityIds().contains("feature-unmapped-ui")));
    }

    @Test
    @DisplayName("Rule 4: Detect feature requiring persistence with no collection mapping")
    void shouldDetectFeatureNeedingDbWithoutMapping() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> features = (List<Map<String, Object>>) bp.get("features");
        Map<String, Object> newFeat = new HashMap<>();
        newFeat.put("id", "feature-unmapped-db");
        newFeat.put("name", "Unmapped DB Feature");
        newFeat.put("needsPersistence", true);
        features.add(newFeat);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_FEATURE_NO_PERSISTENCE".equals(i.getRuleCode()) &&
                i.getAffectedEntityIds().contains("feature-unmapped-db")));
    }

    @Test
    @DisplayName("Rule 5: Detect interactive role without UI screen")
    void shouldDetectInteractiveRoleWithoutScreen() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roles = (List<Map<String, Object>>) bp.get("roles");
        Map<String, Object> newRole = new HashMap<>();
        newRole.put("id", "role-auditor");
        newRole.put("name", "Financial Auditor");
        newRole.put("interactive", true);
        roles.add(newRole);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_ROLE_NO_UI".equals(i.getRuleCode()) &&
                i.getAffectedEntityIds().contains("role-auditor")));
    }

    @Test
    @DisplayName("Rule 6: Detect relationship with missing target collection")
    void shouldDetectMissingRelationshipTarget() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        Map<String, Object> db = (Map<String, Object>) bp.get("database");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rels = (List<Map<String, Object>>) db.get("relationships");

        Map<String, Object> brokenRel = new HashMap<>();
        brokenRel.put("id", "rel-broken-1");
        brokenRel.put("sourceCollectionId", "col-orders");
        brokenRel.put("targetCollectionId", "col-nonexistent");
        rels.add(brokenRel);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_RELATIONSHIP_MISSING_TARGET".equals(i.getRuleCode())));
    }

    @Test
    @DisplayName("Rule 7: Detect duplicate normalized API endpoints")
    void shouldDetectDuplicateNormalizedApiRoutes() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> apis = (List<Map<String, Object>>) bp.get("apis");

        Map<String, Object> conflictApi = new HashMap<>();
        conflictApi.put("id", "api-conflicting-order");
        conflictApi.put("method", "GET");
        // Canonical has GET /orders/{orderId}
        conflictApi.put("path", "/orders/{id}");
        apis.add(conflictApi);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_DUPLICATE_API_ROUTE".equals(i.getRuleCode())));
    }

    @Test
    @DisplayName("Rule 8: Detect broken screen navigation")
    void shouldDetectBrokenScreenNavigation() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> screens = (List<Map<String, Object>>) bp.get("uiScreens");
        Map<String, Object> screen = screens.get(0);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> actions = (List<Map<String, Object>>) screen.get("actions");

        Map<String, Object> brokenAction = new HashMap<>();
        brokenAction.put("id", "act-broken-nav");
        brokenAction.put("label", "Go nowhere");
        brokenAction.put("kind", "NAVIGATION");
        brokenAction.put("targetScreenId", "screen-does-not-exist");
        actions.add(brokenAction);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_SCREEN_BROKEN_NAVIGATION".equals(i.getRuleCode())));
    }

    @Test
    @DisplayName("Rule 9: Detect roadmap dependency cycle and missing phase")
    void shouldDetectRoadmapCycleAndMissingPhase() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roadmap = (List<Map<String, Object>>) bp.get("roadmap");

        // Introduce cycle: phase-1 depends on phase-2, phase-2 depends on phase-1
        Map<String, Object> p1 = roadmap.stream().filter(p -> "phase-foundation".equals(p.get("id"))).findFirst().orElseThrow();
        Map<String, Object> p2 = roadmap.stream().filter(p -> "phase-ordering-flow".equals(p.get("id"))).findFirst().orElseThrow();
        p1.put("dependsOnPhaseIds", List.of("phase-ordering-flow"));
        p2.put("dependsOnPhaseIds", List.of("phase-foundation"));

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_ROADMAP_CYCLE".equals(i.getRuleCode())));
    }

    @Test
    @DisplayName("Rule 10: Detect user-stated requirement without acceptance criteria")
    void shouldDetectRequirementWithoutCriteria() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> reqs = (List<Map<String, Object>>) bp.get("requirements");

        Map<String, Object> reqWithoutCriteria = new HashMap<>();
        reqWithoutCriteria.put("id", "req-no-crit");
        reqWithoutCriteria.put("source", "USER_STATED");
        reqWithoutCriteria.put("title", "Speedy Checkout");
        reqWithoutCriteria.put("acceptanceCriteria", Collections.emptyList());
        reqWithoutCriteria.put("featureIds", List.of("feature-place-order"));
        reqs.add(reqWithoutCriteria);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_REQUIREMENT_NO_CRITERIA".equals(i.getRuleCode())));
    }

    @Test
    @DisplayName("Fixture A: Feature needs API with no API mapping produces RULE_FEATURE_NO_API")
    void fixtureA_featureNeedsApiWithoutMapping() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> features = (List<Map<String, Object>>) bp.get("features");
        Map<String, Object> newFeat = new HashMap<>();
        newFeat.put("id", "feature-missing-api-coverage");
        newFeat.put("name", "Notification Dispatcher");
        newFeat.put("needsApi", true);
        features.add(newFeat);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        ValidationIssue issue = issues.stream()
                .filter(i -> "RULE_FEATURE_NO_API".equals(i.getRuleCode()))
                .findFirst().orElse(null);

        assertNotNull(issue, "Fixture A must produce RULE_FEATURE_NO_API");
        assertEquals("WARNING", issue.getSeverity());
        assertTrue(issue.getAffectedEntityIds().contains("feature-missing-api-coverage"));
    }

    @Test
    @DisplayName("Fixture B: Broken database relationship with missing source field and unsupported cardinality")
    void fixtureB_brokenDatabaseRelationship() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        Map<String, Object> db = (Map<String, Object>) bp.get("database");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rels = (List<Map<String, Object>>) db.get("relationships");

        Map<String, Object> brokenRel = new HashMap<>();
        brokenRel.put("id", "rel-broken-b");
        brokenRel.put("sourceCollectionId", "collection-orders");
        brokenRel.put("targetCollectionId", "collection-vendors");
        brokenRel.put("sourceField", "nonExistentFieldXYZ");
        brokenRel.put("targetField", "_id");
        brokenRel.put("cardinality", "INVALID_CARDINALITY");
        rels.add(brokenRel);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_RELATIONSHIP_MISSING_SOURCE_FIELD".equals(i.getRuleCode())),
                "Must detect missing source field");
        assertTrue(issues.stream().anyMatch(i -> "RULE_RELATIONSHIP_UNSUPPORTED_CARDINALITY".equals(i.getRuleCode())),
                "Must detect unsupported cardinality");
    }

    @Test
    @DisplayName("Fixture C: Roadmap dependency cycle A -> B -> C -> A and self-dependency")
    void fixtureC_roadmapDependencyCycleAndSelfDependency() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roadmap = (List<Map<String, Object>>) bp.get("roadmap");
        roadmap.clear();

        Map<String, Object> phaseA = new HashMap<>();
        phaseA.put("id", "phase-a");
        phaseA.put("name", "Phase A");
        phaseA.put("dependsOnPhaseIds", List.of("phase-b"));

        Map<String, Object> phaseB = new HashMap<>();
        phaseB.put("id", "phase-b");
        phaseB.put("name", "Phase B");
        phaseB.put("dependsOnPhaseIds", List.of("phase-c"));

        Map<String, Object> phaseC = new HashMap<>();
        phaseC.put("id", "phase-c");
        phaseC.put("name", "Phase C");
        phaseC.put("dependsOnPhaseIds", List.of("phase-a"));

        roadmap.add(phaseA);
        roadmap.add(phaseB);
        roadmap.add(phaseC);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_ROADMAP_CYCLE".equals(i.getRuleCode())),
                "Must detect 3-node cycle A -> B -> C -> A");

        // Test self-dependency
        phaseA.put("dependsOnPhaseIds", List.of("phase-a"));
        phaseB.put("dependsOnPhaseIds", Collections.emptyList());
        phaseC.put("dependsOnPhaseIds", Collections.emptyList());
        List<ValidationIssue> selfIssues = validationRuleEngine.validate(bp);
        assertTrue(selfIssues.stream().anyMatch(i -> "RULE_ROADMAP_SELF_DEPENDENCY".equals(i.getRuleCode())),
                "Must detect self-referential roadmap dependency");
    }

    @Test
    @DisplayName("Fixture D: Interactive role without screen coverage produces warning, automated role does not")
    void fixtureD_interactiveRoleWithoutScreen() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roles = (List<Map<String, Object>>) bp.get("roles");

        Map<String, Object> interactiveRole = new HashMap<>();
        interactiveRole.put("id", "role-support-agent");
        interactiveRole.put("name", "Support Agent");
        interactiveRole.put("interactive", true);
        roles.add(interactiveRole);

        Map<String, Object> automatedRole = new HashMap<>();
        automatedRole.put("id", "role-cron-worker");
        automatedRole.put("name", "Background Cron Worker");
        automatedRole.put("interactive", false);
        roles.add(automatedRole);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_ROLE_NO_UI".equals(i.getRuleCode()) &&
                i.getAffectedEntityIds().contains("role-support-agent")), "Interactive role must be flagged");
        assertFalse(issues.stream().anyMatch(i -> "RULE_ROLE_NO_UI".equals(i.getRuleCode()) &&
                i.getAffectedEntityIds().contains("role-cron-worker")), "Automated role must NOT be flagged");
    }

    @Test
    @DisplayName("Fixture E: USER_STATED requirement without acceptance criteria produces warning")
    void fixtureE_userStatedReqWithoutCriteria() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> reqs = (List<Map<String, Object>>) bp.get("requirements");

        Map<String, Object> req = new HashMap<>();
        req.put("id", "req-user-blank-criteria");
        req.put("source", "USER_STATED");
        req.put("title", "High Security Checkout");
        req.put("acceptanceCriteria", List.of("   ", ""));
        req.put("featureIds", List.of("feature-place-order"));
        reqs.add(req);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_REQUIREMENT_NO_CRITERIA".equals(i.getRuleCode()) &&
                i.getAffectedEntityIds().contains("req-user-blank-criteria")), "Whitespace criteria must be flagged");
    }

    @Test
    @DisplayName("Fixture F: Valid static website produces zero errors and zero warnings")
    void fixtureF_validStaticWebsiteNoDbOrApi() {
        Map<String, Object> bp = new HashMap<>();
        bp.put("schemaVersion", "1.0");

        Map<String, Object> overview = new HashMap<>();
        overview.put("projectName", "Modern Architecture Studio Portfolio");
        overview.put("summary", "A static portfolio website showcasing architectural projects and design philosophies.");
        bp.put("overview", overview);

        List<Map<String, Object>> features = new ArrayList<>();
        Map<String, Object> f1 = new HashMap<>();
        f1.put("id", "feat-portfolio-gallery");
        f1.put("name", "Portfolio Project Gallery");
        f1.put("needsApi", false);
        f1.put("needsUi", true);
        f1.put("needsPersistence", false);
        f1.put("roleIds", List.of("role-visitor"));
        features.add(f1);
        bp.put("features", features);

        List<Map<String, Object>> roles = new ArrayList<>();
        Map<String, Object> r1 = new HashMap<>();
        r1.put("id", "role-visitor");
        r1.put("name", "Site Visitor");
        r1.put("interactive", true);
        roles.add(r1);
        bp.put("roles", roles);

        List<Map<String, Object>> screens = new ArrayList<>();
        Map<String, Object> s1 = new HashMap<>();
        s1.put("id", "screen-gallery");
        s1.put("name", "Gallery Page");
        s1.put("featureIds", List.of("feat-portfolio-gallery"));
        s1.put("roleIds", List.of("role-visitor"));
        s1.put("actions", Collections.emptyList());
        screens.add(s1);
        bp.put("uiScreens", screens);

        Map<String, Object> db = new HashMap<>();
        db.put("collections", Collections.emptyList());
        db.put("relationships", Collections.emptyList());
        bp.put("database", db);

        bp.put("apis", Collections.emptyList());
        bp.put("requirements", Collections.emptyList());
        bp.put("roadmap", Collections.emptyList());
        bp.put("assumptions", Collections.emptyList());
        bp.put("openQuestions", Collections.emptyList());

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        long errorCount = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).count();
        long warningCount = issues.stream().filter(i -> "WARNING".equals(i.getSeverity())).count();

        assertEquals(0, errorCount, "Static website must produce 0 ERROR issues");
        assertEquals(0, warningCount, "Static website must not produce false-positive DB or API warnings");
    }

    @Test
    @DisplayName("Cross-entity missing reference validation detects broken links across all collections")
    void shouldDetectCrossEntityMissingReferences() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);

        // 1. feature referencing missing role
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> features = (List<Map<String, Object>>) bp.get("features");
        features.get(0).put("roleIds", List.of("role-ghost-user"));

        // 2. requirement referencing missing feature
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> reqs = (List<Map<String, Object>>) bp.get("requirements");
        reqs.get(0).put("featureIds", List.of("feature-ghost"));

        // 3. API referencing missing feature and missing role
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> apis = (List<Map<String, Object>>) bp.get("apis");
        apis.get(0).put("featureIds", List.of("feature-ghost-api"));
        apis.get(0).put("roleIds", List.of("role-ghost-api"));

        // 4. UI screen referencing missing feature and missing role
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> screens = (List<Map<String, Object>>) bp.get("uiScreens");
        screens.get(0).put("featureIds", List.of("feature-ghost-screen"));
        screens.get(0).put("roleIds", List.of("role-ghost-screen"));

        // 5. Roadmap referencing missing feature
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roadmap = (List<Map<String, Object>>) bp.get("roadmap");
        roadmap.get(0).put("featureIds", List.of("feature-ghost-phase"));

        // 6. Database collection referencing missing feature
        @SuppressWarnings("unchecked")
        Map<String, Object> db = (Map<String, Object>) bp.get("database");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> colls = (List<Map<String, Object>>) db.get("collections");
        colls.get(0).put("featureIds", List.of("feature-ghost-db"));

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);

        assertTrue(issues.stream().anyMatch(i -> "RULE_FEATURE_MISSING_ROLE".equals(i.getRuleCode())));
        assertTrue(issues.stream().anyMatch(i -> "RULE_REQUIREMENT_MISSING_FEATURE".equals(i.getRuleCode())));
        assertTrue(issues.stream().anyMatch(i -> "RULE_API_MISSING_FEATURE".equals(i.getRuleCode())));
        assertTrue(issues.stream().anyMatch(i -> "RULE_API_MISSING_ROLE".equals(i.getRuleCode())));
        assertTrue(issues.stream().anyMatch(i -> "RULE_SCREEN_MISSING_FEATURE".equals(i.getRuleCode())));
        assertTrue(issues.stream().anyMatch(i -> "RULE_SCREEN_MISSING_ROLE".equals(i.getRuleCode())));
        assertTrue(issues.stream().anyMatch(i -> "RULE_ROADMAP_MISSING_FEATURE".equals(i.getRuleCode())));
        assertTrue(issues.stream().anyMatch(i -> "RULE_COLLECTION_MISSING_FEATURE".equals(i.getRuleCode())));
    }

    @Test
    @DisplayName("Validation fails when concurrent modification detected before save")
    void shouldThrowConflictWhenRevisionChangesDuringValidation() {
        Project pInitial = new Project("Test App", "Test idea with sufficient characters for bounds.");
        pInitial.setId("p1");
        pInitial.setRevision(1L);
        pInitial.setBlueprint(canonicalBlueprint);

        Project pAdvanced = new Project("Test App", "Test idea with sufficient characters for bounds.");
        pAdvanced.setId("p1");
        pAdvanced.setRevision(2L); // advanced concurrently
        pAdvanced.setBlueprint(canonicalBlueprint);

        when(projectRepository.findById("p1")).thenReturn(Optional.of(pInitial)).thenReturn(Optional.of(pAdvanced));

        assertThrows(ConflictException.class, () ->
                validationService.validateProject("p1", 1L));
    }

    @Test
    @DisplayName("Validation findings are deterministic across multiple executions on same blueprint")
    void validationShouldBeDeterministic() {
        List<ValidationIssue> run1 = validationRuleEngine.validate(canonicalBlueprint);
        List<ValidationIssue> run2 = validationRuleEngine.validate(canonicalBlueprint);
        List<ValidationIssue> run3 = validationRuleEngine.validate(canonicalBlueprint);

        assertEquals(run1.size(), run2.size());
        assertEquals(run2.size(), run3.size());

        for (int i = 0; i < run1.size(); i++) {
            assertEquals(run1.get(i).getId(), run2.get(i).getId());
            assertEquals(run1.get(i).getRuleCode(), run2.get(i).getRuleCode());
            assertEquals(run1.get(i).getSeverity(), run2.get(i).getSeverity());
            assertEquals(run1.get(i).getMessage(), run2.get(i).getMessage());
            assertEquals(run1.get(i).getEvidence(), run2.get(i).getEvidence());
        }
    }


    @Test
    @DisplayName("Hardware blueprint fixture validates with zero errors")
    void shouldValidateHardwareFixtureWithZeroErrors() throws Exception {
        Map<String, Object> hwBp;
        try (InputStream is = getClass().getResourceAsStream("/fixtures/hardware_blueprint.json")) {
            assertNotNull(is, "hardware_blueprint.json fixture must be present");
            hwBp = objectMapper.readValue(is, new TypeReference<Map<String, Object>>() {});
        }

        List<ValidationIssue> issues = validationRuleEngine.validate(hwBp);
        long errorCount = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).count();
        assertEquals(0, errorCount, "Hardware canonical fixture should have 0 ERROR issues");
    }

    @Test
    @DisplayName("Hybrid blueprint fixture validates with zero errors")
    void shouldValidateHybridFixtureWithZeroErrors() throws Exception {
        Map<String, Object> hybridBp;
        try (InputStream is = getClass().getResourceAsStream("/fixtures/hybrid_blueprint.json")) {
            assertNotNull(is, "hybrid_blueprint.json fixture must be present");
            hybridBp = objectMapper.readValue(is, new TypeReference<Map<String, Object>>() {});
        }

        List<ValidationIssue> issues = validationRuleEngine.validate(hybridBp);
        long errorCount = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).count();
        assertEquals(0, errorCount, "Hybrid canonical fixture should have 0 ERROR issues");
    }

    @Test
    @DisplayName("Hardware agriculture fixture validates with zero errors")
    void shouldValidateHardwareAgricultureFixtureWithZeroErrors() throws Exception {
        Map<String, Object> bp;
        try (InputStream is = getClass().getResourceAsStream("/fixtures/hardware_agriculture_blueprint.json")) {
            assertNotNull(is, "hardware_agriculture_blueprint.json fixture must be present");
            bp = objectMapper.readValue(is, new TypeReference<Map<String, Object>>() {});
        }

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        long errorCount = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).count();
        assertEquals(0, errorCount, "Hardware agriculture fixture should have 0 ERROR issues");
    }

    @Test
    @DisplayName("Hardware wearable fixture validates with zero errors")
    void shouldValidateHardwareWearableFixtureWithZeroErrors() throws Exception {
        Map<String, Object> bp;
        try (InputStream is = getClass().getResourceAsStream("/fixtures/hardware_wearable_blueprint.json")) {
            assertNotNull(is, "hardware_wearable_blueprint.json fixture must be present");
            bp = objectMapper.readValue(is, new TypeReference<Map<String, Object>>() {});
        }

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        long errorCount = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).count();
        assertEquals(0, errorCount, "Hardware wearable fixture should have 0 ERROR issues");
    }

    @Test
    @DisplayName("Hardware robotics fixture validates with zero errors")
    void shouldValidateHardwareRoboticsFixtureWithZeroErrors() throws Exception {
        Map<String, Object> bp;
        try (InputStream is = getClass().getResourceAsStream("/fixtures/hardware_robotics_blueprint.json")) {
            assertNotNull(is, "hardware_robotics_blueprint.json fixture must be present");
            bp = objectMapper.readValue(is, new TypeReference<Map<String, Object>>() {});
        }

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        long errorCount = issues.stream().filter(i -> "ERROR".equals(i.getSeverity())).count();
        assertEquals(0, errorCount, "Hardware robotics fixture should have 0 ERROR issues");
    }

    @Test
    @DisplayName("Hardware validation catches unknown component in connection")
    void shouldCatchUnknownComponentInHardwareConnection() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        bp.put("projectType", "HARDWARE");

        Map<String, Object> hw = new HashMap<>();
        hw.put("applicable", true);
        hw.put("components", List.of(
                Map.of("id", "comp-esp32", "name", "ESP32", "category", "MICROCONTROLLER"),
                Map.of("id", "comp-pwr", "name", "Power", "category", "POWER")
        ));
        hw.put("connections", List.of(
                Map.of("id", "conn-broken", "fromComponentId", "comp-esp32", "toComponentId", "comp-ghost", "fromPin", "GPIO4", "toPin", "DATA")
        ));
        bp.put("hardware", hw);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_HW_UNKNOWN_COMPONENT_REFERENCE".equals(i.getRuleCode())),
                "Should report RULE_HW_UNKNOWN_COMPONENT_REFERENCE for ghost component");
    }

    @Test
    @DisplayName("Hardware validation warns when sensors exist but microcontroller is missing")
    void shouldWarnWhenMicrocontrollerMissing() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        bp.put("projectType", "HARDWARE");

        Map<String, Object> hw = new HashMap<>();
        hw.put("applicable", true);
        hw.put("components", List.of(
                Map.of("id", "comp-dht22", "name", "DHT22 Sensor", "category", "SENSOR"),
                Map.of("id", "comp-pwr", "name", "Power Supply", "category", "POWER")
        ));
        hw.put("connections", List.of());
        bp.put("hardware", hw);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_HW_MISSING_CONTROLLER".equals(i.getRuleCode())),
                "Should report RULE_HW_MISSING_CONTROLLER when sensor has no MCU");
    }

    @Test
    @DisplayName("Hardware validation warns when power source is missing")
    void shouldWarnWhenPowerSourceMissing() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        bp.put("projectType", "HARDWARE");

        Map<String, Object> hw = new HashMap<>();
        hw.put("applicable", true);
        hw.put("components", List.of(
                Map.of("id", "comp-esp32", "name", "ESP32", "category", "MICROCONTROLLER")
        ));
        hw.put("connections", List.of());
        bp.put("hardware", hw);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_HW_MISSING_POWER_SOURCE".equals(i.getRuleCode())),
                "Should report RULE_HW_MISSING_POWER_SOURCE");
    }

    @Test
    @DisplayName("Hardware validation detects duplicate pin connections")
    void shouldDetectDuplicatePinConnection() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        bp.put("projectType", "HARDWARE");

        Map<String, Object> hw = new HashMap<>();
        hw.put("applicable", true);
        hw.put("components", List.of(
                Map.of("id", "comp-esp32", "name", "ESP32", "category", "MICROCONTROLLER"),
                Map.of("id", "comp-pwr", "name", "Power Supply", "category", "POWER")
        ));
        hw.put("connections", List.of(
                Map.of("id", "conn-1", "fromComponentId", "comp-pwr", "fromPin", "5V", "toComponentId", "comp-esp32", "toPin", "VIN"),
                Map.of("id", "conn-2", "fromComponentId", "comp-pwr", "fromPin", "5V", "toComponentId", "comp-esp32", "toPin", "VIN")
        ));
        bp.put("hardware", hw);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_HW_DUPLICATE_CONNECTION".equals(i.getRuleCode())),
                "Should report RULE_HW_DUPLICATE_CONNECTION");
    }

    @Test
    @DisplayName("Hybrid validation warns when device integrations are missing")
    void shouldWarnWhenHybridIntegrationsMissing() {
        Map<String, Object> bp = deepCopy(canonicalBlueprint);
        bp.put("projectType", "HYBRID");
        bp.put("integrations", List.of()); // Empty integrations

        Map<String, Object> sw = new HashMap<>();
        sw.put("applicable", true);
        bp.put("software", sw);

        Map<String, Object> hw = new HashMap<>();
        hw.put("applicable", true);
        hw.put("components", List.of(
                Map.of("id", "comp-esp32", "name", "ESP32", "category", "MICROCONTROLLER"),
                Map.of("id", "comp-pwr", "name", "Power Supply", "category", "POWER")
        ));
        bp.put("hardware", hw);

        List<ValidationIssue> issues = validationRuleEngine.validate(bp);
        assertTrue(issues.stream().anyMatch(i -> "RULE_HYBRID_MISSING_INTEGRATIONS".equals(i.getRuleCode())),
                "Should report RULE_HYBRID_MISSING_INTEGRATIONS");
    }

    private Map<String, Object> deepCopy(Map<String, Object> original) {
        try {
            return objectMapper.readValue(objectMapper.writeValueAsString(original),
                    new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

