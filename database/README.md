# IdeaStruct AI — Database Documentation & Persistence Structure

> **Architectural Note:**  
> The runtime data access layer and Spring Data MongoDB repository interface reside in:  
> `backend/src/main/java/com/ideastruct/infrastructure/database/repository/ProjectRepository.java`.  
> This directory documents the MongoDB schema, data model, indexes, and reference fixtures.

---

## 1. Database & Collection Overview

- **Database Name:** `ideastruct_ai`
- **Primary Collection:** `projects`
- **Default Connection URI:** `mongodb://localhost:27017/ideastruct_ai` (configurable via `MONGODB_URI` environment variable).

---

## 2. Stored Project Aggregate

IdeaStruct AI models each engineering project plan as an atomic document aggregate. Instead of fragmenting requirements, features, endpoints, and screens across relational tables, the entire blueprint is embedded directly inside the parent `Project` document:

```
Project (Document Root)
├── _id (ObjectId)
├── title (String, 3–120 chars)
├── idea (String, 50–10,000 chars)
├── typeOverride (String: "SOFTWARE", "HARDWARE", "HYBRID", or null for Auto Detect)
├── revision (Long, starts at 1, increments on every mutation)
├── createdAt (ISODate)
├── updatedAt (ISODate)
├── blueprintBasedOnIdeaHash (String, 64-char SHA-256 hash of idea text at generation)
├── blueprintOutdated (Boolean, true when idea was edited after blueprint generation)
├── generationMetadata (Object: source, provider, model, timestamp)
├── validationIssues (Array of deterministic requirement findings)
├── validationCheckedAt (ISODate)
└── blueprint (Embedded Object matching canonical schema v2.0 or legacy v1.0)
    ├── schemaVersion ("2.0" for modern multi-domain, "1.0" for legacy software)
    ├── projectType ("SOFTWARE" | "HARDWARE" | "HYBRID")
    ├── classification (type, confidence, reason, detectedSignals)
    ├── estimates (difficulty, estimatedDuration, recommendedTeamSize, teamRoles, estimatedCost)
    ├── overview (projectName, summary, problemStatement, targetUsers, goals, scope, outOfScope)
    ├── features (id, name, description, priority, roleIds, needsApi, needsUi, needsPersistence)
    ├── roles (id, name, description, interactive, permissions)
    ├── requirements (id, type, description, featureIds, acceptanceCriteria, source)
    ├── database (collections, relationships)
    ├── apis (id, method, path, purpose, featureIds, roleIds, authRequired, successStatus, errorCases)
    ├── software (applicable, architecture, recommendedTechStack, screens, prototype)
    ├── hardware (applicable, components, connections, powerRequirements, threeDModel)
    ├── roadmap (id, title, description, featureIds, tasks, dependsOnPhaseIds, completionCriteria)
    ├── risks (id, title, severity, mitigation)
    ├── recommendations (id, category, title, description)
    ├── assumptions (id, description, affectedEntityIds, reason)
    └── openQuestions (id, question, affectedEntityIds, whyItMatters)
```

### Optimistic Concurrency Protection
The `revision` counter enforces optimistic concurrency. Any modifying request (`PATCH /api/projects/{id}`, `PUT /api/projects/{id}/blueprint`, `DELETE /api/projects/{id}`) requires the client's known revision (via `If-Match` header or JSON body). Concurrent overwrites are rejected with HTTP 409 Conflict.

---

## 3. Directory Layout

| Folder / File | Purpose |
| :--- | :--- |
| [`schemas/project-document.example.json`](./schemas/project-document.example.json) | Sanitized MongoDB document example reflecting full Project aggregate. |
| [`indexes/recommended-indexes.md`](./indexes/recommended-indexes.md) | Recommended production indexes (`updatedAt`, `title`). |
| [`fixtures/food_ordering_blueprint.json`](./fixtures/food_ordering_blueprint.json) | Deterministic campus food ordering blueprint reference data (Canonical v2.0). |

---

## 4. Fixture Provenance & Canonical Source of Truth

To ensure complete clarity across environments:

1. **Canonical JSON Schema:**  
   [`shared/schemas/blueprint.schema.json`](../shared/schemas/blueprint.schema.json) is the **single canonical source of truth** for all blueprint structures and validation rules.
2. **Backend Runtime Fixture:**  
   `backend/src/main/resources/fixtures/food_ordering_blueprint.json` is packaged directly on the backend classpath to enable offline DEMO mode and self-contained JUnit tests without external disk dependencies.
3. **Database Reference Fixture:**  
   [`database/fixtures/food_ordering_blueprint.json`](./fixtures/food_ordering_blueprint.json) provides database administrators and developers an identical seed/reference fixture for database inspection, seeding scripts, and integration validation.
