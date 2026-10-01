package com.ideastruct.api.dto;

import jakarta.validation.constraints.NotNull;

public class RegenerateRequest {

    @NotNull(message = "expectedRevision is required")
    private Long expectedRevision;

    private String section; // "all", "features", "database", "apis", "uiScreens", "roadmap", etc.
    private String instructions; // User-specified regeneration focus
    private String mode; // Optional: "DEMO" or "LIVE_AI"

    public RegenerateRequest() {
        this.section = "all";
    }

    public RegenerateRequest(Long expectedRevision, String section, String instructions, String mode) {
        this.expectedRevision = expectedRevision;
        this.section = section != null ? section : "all";
        this.instructions = instructions;
        this.mode = mode;
    }

    public Long getExpectedRevision() {
        return expectedRevision;
    }

    public void setExpectedRevision(Long expectedRevision) {
        this.expectedRevision = expectedRevision;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}
