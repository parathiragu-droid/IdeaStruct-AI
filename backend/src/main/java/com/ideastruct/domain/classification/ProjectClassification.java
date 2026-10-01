package com.ideastruct.domain.classification;

import java.util.Objects;

public class ProjectClassification {

    private String type; // SOFTWARE | HARDWARE | HYBRID
    private String reason;
    private String confidence; // LOW | MEDIUM | HIGH

    public ProjectClassification() {
    }

    public ProjectClassification(String type, String reason, String confidence) {
        this.type = type;
        this.reason = reason;
        this.confidence = confidence;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectClassification that = (ProjectClassification) o;
        return Objects.equals(type, that.type) &&
                Objects.equals(reason, that.reason) &&
                Objects.equals(confidence, that.confidence);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, reason, confidence);
    }

    @Override
    public String toString() {
        return "ProjectClassification{" +
                "type='" + type + '\'' +
                ", reason='" + reason + '\'' +
                ", confidence='" + confidence + '\'' +
                '}';
    }
}
