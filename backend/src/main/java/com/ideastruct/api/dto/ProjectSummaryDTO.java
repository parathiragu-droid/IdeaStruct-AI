package com.ideastruct.api.dto;

import com.ideastruct.domain.model.Project;

import java.time.Instant;

public class ProjectSummaryDTO {
    private String id;
    private String title;
    private long revision;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean hasBlueprint;
    private boolean blueprintOutdated;
    private String generationSource;
    private String typeOverride;
    private String projectType;

    public ProjectSummaryDTO() {}

    public static ProjectSummaryDTO fromProject(Project project) {
        ProjectSummaryDTO dto = new ProjectSummaryDTO();
        dto.setId(project.getId());
        dto.setTitle(project.getTitle());
        dto.setRevision(project.getRevision());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        dto.setHasBlueprint(project.getBlueprint() != null && !project.getBlueprint().isEmpty());
        dto.setBlueprintOutdated(project.isBlueprintOutdated());
        dto.setTypeOverride(project.getTypeOverride());
        if (project.getBlueprint() != null && project.getBlueprint().containsKey("projectType")) {
            dto.setProjectType(String.valueOf(project.getBlueprint().get("projectType")));
        } else if (project.getTypeOverride() != null) {
            dto.setProjectType(project.getTypeOverride());
        }
        if (project.getGenerationMetadata() != null) {
            dto.setGenerationSource(project.getGenerationMetadata().getSource());
        }
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getRevision() {
        return revision;
    }

    public void setRevision(long revision) {
        this.revision = revision;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isHasBlueprint() {
        return hasBlueprint;
    }

    public void setHasBlueprint(boolean hasBlueprint) {
        this.hasBlueprint = hasBlueprint;
    }

    public boolean isBlueprintOutdated() {
        return blueprintOutdated;
    }

    public void setBlueprintOutdated(boolean blueprintOutdated) {
        this.blueprintOutdated = blueprintOutdated;
    }

    public String getGenerationSource() {
        return generationSource;
    }

    public void setGenerationSource(String generationSource) {
        this.generationSource = generationSource;
    }

    public String getTypeOverride() {
        return typeOverride;
    }

    public void setTypeOverride(String typeOverride) {
        this.typeOverride = typeOverride;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }
}
