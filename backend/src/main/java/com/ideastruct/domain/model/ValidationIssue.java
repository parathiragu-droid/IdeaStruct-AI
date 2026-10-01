package com.ideastruct.domain.model;

import java.util.ArrayList;
import java.util.List;

public class ValidationIssue {
    private String id;
    private String ruleCode;
    private String severity; // ERROR, WARNING, INFO, NEEDS_CLARIFICATION
    private String message;
    private List<String> affectedEntityIds = new ArrayList<>();
    private String evidence;
    private String suggestedAction;
    private String source;
    private String status;

    public ValidationIssue() {}

    public ValidationIssue(String id, String ruleCode, String severity, String message,
                           List<String> affectedEntityIds, String evidence,
                           String suggestedAction, String source, String status) {
        this.id = id;
        this.ruleCode = ruleCode;
        this.severity = severity;
        this.message = message;
        if (affectedEntityIds != null) {
            this.affectedEntityIds = affectedEntityIds;
        }
        this.evidence = evidence;
        this.suggestedAction = suggestedAction;
        this.source = source;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public void setRuleCode(String ruleCode) {
        this.ruleCode = ruleCode;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getAffectedEntityIds() {
        return affectedEntityIds;
    }

    public void setAffectedEntityIds(List<String> affectedEntityIds) {
        this.affectedEntityIds = affectedEntityIds;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
