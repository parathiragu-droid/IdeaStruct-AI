package com.ideastruct.api.controller;

import com.ideastruct.api.dto.*;
import com.ideastruct.domain.model.Project;
import com.ideastruct.application.service.BlueprintService;
import com.ideastruct.application.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final BlueprintService blueprintService;
    private final com.ideastruct.application.service.ValidationService validationService;

    public ProjectController(ProjectService projectService, BlueprintService blueprintService, com.ideastruct.application.service.ValidationService validationService) {
        this.projectService = projectService;
        this.blueprintService = blueprintService;
        this.validationService = validationService;
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody CreateProjectRequest request) {
        Project created = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<Page<ProjectSummaryDTO>> getProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int boundedSize = Math.min(Math.max(size, 1), 100);
        int boundedPage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize);
        return ResponseEntity.ok(projectService.getProjects(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        Project project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable String id,
            @RequestHeader(value = "If-Match", required = false) Long headerRevision,
            @RequestBody UpdateProjectRequest request) {
        Project updated = projectService.updateProject(id, request, headerRevision);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable String id,
            @RequestHeader(value = "If-Match", required = false) Long headerRevision,
            @RequestParam(value = "revision", required = false) Long queryRevision) {
        Long revision = headerRevision != null ? headerRevision : queryRevision;
        projectService.deleteProject(id, revision);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<Project> generateBlueprint(
            @PathVariable String id,
            @Valid @RequestBody GenerateBlueprintRequest request) {
        Project project = blueprintService.generateInitialBlueprint(id, request.getExpectedRevision(), request.getMode());
        return ResponseEntity.ok(project);
    }

    @PutMapping("/{id}/blueprint")
    public ResponseEntity<Project> updateBlueprint(
            @PathVariable String id,
            @RequestHeader(value = "If-Match", required = false) Long headerRevision,
            @Valid @RequestBody UpdateBlueprintRequest request) {
        Long revision = headerRevision != null ? headerRevision : request.getExpectedRevision();
        Project updated = blueprintService.updateBlueprint(id, request.getBlueprint(), revision);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/regenerate")
    public ResponseEntity<RegenerateResponse> regenerateBlueprint(
            @PathVariable String id,
            @RequestHeader(value = "If-Match", required = false) Long headerRevision,
            @RequestBody RegenerateRequest request) {
        if (headerRevision != null && request.getExpectedRevision() == null) {
            request.setExpectedRevision(headerRevision);
        }
        RegenerateResponse response = blueprintService.proposeRegeneration(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<Project> validateBlueprint(
            @PathVariable String id,
            @RequestHeader(value = "If-Match", required = false) Long headerRevision,
            @RequestParam(value = "revision", required = false) Long queryRevision,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        Long revision = headerRevision != null ? headerRevision : queryRevision;
        if (revision == null && body != null && body.containsKey("expectedRevision") && body.get("expectedRevision") != null) {
            try {
                revision = Long.valueOf(String.valueOf(body.get("expectedRevision")));
            } catch (Exception ignored) {}
        }
        Project validated = validationService.validateProject(id, revision);
        return ResponseEntity.ok(validated);
    }
}
