package com.ideastruct.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateProjectRequest {

    @NotBlank(message = "Project title is required")
    @Size(min = 3, max = 120, message = "Project title must be between 3 and 120 characters")
    private String title;

    @NotBlank(message = "Project idea is required")
    @Size(min = 50, max = 10000, message = "Project idea must be between 50 and 10000 characters")
    private String idea;

    private String typeOverride;

    public CreateProjectRequest() {}

    public CreateProjectRequest(String title, String idea) {
        this(title, idea, null);
    }

    public CreateProjectRequest(String title, String idea, String typeOverride) {
        this.title = title;
        this.idea = idea;
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

    public String getTypeOverride() {
        return typeOverride;
    }

    public void setTypeOverride(String typeOverride) {
        this.typeOverride = typeOverride;
    }
}
