package com.ideastruct.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class UpdateBlueprintRequest {

    @NotNull(message = "Blueprint payload is required")
    private Map<String, Object> blueprint;

    private Long expectedRevision;

    public UpdateBlueprintRequest() {}

    public UpdateBlueprintRequest(Map<String, Object> blueprint, Long expectedRevision) {
        this.blueprint = blueprint;
        this.expectedRevision = expectedRevision;
    }

    public Map<String, Object> getBlueprint() {
        return blueprint;
    }

    public void setBlueprint(Map<String, Object> blueprint) {
        this.blueprint = blueprint;
    }

    public Long getExpectedRevision() {
        return expectedRevision;
    }

    public void setExpectedRevision(Long expectedRevision) {
        this.expectedRevision = expectedRevision;
    }
}
