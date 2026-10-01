# IdeaStruct AI — Real Planner API Contract

Base URL: `/api`

## Revision & Optimistic Concurrency Convention
- Every project aggregate contains a numeric `revision` field (starts at `1`, increments by `1` on every mutation).
- For `PATCH /api/projects/{id}`, `PUT /api/projects/{id}/blueprint`, and `DELETE /api/projects/{id}`:
  - The client **MUST** send the current expected revision via the HTTP `If-Match` header (e.g. `If-Match: 1`) or via the `expectedRevision` JSON payload field.
  - If the database revision does not match the expected revision, the server returns HTTP **409 Conflict** with an error explaining that the project was modified concurrently.

---

## 1. System Health
### `GET /api/health`
Probes application liveness and executes an actual MongoDB `{ ping: 1 }` command.
- **Success (200 OK):**
```json
{
  "backend": "RUNNING",
  "timestamp": "2026-09-22T16:20:00Z",
  "database": {
    "status": "UP",
    "databaseName": "ideastruct_ai",
    "message": "MongoDB is reachable and responding to ping"
  },
  "status": "UP"
}
```
- **Degraded (200 OK with status DEGRADED):**
```json
{
  "backend": "RUNNING",
  "timestamp": "2026-09-22T16:20:00Z",
  "database": {
    "status": "DOWN",
    "error": "MongoSocketOpenException: ...",
    "message": "MongoDB ping failed; database unreachable"
  },
  "status": "DEGRADED"
}
```

---

## 2. Projects CRUD

### `POST /api/projects`
Creates a new project draft from title, idea description, and optional project type override.
- **Request Body:**
```json
{
  "title": "SentinelAir — Hazardous Gas Detection Circuit",
  "idea": "An autonomous standalone hazardous gas and smoke detection circuit using ESP32, MQ-135 sensor, and local OLED alert beacon...",
  "typeOverride": "HARDWARE"
}
```
- **Type Override Contract:**
  - `typeOverride`: Optional. Defaults to `"AUTO"`.
  - Permitted values: `"AUTO"`, `"SOFTWARE"`, `"HARDWARE"`, `"HYBRID"`.
  - If set to an explicit mode (`SOFTWARE`, `HARDWARE`, or `HYBRID`), DEMO generation, LIVE AI generation, and regeneration will strictly honor the user's intent.
  - If `"AUTO"` or omitted, the backend classifier and LIVE AI will classify automatically from the idea content.

- **Response (201 Created):**
```json
{
  "id": "673f...",
  "title": "SentinelAir — Hazardous Gas Detection Circuit",
  "idea": "An autonomous standalone hazardous gas and smoke detection circuit...",
  "typeOverride": "HARDWARE",
  "revision": 1,
  "createdAt": "2026-09-22T16:22:00Z",
  "updatedAt": "2026-09-22T16:22:00Z",
  "blueprint": null,
  "blueprintBasedOnIdeaHash": null,
  "blueprintOutdated": false,
  "generationMetadata": null,
  "validationIssues": [],
  "validationCheckedAt": null
}
```
- **Errors:**
  - `400 Bad Request`: Validation failure (e.g. title < 3 or > 120 chars, idea < 50 or > 10,000 chars, invalid `typeOverride`).

### `GET /api/projects`
Retrieves a paginated list of project summaries with stable sorting (most recent first).
- **Query Params:** `page` (default `0`), `size` (default `20`)
- **Response (200 OK):**
```json
{
  "content": [
    {
      "id": "673f...",
      "title": "SentinelAir",
      "revision": 1,
      "projectType": "HARDWARE",
      "typeOverride": "HARDWARE",
      "createdAt": "2026-09-22T16:22:00Z",
      "updatedAt": "2026-09-22T16:22:00Z",
      "hasBlueprint": true,
      "blueprintOutdated": false,
      "generationSource": "DEMO"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### `GET /api/projects/{id}`
Returns full project aggregate document.
- **Response (200 OK):** Complete project JSON including embedded blueprint if present.
- **Errors:**
  - `404 Not Found`: Project with given ID does not exist.

### `PATCH /api/projects/{id}`
Updates project title and/or idea description. Updates `blueprintOutdated` automatically if the idea differs from `blueprintBasedOnIdeaHash`.
- **Headers:** `If-Match: 1` (or pass `expectedRevision: 1` in body)
- **Request Body:**
```json
{
  "title": "Updated Title",
  "idea": "Updated idea text...",
  "expectedRevision": 1
}
```
- **Response (200 OK):** Updated project document with incremented `revision: 2`.
- **Errors:**
  - `409 Conflict`: Expected revision does not match current server revision.
  - `404 Not Found`: Project does not exist.

### `DELETE /api/projects/{id}`
Deletes the project aggregate.
- **Headers:** `If-Match: 1` (or query param `?revision=1`)
- **Response (204 No Content)**
- **Errors:**
  - `409 Conflict`: Revision mismatch.
  - `404 Not Found`: Project does not exist.

---

## 3. Blueprint Generation & Editing

### `POST /api/projects/{id}/generate`
Generates and persists the first blueprint for the project using configured AI provider or explicit DEMO mode.
- **Request Body:**
```json
{
  "expectedRevision": 1
}
```
- **Response (200 OK):** Updated project document with generated blueprint and server-derived `generationMetadata`.
- **Errors:**
  - `409 Conflict`: Revision mismatch or blueprint already exists.

### `PUT /api/projects/{id}/blueprint`
Explicitly updates or saves edited blueprint content.
- **Headers:** `If-Match: 2`
- **Request Body:**
```json
{
  "blueprint": { ... },
  "expectedRevision": 2
}
```
- **Response (200 OK):** Saved project with incremented revision and `generationMetadata.source = "USER_EDITED"`.
- **Errors:**
  - `400 Bad Request`: Schema validation failure.
  - `409 Conflict`: Revision mismatch.

### `POST /api/projects/{id}/regenerate`
Review flow: generates candidate proposal without overwriting the saved blueprint.
- **Request Body:**
```json
{
  "section": "all" | "database" | "apis" | "features" | ...,
  "instructions": "Add user reviews collection",
  "expectedRevision": 2
}
```
- **Response (200 OK):**
```json
{
  "baseRevision": 2,
  "section": "database",
  "candidate": { ... },
  "diffSummary": "Added 1 collection"
}
```

### `POST /api/projects/{id}/validate`
Re-evaluates deterministic structural validation rules (Plan Check across software, hardware, hybrid specifications, entity relations, and cross-section references) against the current blueprint and saves the findings to the project aggregate document.
- **Headers:** `If-Match: 2` (optional, or pass `expectedRevision: 2` in body, or omit to validate current state)
- **Request Body:**
```json
{
  "expectedRevision": 2
}
```
- **Response (200 OK):** Updated project document containing:
```json
{
  "id": "673f...",
  "title": "CampusBite",
  "revision": 2,
  "validationCheckedAt": "2026-09-22T16:55:00Z",
  "validationIssues": [
    {
      "id": "val-feat-no-api-feature-order-food",
      "ruleCode": "RULE_FEATURE_NO_API",
      "severity": "WARNING",
      "message": "Feature requires an API, but no API specification references it.",
      "affectedEntityIds": ["feature-order-food"],
      "evidence": "needsApi is true, but featureIds in apis[] does not include feature-order-food",
      "suggestedAction": "Add a corresponding REST endpoint in the APIs section.",
      "source": "SERVER_DETERMINISTIC",
      "status": "ACTIVE"
    }
  ]
}
```
- **Errors:**
  - `400 Bad Request`: Blueprint has not been generated yet.
  - `404 Not Found`: Project does not exist.
  - `409 Conflict`: Revision conflict if `expectedRevision` is provided and does not match server revision.

---

## 4. Standard Error Shape
```json
{
  "code": "CONFLICT",
  "message": "Project was modified by another request. Current revision is 2, expected 1.",
  "fieldErrors": {},
  "timestamp": "2026-09-22T16:25:00Z",
  "requestId": "req-98af31"
}
```

---

## 5. Canonical Blueprint Schema Contract (v1.0 & v2.0)

IdeaStruct AI supports dual canonical schema versioning with strict backward compatibility:
- **`schemaVersion: "1.0"`**: Legacy software-only blueprints with root-level `database`, `apis`, and `uiScreens`.
- **`schemaVersion: "2.0"`**: Modern multi-domain blueprints supporting **Software**, **Hardware**, and **Hybrid** architectures.

### v2.0 Schema Structure & Mandatory Fields

| Field | Type | Description |
|---|---|---|
| `schemaVersion` | String | Must be `"2.0"` (or legacy `"1.0"` for backward compatibility). |
| `projectType` | Enum | `"SOFTWARE"`, `"HARDWARE"`, or `"HYBRID"`. |
| `classification` | Object | `{ type, confidence ("LOW"\|"MEDIUM"\|"HIGH"), reason, detectedSignals }`. Heuristic or user-confirmed. |
| `overview` | Object | `{ projectName, summary, problemStatement, targetUsers, goals, scope, outOfScope }`. |
| `estimates` | Object | `{ difficulty, estimatedDuration, recommendedTeamSize, teamRoles, estimatedCost: { minimum, maximum, currency } }`. |
| `features` | Array | Canonical feature definitions with priority, role mapping, and implementation flags. |
| `roles` | Array | User and operator actor personas with interactive status and capability permissions. |
| `requirements` | Array | Functional, non-functional, and constraint requirements linked to feature IDs. |
| `database` | Object | MongoDB / SQL collection definitions, fields, data types, and index configurations (Software & Hybrid). |
| `apis` | Array | Endpoint specifications with HTTP method, path, request/response bodies, and expected status codes. |
| `software` | Object | `{ applicable: boolean, recommendedTechStack, screens, prototype }` (Software & Hybrid). |
| `hardware` | Object | `{ applicable: boolean, components, wiringConnections, bomSummary, powerRequirements, spatialLayout3D, assemblyGuide }` (Hardware & Hybrid). |
| `prototype` | Object | Interactive prototype definition with `platform`, `startScreenId`, and screens composed of 17 whitelisted components. |
| `roadmap` | Array | Phased milestone plan with ordered phases, tasks, and quantifiable completion criteria. |
| `risks` | Array | Risk register with categorized items, severity levels, and actionable mitigation strategies. |
| `recommendations` | Array | Strategic and engineering recommendations for MVP and production rollout. |
| `assumptions` | Array | Key operating and architectural assumptions. |
| `openQuestions` | Array | Unresolved domain or technical questions. |

### Prototype Component & Action Contract

- **17 Whitelisted Safe Components**: `Heading`, `Text`, `Button`, `Input`, `Textarea`, `Select`, `Card`, `List`, `Table`, `ImagePlaceholder`, `Navbar`, `Sidebar`, `Tabs`, `Badge`, `Form`, `Modal`, `StatCard`.
- **9 Whitelisted Interactive Actions**: `NAVIGATE`, `OPEN_MODAL`, `CLOSE_MODAL`, `SET_VALUE`, `SUBMIT_DEMO`, `SHOW_MESSAGE`, `FILTER_DEMO_DATA`, `SELECT_ITEM`, `BACK`.
- **Safe Execution Guarantee**: Component rendering and action evaluation run in a pure, sandboxed React state engine with zero `eval()` or dynamic code evaluation. Unknown components and actions degrade gracefully without crashing.

