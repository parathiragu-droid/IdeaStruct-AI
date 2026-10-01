package com.ideastruct.api.dto;

import java.util.Map;

public class RegenerateResponse {
    private long baseRevision;
    private String section;
    private Map<String, Object> candidate;
    private String diffSummary;

    public RegenerateResponse() {}

    public RegenerateResponse(long baseRevision, String section, Map<String, Object> candidate, String diffSummary) {
        this.baseRevision = baseRevision;
        this.section = section;
        this.candidate = candidate;
        this.diffSummary = diffSummary;
    }

    public long getBaseRevision() {
        return baseRevision;
    }

    public void setBaseRevision(long baseRevision) {
        this.baseRevision = baseRevision;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Map<String, Object> getCandidate() {
        return candidate;
    }

    public void setCandidate(Map<String, Object> candidate) {
        this.candidate = candidate;
    }

    public String getDiffSummary() {
        return diffSummary;
    }

    public void setDiffSummary(String diffSummary) {
        this.diffSummary = diffSummary;
    }
}
