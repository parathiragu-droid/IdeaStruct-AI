package com.ideastruct.domain.validation;

import com.ideastruct.domain.model.ValidationIssue;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ValidationRuleEngine {

    public List<ValidationIssue> validate(Map<String, Object> blueprint) {
        List<ValidationIssue> issues = new ArrayList<>();
        if (blueprint == null || blueprint.isEmpty()) {
            issues.add(new ValidationIssue(
                    "val-empty-bp", "RULE_EMPTY_BLUEPRINT", "ERROR",
                    "Blueprint content is completely empty.",
                    List.of(), "Root map is null or empty",
                    "Generate or edit the blueprint to include required sections.",
                    "SERVER_DETERMINISTIC", "ACTIVE"
            ));
            return issues;
        }

        // Extract sections safely
        List<Map<String, Object>> features = getList(blueprint, "features");
        List<Map<String, Object>> roles = getList(blueprint, "roles");
        List<Map<String, Object>> requirements = getList(blueprint, "requirements");
        Map<String, Object> database = getMap(blueprint, "database");
        List<Map<String, Object>> collections = getList(database, "collections");
        List<Map<String, Object>> relationships = getList(database, "relationships");
        List<Map<String, Object>> apis = getList(blueprint, "apis");
        List<Map<String, Object>> screens = getList(blueprint, "uiScreens");
        List<Map<String, Object>> roadmap = getList(blueprint, "roadmap");
        List<Map<String, Object>> assumptions = getList(blueprint, "assumptions");
        List<Map<String, Object>> openQuestions = getList(blueprint, "openQuestions");

        // 1. Duplicate IDs & entity sets indexing
        Set<String> allIds = new HashSet<>();
        Map<String, String> idTypeMap = new HashMap<>();

        Set<String> featureIds = new HashSet<>();
        Set<String> roleIds = new HashSet<>();
        Set<String> requirementIds = new HashSet<>();
        Set<String> collectionIds = new HashSet<>();
        Set<String> relationshipIds = new HashSet<>();
        Set<String> apiIds = new HashSet<>();
        Set<String> screenIds = new HashSet<>();
        Set<String> phaseIds = new HashSet<>();

        indexEntities(features, "feature", allIds, idTypeMap, featureIds, issues);
        indexEntities(roles, "role", allIds, idTypeMap, roleIds, issues);
        indexEntities(requirements, "requirement", allIds, idTypeMap, requirementIds, issues);
        indexEntities(collections, "collection", allIds, idTypeMap, collectionIds, issues);
        indexEntities(relationships, "relationship", allIds, idTypeMap, relationshipIds, issues);
        indexEntities(apis, "api", allIds, idTypeMap, apiIds, issues);
        indexEntities(screens, "uiScreen", allIds, idTypeMap, screenIds, issues);
        indexEntities(roadmap, "phase", allIds, idTypeMap, phaseIds, issues);
        indexEntities(assumptions, "assumption", allIds, idTypeMap, new HashSet<>(), issues);
        indexEntities(openQuestions, "question", allIds, idTypeMap, new HashSet<>(), issues);

        // Pre-aggregate links for fast lookup
        Set<String> featuresWithApi = new HashSet<>();
        for (Map<String, Object> api : apis) {
            featuresWithApi.addAll(getStringList(api, "featureIds"));
        }

        Set<String> featuresWithUi = new HashSet<>();
        Set<String> rolesWithUi = new HashSet<>();
        for (Map<String, Object> screen : screens) {
            featuresWithUi.addAll(getStringList(screen, "featureIds"));
            rolesWithUi.addAll(getStringList(screen, "roleIds"));
        }

        Set<String> featuresWithDb = new HashSet<>();
        for (Map<String, Object> coll : collections) {
            featuresWithDb.addAll(getStringList(coll, "featureIds"));
        }

        // 2. Cross-Entity Missing Reference Validation (Requirement 4)
        // feature.roleIds -> missing role
        for (Map<String, Object> f : features) {
            String fId = getString(f, "id");
            List<String> fRoleIds = getStringList(f, "roleIds");
            for (String rId : fRoleIds) {
                if (!roleIds.contains(rId)) {
                    issues.add(new ValidationIssue(
                            "val-feat-missing-role-" + fId + "-" + rId, "RULE_FEATURE_MISSING_ROLE", "ERROR",
                            "Feature '" + getString(f, "name") + "' (" + fId + ") references non-existent role: " + rId,
                            List.of(fId, rId), "roleIds includes unknown role ID '" + rId + "'",
                            "Update roleIds to a valid role ID or create role " + rId + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }

        // requirement.featureIds -> missing feature
        for (Map<String, Object> req : requirements) {
            String rId = getString(req, "id");
            List<String> rFeatIds = getStringList(req, "featureIds");
            for (String fId : rFeatIds) {
                if (!featureIds.contains(fId)) {
                    issues.add(new ValidationIssue(
                            "val-req-missing-feat-" + rId + "-" + fId, "RULE_REQUIREMENT_MISSING_FEATURE", "ERROR",
                            "Requirement " + rId + " references non-existent feature: " + fId,
                            List.of(rId, fId), "featureIds includes unknown feature ID '" + fId + "'",
                            "Map requirement to a valid feature ID or create feature " + fId + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }

        // api.featureIds -> missing feature & api.roleIds -> missing role
        for (Map<String, Object> api : apis) {
            String aId = getString(api, "id");
            List<String> aFeatIds = getStringList(api, "featureIds");
            for (String fId : aFeatIds) {
                if (!featureIds.contains(fId)) {
                    issues.add(new ValidationIssue(
                            "val-api-missing-feat-" + aId + "-" + fId, "RULE_API_MISSING_FEATURE", "ERROR",
                            "API endpoint '" + aId + "' references non-existent feature: " + fId,
                            List.of(aId, fId), "featureIds includes unknown feature ID '" + fId + "'",
                            "Update featureIds to a valid feature ID or create feature " + fId + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
            List<String> aRoleIds = getStringList(api, "roleIds");
            for (String rId : aRoleIds) {
                if (!roleIds.contains(rId)) {
                    issues.add(new ValidationIssue(
                            "val-api-missing-role-" + aId + "-" + rId, "RULE_API_MISSING_ROLE", "ERROR",
                            "API endpoint '" + aId + "' references non-existent role: " + rId,
                            List.of(aId, rId), "roleIds includes unknown role ID '" + rId + "'",
                            "Update roleIds to a valid role ID or create role " + rId + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }

        // uiScreen.featureIds -> missing feature & uiScreen.roleIds -> missing role
        for (Map<String, Object> screen : screens) {
            String sId = getString(screen, "id");
            List<String> sFeatIds = getStringList(screen, "featureIds");
            for (String fId : sFeatIds) {
                if (!featureIds.contains(fId)) {
                    issues.add(new ValidationIssue(
                            "val-screen-missing-feat-" + sId + "-" + fId, "RULE_SCREEN_MISSING_FEATURE", "ERROR",
                            "UI screen '" + sId + "' references non-existent feature: " + fId,
                            List.of(sId, fId), "featureIds includes unknown feature ID '" + fId + "'",
                            "Update featureIds to a valid feature ID or create feature " + fId + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
            List<String> sRoleIds = getStringList(screen, "roleIds");
            for (String rId : sRoleIds) {
                if (!roleIds.contains(rId)) {
                    issues.add(new ValidationIssue(
                            "val-screen-missing-role-" + sId + "-" + rId, "RULE_SCREEN_MISSING_ROLE", "ERROR",
                            "UI screen '" + sId + "' references non-existent role: " + rId,
                            List.of(sId, rId), "roleIds includes unknown role ID '" + rId + "'",
                            "Update roleIds to a valid role ID or create role " + rId + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }

        // roadmap.featureIds -> missing feature
        for (Map<String, Object> phase : roadmap) {
            String pId = getString(phase, "id");
            List<String> pFeatIds = getStringList(phase, "featureIds");
            for (String fId : pFeatIds) {
                if (!featureIds.contains(fId)) {
                    issues.add(new ValidationIssue(
                            "val-roadmap-missing-feat-" + pId + "-" + fId, "RULE_ROADMAP_MISSING_FEATURE", "ERROR",
                            "Roadmap phase '" + pId + "' references non-existent feature: " + fId,
                            List.of(pId, fId), "featureIds includes unknown feature ID '" + fId + "'",
                            "Update featureIds to a valid feature ID or create feature " + fId + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }

        // database collection.featureIds -> missing feature
        for (Map<String, Object> coll : collections) {
            String cId = getString(coll, "id");
            List<String> cFeatIds = getStringList(coll, "featureIds");
            for (String fId : cFeatIds) {
                if (!featureIds.contains(fId)) {
                    issues.add(new ValidationIssue(
                            "val-coll-missing-feat-" + cId + "-" + fId, "RULE_COLLECTION_MISSING_FEATURE", "ERROR",
                            "Database collection '" + cId + "' references non-existent feature: " + fId,
                            List.of(cId, fId), "featureIds includes unknown feature ID '" + fId + "'",
                            "Update featureIds to a valid feature ID or create feature " + fId + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }

        // 3. Feature Coverage Rules (Requirements 5, 6, 7)
        for (Map<String, Object> f : features) {
            String fId = getString(f, "id");
            boolean needsApi = Boolean.TRUE.equals(f.get("needsApi"));
            if (needsApi && !featuresWithApi.contains(fId)) {
                issues.add(new ValidationIssue(
                        "val-feat-no-api-" + fId, "RULE_FEATURE_NO_API", "WARNING",
                        "Feature '" + getString(f, "name") + "' requires an API, but no API specification references it.",
                        List.of(fId), "needsApi is true, but featureIds in apis[] does not include " + fId,
                        "Add a corresponding REST endpoint in the APIs section linking to " + fId + ", or set needsApi to false.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
        }

        for (Map<String, Object> f : features) {
            String fId = getString(f, "id");
            boolean needsUi = Boolean.TRUE.equals(f.get("needsUi"));
            if (needsUi && !featuresWithUi.contains(fId)) {
                issues.add(new ValidationIssue(
                        "val-feat-no-ui-" + fId, "RULE_FEATURE_NO_UI", "WARNING",
                        "Feature '" + getString(f, "name") + "' requires a UI screen, but no UI Screen references it.",
                        List.of(fId), "needsUi is true, but featureIds in uiScreens[] does not include " + fId,
                        "Define a UI screen under uiScreens and link " + fId + " in its featureIds, or set needsUi to false.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
        }

        for (Map<String, Object> f : features) {
            String fId = getString(f, "id");
            boolean needsDb = Boolean.TRUE.equals(f.get("needsPersistence"));
            if (needsDb && !featuresWithDb.contains(fId)) {
                issues.add(new ValidationIssue(
                        "val-feat-no-db-" + fId, "RULE_FEATURE_NO_PERSISTENCE", "WARNING",
                        "Feature '" + getString(f, "name") + "' requires persistence, but no MongoDB collection maps to it.",
                        List.of(fId), "needsPersistence is true, but featureIds in database.collections[] does not include " + fId,
                        "Add or map a MongoDB collection to feature " + fId + ", or set needsPersistence to false.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
        }

        // 4. Interactive role with no screen coverage (Requirement 8)
        for (Map<String, Object> r : roles) {
            String rId = getString(r, "id");
            boolean interactive = Boolean.TRUE.equals(r.get("interactive"));
            if (interactive && !rolesWithUi.contains(rId)) {
                issues.add(new ValidationIssue(
                        "val-role-no-ui-" + rId, "RULE_ROLE_NO_UI", "WARNING",
                        "Interactive role '" + getString(r, "name") + "' has no mapped UI screens.",
                        List.of(rId), "interactive is true, but roleIds in uiScreens[] does not include " + rId,
                        "Assign role " + rId + " to at least one UI screen, or set interactive to false for system roles.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
        }

        // 5. Database relationship integrity & field references (Requirement 9)
        Map<String, Set<String>> collectionFieldsMap = new HashMap<>();
        for (Map<String, Object> coll : collections) {
            String cId = getString(coll, "id");
            Set<String> fNames = new HashSet<>();
            List<Map<String, Object>> fields = getList(coll, "fields");
            for (Map<String, Object> field : fields) {
                fNames.add(getString(field, "name"));
            }
            collectionFieldsMap.put(cId, fNames);
        }

        Set<String> allowedCardinalities = Set.of("ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_ONE", "MANY_TO_MANY");

        for (Map<String, Object> rel : relationships) {
            String relId = getString(rel, "id");
            String sCol = getString(rel, "sourceCollectionId");
            String tCol = getString(rel, "targetCollectionId");
            String sField = getString(rel, "sourceField");
            String tField = getString(rel, "targetField");
            String cardinality = getString(rel, "cardinality");

            boolean sExists = collectionFieldsMap.containsKey(sCol);
            boolean tExists = collectionFieldsMap.containsKey(tCol);

            if (!sExists) {
                issues.add(new ValidationIssue(
                        "val-rel-src-missing-" + relId, "RULE_RELATIONSHIP_MISSING_SOURCE", "ERROR",
                        "Relationship " + relId + " references non-existent source collection: " + sCol,
                        List.of(relId), "sourceCollectionId '" + sCol + "' not found in database.collections",
                        "Update sourceCollectionId to an existing collection or create collection " + sCol + ".",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
            if (!tExists) {
                issues.add(new ValidationIssue(
                        "val-rel-tgt-missing-" + relId, "RULE_RELATIONSHIP_MISSING_TARGET", "ERROR",
                        "Relationship " + relId + " references non-existent target collection: " + tCol,
                        List.of(relId), "targetCollectionId '" + tCol + "' not found in database.collections",
                        "Update targetCollectionId to an existing collection or create collection " + tCol + ".",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }

            // Check source field if source collection exists and has declared fields
            if (sExists && sField != null && !sField.isBlank()) {
                Set<String> sFields = collectionFieldsMap.get(sCol);
                if (sFields != null && !sFields.isEmpty() && !sFields.contains(sField)) {
                    issues.add(new ValidationIssue(
                            "val-rel-src-field-missing-" + relId, "RULE_RELATIONSHIP_MISSING_SOURCE_FIELD", "ERROR",
                            "Relationship " + relId + " references non-existent source field '" + sField + "' in collection " + sCol,
                            List.of(relId, sCol), "Collection '" + sCol + "' does not contain field '" + sField + "'",
                            "Add field '" + sField + "' to collection " + sCol + " or update relationship sourceField.",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }

            // Check target field if target collection exists and has declared fields
            if (tExists && tField != null && !tField.isBlank()) {
                Set<String> tFields = collectionFieldsMap.get(tCol);
                if (tFields != null && !tFields.isEmpty() && !tFields.contains(tField)) {
                    issues.add(new ValidationIssue(
                            "val-rel-tgt-field-missing-" + relId, "RULE_RELATIONSHIP_MISSING_TARGET_FIELD", "ERROR",
                            "Relationship " + relId + " references non-existent target field '" + tField + "' in collection " + tCol,
                            List.of(relId, tCol), "Collection '" + tCol + "' does not contain field '" + tField + "'",
                            "Add field '" + tField + "' to collection " + tCol + " or update relationship targetField.",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }

            // Cardinality allowlist check
            if (!cardinality.isBlank() && !allowedCardinalities.contains(cardinality)) {
                issues.add(new ValidationIssue(
                        "val-rel-cardinality-" + relId, "RULE_RELATIONSHIP_UNSUPPORTED_CARDINALITY", "ERROR",
                        "Relationship " + relId + " has unsupported cardinality: " + cardinality,
                        List.of(relId), "cardinality '" + cardinality + "' is not supported. Allowed: ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY",
                        "Change cardinality to ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, or MANY_TO_MANY.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
        }

        // 6. Duplicate API method/path combinations (Requirement 10)
        Map<String, String> normalizedApiPaths = new HashMap<>();
        for (Map<String, Object> api : apis) {
            String aId = getString(api, "id");
            String method = getString(api, "method").toUpperCase();
            String path = getString(api, "path");
            // Normalize {id} or {orderId} to {*}
            String normalizedPath = path.replaceAll("\\{[^}]+\\}", "{*}").toLowerCase();
            if (normalizedPath.endsWith("/") && normalizedPath.length() > 1) {
                normalizedPath = normalizedPath.substring(0, normalizedPath.length() - 1);
            }
            String key = method + " " + normalizedPath;

            if (normalizedApiPaths.containsKey(key)) {
                String prevId = normalizedApiPaths.get(key);
                issues.add(new ValidationIssue(
                        "val-api-dup-" + aId, "RULE_DUPLICATE_API_ROUTE", "ERROR",
                        "Duplicate API route detected: " + method + " " + path + " conflicts with " + prevId,
                        List.of(aId, prevId), "Both APIs map to equivalent path pattern: " + key,
                        "Change HTTP method or adjust path parameters to differentiate endpoints.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            } else {
                normalizedApiPaths.put(key, aId);
            }
        }

        // 7. Screen navigation actions integrity (Requirement 11)
        for (Map<String, Object> screen : screens) {
            String sId = getString(screen, "id");
            List<Map<String, Object>> actions = getList(screen, "actions");
            for (Map<String, Object> act : actions) {
                String actId = getString(act, "id");
                String kind = getString(act, "kind");
                String targetScreenId = getString(act, "targetScreenId");

                if ("NAVIGATION".equalsIgnoreCase(kind)) {
                    if (targetScreenId == null || targetScreenId.isBlank() || !screenIds.contains(targetScreenId)) {
                        issues.add(new ValidationIssue(
                                "val-screen-nav-" + actId, "RULE_SCREEN_BROKEN_NAVIGATION", "ERROR",
                                "Action '" + getString(act, "label") + "' on screen " + sId + " navigates to non-existent screen: " + targetScreenId,
                                List.of(sId, actId), "targetScreenId '" + targetScreenId + "' does not exist in uiScreens[]",
                                "Update targetScreenId to a valid screen ID or create screen " + targetScreenId + ".",
                                "SERVER_DETERMINISTIC", "ACTIVE"
                        ));
                    }
                }
            }
        }

        // 8. Roadmap dependencies pointing to missing phases, self-dependencies, or cycles (Requirement 12)
        Map<String, List<String>> depGraph = new HashMap<>();
        for (Map<String, Object> p : roadmap) {
            String pId = getString(p, "id");
            depGraph.put(pId, getStringList(p, "dependsOnPhaseIds"));
        }

        for (Map<String, Object> p : roadmap) {
            String pId = getString(p, "id");
            List<String> deps = getStringList(p, "dependsOnPhaseIds");
            for (String dep : deps) {
                if (dep.equals(pId)) {
                    issues.add(new ValidationIssue(
                            "val-roadmap-self-dep-" + pId, "RULE_ROADMAP_SELF_DEPENDENCY", "ERROR",
                            "Roadmap phase " + pId + " cannot depend on itself.",
                            List.of(pId), "dependsOnPhaseIds references the same phase ID '" + pId + "'",
                            "Remove self-referential dependency from dependsOnPhaseIds.",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                } else if (!phaseIds.contains(dep)) {
                    issues.add(new ValidationIssue(
                            "val-roadmap-missing-dep-" + pId + "-" + dep, "RULE_ROADMAP_MISSING_DEPENDENCY", "ERROR",
                            "Roadmap phase " + pId + " depends on missing phase: " + dep,
                            List.of(pId), "dependsOnPhaseIds includes unknown phase ID '" + dep + "'",
                            "Remove dependency or create roadmap phase " + dep + ".",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }

        // Detect dependency cycles via DFS
        Set<String> visited = new HashSet<>();
        Set<String> recStack = new HashSet<>();
        for (String pId : phaseIds) {
            if (hasCycle(pId, depGraph, visited, recStack)) {
                issues.add(new ValidationIssue(
                        "val-roadmap-cycle-" + pId, "RULE_ROADMAP_CYCLE", "ERROR",
                        "Circular dependency cycle detected in roadmap phases involving phase: " + pId,
                        List.of(pId), "Dependency cycle detected in graph: " + depGraph,
                        "Resolve circular roadmap dependencies to establish a linear progression.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
                break;
            }
        }

        // 9. User-stated requirements coverage (Requirement 13)
        for (Map<String, Object> req : requirements) {
            String rId = getString(req, "id");
            String source = getString(req, "source");
            List<String> criteria = getStringList(req, "acceptanceCriteria");
            List<String> featIds = getStringList(req, "featureIds");

            if ("USER_STATED".equalsIgnoreCase(source)) {
                boolean hasMeaningfulCriteria = criteria.stream().anyMatch(c -> c != null && !c.trim().isBlank());
                if (!hasMeaningfulCriteria) {
                    issues.add(new ValidationIssue(
                            "val-req-no-criteria-" + rId, "RULE_REQUIREMENT_NO_CRITERIA", "WARNING",
                            "User-stated requirement " + rId + " has no testable acceptance criteria.",
                            List.of(rId), "acceptanceCriteria is empty or contains only blank entries",
                            "Define at least one objective acceptance criterion for this requirement.",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
                if (featIds.isEmpty()) {
                    issues.add(new ValidationIssue(
                            "val-req-no-feature-" + rId, "RULE_REQUIREMENT_NO_FEATURE", "WARNING",
                            "User-stated requirement " + rId + " is not mapped to any feature.",
                            List.of(rId), "featureIds is empty",
                            "Link this requirement to an applicable system feature.",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }

        // 10. Outstanding assumptions & open questions (Requirement 14)
        for (Map<String, Object> q : openQuestions) {
            String qId = getString(q, "id");
            issues.add(new ValidationIssue(
                    "val-q-" + qId, "RULE_OPEN_QUESTION", "NEEDS_CLARIFICATION",
                    "Unresolved question: " + getString(q, "question"),
                    getStringList(q, "affectedEntityIds"),
                    "Impact: " + getString(q, "whyItMatters"),
                    "Clarify this architectural requirement to reduce implementation risk.",
                    "SERVER_DETERMINISTIC", "ACTIVE"
            ));
        }

        for (Map<String, Object> asm : assumptions) {
            String asmId = getString(asm, "id");
            issues.add(new ValidationIssue(
                    "val-asm-" + asmId, "RULE_ASSUMPTION_RECORDED", "INFO",
                    "Architectural assumption: " + getString(asm, "description"),
                    getStringList(asm, "affectedEntityIds"),
                    "Rationale: " + getString(asm, "reason"),
                    "Verify this assumption with stakeholders.",
                    "SERVER_DETERMINISTIC", "ACTIVE"
            ));
        }

        // Hardware, Hybrid, and Estimate Rules
        validateHardwareRules(blueprint, issues, allIds, idTypeMap);
        validateHybridRules(blueprint, issues);
        validateEstimateRules(blueprint, issues);

        return issues;
    }

    private void validateHardwareRules(Map<String, Object> blueprint, List<ValidationIssue> issues, Set<String> allIds, Map<String, String> idTypeMap) {
        String projectType = getString(blueprint, "projectType").toUpperCase(Locale.ROOT);
        Map<String, Object> hardware = getMap(blueprint, "hardware");
        boolean isHwApplicable = "HARDWARE".equals(projectType) || "HYBRID".equals(projectType) || Boolean.TRUE.equals(hardware.get("applicable"));

        if (!isHwApplicable) return;

        List<Map<String, Object>> components = getList(hardware, "components");
        List<Map<String, Object>> connections = getList(hardware, "connections");

        Set<String> compIds = new HashSet<>();
        Set<String> controllerCompIds = new HashSet<>();
        boolean hasPowerSource = false;
        boolean hasSensors = false;
        boolean hasActuators = false;

        for (Map<String, Object> comp : components) {
            String cId = getString(comp, "id");
            if (!cId.isBlank()) {
                compIds.add(cId);
            }
            String category = getString(comp, "category").toUpperCase(Locale.ROOT);
            if ("MICROCONTROLLER".equals(category) || "CONTROLLER".equals(category)) {
                controllerCompIds.add(cId);
            }
            if ("POWER".equals(category) || category.contains("BATTERY") || category.contains("REGULATOR")) {
                hasPowerSource = true;
            }
            if ("SENSOR".equals(category)) {
                hasSensors = true;
            }
            if ("ACTUATOR".equals(category) || "DISPLAY".equals(category)) {
                hasActuators = true;
            }
        }

        // Missing controller check
        if ((hasSensors || hasActuators) && controllerCompIds.isEmpty()) {
            issues.add(new ValidationIssue(
                    "val-hw-missing-controller", "RULE_HW_MISSING_CONTROLLER", "WARNING",
                    "Hardware plan includes sensors or actuators but no central microcontroller component is defined.",
                    List.of(), "No component categorized as MICROCONTROLLER",
                    "Add an appropriate microcontroller (e.g. ESP32, STM32, Arduino) to coordinate hardware signals.",
                    "SERVER_DETERMINISTIC", "ACTIVE"
            ));
        }

        // Missing power source check
        if (!components.isEmpty() && !hasPowerSource) {
            issues.add(new ValidationIssue(
                    "val-hw-missing-power-source", "RULE_HW_MISSING_POWER_SOURCE", "WARNING",
                    "Hardware plan has components but no dedicated power source (battery, adapter, or regulator) is defined.",
                    List.of(), "No component categorized as POWER",
                    "Define a power source component with operating voltage and current specifications.",
                    "SERVER_DETERMINISTIC", "ACTIVE"
            ));
        }

        // Validate connections
        Set<String> connectedComponents = new HashSet<>();
        Set<String> connectedToController = new HashSet<>();
        Set<String> connectionPairs = new HashSet<>();

        for (Map<String, Object> conn : connections) {
            String connId = getString(conn, "id");
            String fromId = getString(conn, "fromComponentId");
            String toId = getString(conn, "toComponentId");

            if (!fromId.isBlank() && !compIds.contains(fromId)) {
                issues.add(new ValidationIssue(
                        "val-hw-unknown-comp-" + connId + "-" + fromId, "RULE_HW_UNKNOWN_COMPONENT_REFERENCE", "ERROR",
                        "Connection '" + connId + "' references unknown source component: " + fromId,
                        List.of(connId, fromId), "fromComponentId '" + fromId + "' does not match any component id",
                        "Update fromComponentId to reference a valid hardware component ID.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
            if (!toId.isBlank() && !compIds.contains(toId)) {
                issues.add(new ValidationIssue(
                        "val-hw-unknown-comp-" + connId + "-" + toId, "RULE_HW_UNKNOWN_COMPONENT_REFERENCE", "ERROR",
                        "Connection '" + connId + "' references unknown target component: " + toId,
                        List.of(connId, toId), "toComponentId '" + toId + "' does not match any component id",
                        "Update toComponentId to reference a valid hardware component ID.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }

            connectedComponents.add(fromId);
            connectedComponents.add(toId);

            if (controllerCompIds.contains(fromId)) {
                connectedToController.add(toId);
            }
            if (controllerCompIds.contains(toId)) {
                connectedToController.add(fromId);
            }

            // Check duplicate connection
            String pairKey = fromId + ":" + getString(conn, "fromPin") + "->" + toId + ":" + getString(conn, "toPin");
            if (!connectionPairs.add(pairKey)) {
                issues.add(new ValidationIssue(
                        "val-hw-dup-conn-" + connId, "RULE_HW_DUPLICATE_CONNECTION", "WARNING",
                        "Duplicate connection between same component pins detected: " + pairKey,
                        List.of(connId, fromId, toId), "Duplicate wiring pair: " + pairKey,
                        "Verify and consolidate redundant pin connections.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
        }

        // Sensor controller path check
        for (Map<String, Object> comp : components) {
            String cId = getString(comp, "id");
            String category = getString(comp, "category").toUpperCase(Locale.ROOT);
            if ("SENSOR".equals(category) && !controllerCompIds.isEmpty() && !connectedToController.contains(cId)) {
                issues.add(new ValidationIssue(
                        "val-hw-sensor-no-controller-" + cId, "RULE_HW_SENSOR_NO_CONTROLLER_PATH", "WARNING",
                        "Sensor '" + getString(comp, "name") + "' (" + cId + ") has no signal connection to any microcontroller.",
                        List.of(cId), "Sensor missing data line to controller",
                        "Add a signal connection from this sensor to a GPIO or ADC pin on the microcontroller.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
        }

        // Check 3D model mapping
        Map<String, Object> threeD = getMap(hardware, "threeDModel");
        List<Map<String, Object>> threeDComponents = getList(threeD, "components");
        if (!threeDComponents.isEmpty() && !components.isEmpty()) {
            Set<String> mappedCompIds = new HashSet<>();
            for (Map<String, Object> tc : threeDComponents) {
                String cId = getString(tc, "componentId");
                if (!cId.isBlank()) mappedCompIds.add(cId);
            }
            for (Map<String, Object> comp : components) {
                String cId = getString(comp, "id");
                if (!mappedCompIds.contains(cId)) {
                    issues.add(new ValidationIssue(
                            "val-hw-3d-unmapped-" + cId, "RULE_HW_MISSING_3D_MAPPING", "INFO",
                            "Component '" + getString(comp, "name") + "' (" + cId + ") is not yet positioned in the 3D model layout.",
                            List.of(cId), "Component missing from 3D layout",
                            "Add a 3D primitive representation in hardware.threeDModel.components.",
                            "SERVER_DETERMINISTIC", "ACTIVE"
                    ));
                }
            }
        }
    }

    private void validateHybridRules(Map<String, Object> blueprint, List<ValidationIssue> issues) {
        String projectType = getString(blueprint, "projectType").toUpperCase(Locale.ROOT);
        if (!"HYBRID".equals(projectType)) return;

        Map<String, Object> software = getMap(blueprint, "software");
        List<Map<String, Object>> integrations = getList(software, "integrations");

        if (integrations.isEmpty()) {
            issues.add(new ValidationIssue(
                    "val-hybrid-missing-integrations", "RULE_HYBRID_MISSING_INTEGRATIONS", "WARNING",
                    "Hybrid project contains both hardware and software layers, but no integration bridges (MQTT, HTTP, BLE, etc.) are defined.",
                    List.of(), "software.integrations is empty",
                    "Specify device-to-cloud protocols in software.integrations to define how telemetry or commands flow.",
                    "SERVER_DETERMINISTIC", "ACTIVE"
            ));
        }
    }

    private void validateEstimateRules(Map<String, Object> blueprint, List<ValidationIssue> issues) {
        Map<String, Object> estimates = getMap(blueprint, "estimates");
        if (estimates.isEmpty()) {
            issues.add(new ValidationIssue(
                    "val-est-missing", "RULE_ESTIMATES_MISSING", "INFO",
                    "Project blueprint is missing time, team, and cost estimates.",
                    List.of(), "estimates section is empty",
                    "Generate or edit project estimates to include duration, team size, and cost range.",
                    "SERVER_DETERMINISTIC", "ACTIVE"
            ));
        } else {
            Map<String, Object> cost = getMap(estimates, "estimatedCost");
            if (cost.containsKey("basis") && getString(cost, "basis").isBlank()) {
                issues.add(new ValidationIssue(
                        "val-est-missing-basis", "RULE_ESTIMATE_MISSING_BASIS", "INFO",
                        "Cost estimate is missing explanation basis.",
                        List.of(), "estimatedCost.basis is blank",
                        "Provide the basis of the cost estimate for stakeholder clarity.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            }
        }
    }

    private void indexEntities(List<Map<String, Object>> list, String entityType,
                               Set<String> allIds, Map<String, String> idTypeMap,
                               Set<String> sectionIds,
                               List<ValidationIssue> issues) {
        for (Map<String, Object> item : list) {
            String id = getString(item, "id");
            if (id.isBlank()) continue;
            sectionIds.add(id);
            if (allIds.contains(id)) {
                String existingType = idTypeMap.get(id);
                issues.add(new ValidationIssue(
                        "val-dup-id-" + id, "RULE_DUPLICATE_ID", "ERROR",
                        "Duplicate entity ID detected: '" + id + "' used for both " + existingType + " and " + entityType,
                        List.of(id), "Duplicate key: " + id,
                        "Assign a unique ID prefix or slug to distinguish entities.",
                        "SERVER_DETERMINISTIC", "ACTIVE"
                ));
            } else {
                allIds.add(id);
                idTypeMap.put(id, entityType);
            }
        }
    }

    private boolean hasCycle(String node, Map<String, List<String>> graph, Set<String> visited, Set<String> recStack) {
        if (recStack.contains(node)) return true;
        if (visited.contains(node)) return false;

        visited.add(node);
        recStack.add(node);

        List<String> neighbors = graph.getOrDefault(node, List.of());
        for (String next : neighbors) {
            if (graph.containsKey(next)) {
                if (hasCycle(next, graph, visited, recStack)) return true;
            }
        }

        recStack.remove(node);
        return false;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getList(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return Collections.emptyList();
        Object val = map.get(key);
        if (val instanceof List<?> rawList) {
            List<Map<String, Object>> result = new ArrayList<>();
            for (Object item : rawList) {
                if (item instanceof Map<?, ?> itemMap) {
                    result.add((Map<String, Object>) itemMap);
                }
            }
            return result;
        }
        return Collections.emptyList();
    }

    private List<String> getStringList(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return Collections.emptyList();
        Object val = map.get(key);
        if (val instanceof List<?> rawList) {
            List<String> result = new ArrayList<>();
            for (Object item : rawList) {
                if (item != null) {
                    result.add(String.valueOf(item));
                }
            }
            return result;
        }
        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getMap(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key)) return Collections.emptyMap();
        Object val = map.get(key);
        if (val instanceof Map) {
            return (Map<String, Object>) val;
        }
        return Collections.emptyMap();
    }

    private String getString(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key) || map.get(key) == null) return "";
        return String.valueOf(map.get(key));
    }
}
