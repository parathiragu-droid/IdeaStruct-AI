# Recommended MongoDB Indexes for IdeaStruct AI

Database: `ideastruct_ai`  
Target Collection: `projects`

---

## 1. Index Strategy Overview

IdeaStruct AI stores each software idea and its associated generated blueprint as a single, atomic **Project Aggregate**. The collection query patterns are:
1. Primary key lookup by ID (`findById`).
2. Paginated list retrieval ordered by recent activity (`findAll(Sort.by(Direction.DESC, "updatedAt"))`).
3. Title uniqueness check to prevent accidental duplicate projects.

---

## 2. Production Index Definitions

### Index 1: Primary Key (System Default)
- **Field:** `_id: 1`
- **Unique:** Yes
- **Usage:** Point queries for `GET /api/projects/{id}`, `PATCH /api/projects/{id}`, `PUT /api/projects/{id}/blueprint`, and `DELETE /api/projects/{id}`.

### Index 2: Project Recency Index
- **Specification:**
  ```javascript
  db.projects.createIndex({ "updatedAt": -1 }, { name: "idx_projects_updated_at" })
  ```
- **Rationale:** Powers the project dashboard list query (`GET /api/projects?page=0&size=20`), guaranteeing index-backed sorting without in-memory SORT stages.

### Index 3: Case-Insensitive Unique Title (Optional / Recommended)
- **Specification:**
  ```javascript
  db.projects.createIndex(
    { "title": 1 },
    { 
      name: "idx_projects_unique_title",
      collation: { locale: "en", strength: 2 },
      sparse: true
    }
  )
  ```
- **Rationale:** Prevents duplicate projects with matching names.

---

## 3. Mongo Shell Execution

To create these indexes manually via `mongosh`:

```bash
mongosh "mongodb://localhost:27017/ideastruct_ai"
```

```javascript
use ideastruct_ai;

// Recency index
db.projects.createIndex({ "updatedAt": -1 }, { name: "idx_projects_updated_at" });

// Verify created indexes
db.projects.getIndexes();
```
