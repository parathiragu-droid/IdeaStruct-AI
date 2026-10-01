# IdeaStruct AI — API Contracts & Testing Artifacts

> **Note for Developers:**  
> The actual runtime REST API implementation lives in the [`backend/`](../backend) folder (Spring Boot controllers and services).  
> This `api/` directory is the single authoritative hub for API contracts, request/response examples, and interactive Postman collections. No executable backend code runs from this folder.

---

## Directory Contents

| Path | Description |
| :--- | :--- |
| [`API_CONTRACT.md`](./API_CONTRACT.md) | Authoritative REST API contract detailing all 10 endpoints, optimistic locking semantics (`revision` counter and `If-Match`), status codes, and error models. |
| [`postman/`](./postman/) | Ready-to-import Postman collection and local environment for live endpoint testing. |
| [`examples/`](./examples/) | Sanitized, safe JSON payloads for requests and responses (no production keys or private data). |

---

## 1. Postman Quickstart

1. Open Postman.
2. Click **Import** and select:
   - Collection: [`api/postman/IdeaStruct_AI.postman_collection.json`](./postman/IdeaStruct_AI.postman_collection.json)
   - Environment: [`api/postman/IdeaStruct_Local.postman_environment.json`](./postman/IdeaStruct_Local.postman_environment.json)
3. Select the **IdeaStruct Local** environment (`baseUrl`: `http://localhost:8080/api`).
4. Execute queries against a running backend instance.

---

## 2. API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Probes service and live MongoDB ping status |
| `POST` | `/api/projects` | Creates a new Software, Hardware, or Hybrid engineering project draft |
| `GET` | `/api/projects` | Lists projects with pagination and sorting |
| `GET` | `/api/projects/{id}` | Retrieves full project aggregate and blueprint |
| `PATCH`| `/api/projects/{id}` | Updates project title or description (revision protected) |
| `DELETE`| `/api/projects/{id}`| Deletes project and saved blueprint |
| `POST` | `/api/projects/{id}/generate` | Generates full initial blueprint via AI or DEMO mode |
| `POST` | `/api/projects/{id}/regenerate` | Proposes partial/full regeneration candidate |
| `PUT` | `/api/projects/{id}/blueprint` | Saves updated blueprint or applies candidate |
| `POST` | `/api/projects/{id}/validate` | Executes comprehensive deterministic Plan Check validation rules |

See [`API_CONTRACT.md`](./API_CONTRACT.md) for full request/response schemas, validation constraints, and error codes.
