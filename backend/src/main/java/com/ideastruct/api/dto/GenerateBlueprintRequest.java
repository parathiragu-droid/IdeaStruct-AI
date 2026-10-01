package com.ideastruct.api.dto;

import jakarta.validation.constraints.NotNull;

public class GenerateBlueprintRequest {

    @NotNull(message = "expectedRevision is required")
    private Long expectedRevision;

    private String mode; // Optional: "DEMO" or "LIVE_AI"

    public GenerateBlueprintRequest() {}

    public GenerateBlueprintRequest(Long expectedRevision, String mode) {
        this.expectedRevision = expectedRevision;
        this.mode = mode;
    }

    public Long getExpectedRevision() {
        return expectedRevision;
    }

    public void setExpectedRevision(Long expectedRevision) {
        this.expectedRevision = expectedRevision;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}
