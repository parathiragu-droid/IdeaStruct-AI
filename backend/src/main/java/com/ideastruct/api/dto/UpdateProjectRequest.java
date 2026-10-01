package com.ideastruct.api.dto;

import jakarta.validation.constraints.Size;

public class UpdateProjectRequest {

    @Size(min = 3, max = 120, message = "Project title must be between 3 and 120 characters")
    private String title;

    @Size(min = 50, max = 10000, message = "Project idea must be between 50 and 10000 characters")
    private String idea;

    private Long expectedRevision;
    private String typeOverride;

    public UpdateProjectRequest() {}

    public UpdateProjectRequest(String title, String idea, Long expectedRevision) {
        this(title, idea, expectedRevision, null);
    }

    public UpdateProjectRequest(String title, String idea, Long expectedRevision, String typeOverride) {
        this.title = title;
        this.idea = idea;
        this.expectedRevision = expectedRevision;
        this.typeOverride = typeOverride;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIdea() {
        return idea;
    }

    public void setIdea(String idea) {
        this.idea = idea;
    }

    public Long getExpectedRevision() {
        return expectedRevision;
    }

    public void setExpectedRevision(Long expectedRevision) {
        this.expectedRevision = expectedRevision;
    }

    public String getTypeOverride() {
        return typeOverride;
    }

    public void setTypeOverride(String typeOverride) {
        this.typeOverride = typeOverride;
    }
}
