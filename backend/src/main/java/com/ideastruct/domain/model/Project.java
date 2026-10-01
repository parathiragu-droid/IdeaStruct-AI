package com.ideastruct.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "projects")
public class Project {

    @Id
    private String id;

    private String title;
    private String idea;
    private String typeOverride; // "AUTO", "SOFTWARE", "HARDWARE", "HYBRID" or null
    private Instant createdAt;
    private Instant updatedAt;
    private long revision = 1L;

    private Map<String, Object> blueprint;
    private String blueprintBasedOnIdeaHash;
    private boolean blueprintOutdated = false;

    private GenerationMetadata generationMetadata;
    private List<ValidationIssue> validationIssues = new ArrayList<>();
    private Instant validationCheckedAt;
    private String lastGenerationError;

    public Project() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Project(String title, String idea) {
        this(title, idea, null);
    }

    public Project(String title, String idea, String typeOverride) {
        this();
        this.title = title;
        this.idea = idea;
        this.typeOverride = typeOverride;
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

    public String getIdea() {
        return idea;
    }

    public void setIdea(String idea) {
        this.idea = idea;
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

    public long getRevision() {
        return revision;
    }

    public void setRevision(long revision) {
        this.revision = revision;
    }

    public Map<String, Object> getBlueprint() {
        return blueprint;
    }

    public void setBlueprint(Map<String, Object> blueprint) {
        this.blueprint = blueprint;
    }

    public String getBlueprintBasedOnIdeaHash() {
        return blueprintBasedOnIdeaHash;
    }

    public void setBlueprintBasedOnIdeaHash(String blueprintBasedOnIdeaHash) {
        this.blueprintBasedOnIdeaHash = blueprintBasedOnIdeaHash;
    }

    public boolean isBlueprintOutdated() {
        return blueprintOutdated;
    }

    public void setBlueprintOutdated(boolean blueprintOutdated) {
        this.blueprintOutdated = blueprintOutdated;
    }

    public GenerationMetadata getGenerationMetadata() {
        return generationMetadata;
    }

    public void setGenerationMetadata(GenerationMetadata generationMetadata) {
        this.generationMetadata = generationMetadata;
    }

    public List<ValidationIssue> getValidationIssues() {
        return validationIssues;
    }

    public void setValidationIssues(List<ValidationIssue> validationIssues) {
        this.validationIssues = validationIssues != null ? validationIssues : new ArrayList<>();
    }

    public Instant getValidationCheckedAt() {
        return validationCheckedAt;
    }

    public void setValidationCheckedAt(Instant validationCheckedAt) {
        this.validationCheckedAt = validationCheckedAt;
    }

    public String getLastGenerationError() {
        return lastGenerationError;
    }

    public void setLastGenerationError(String lastGenerationError) {
        this.lastGenerationError = lastGenerationError;
    }

    public String getTypeOverride() {
        return typeOverride;
    }

    public void setTypeOverride(String typeOverride) {
        this.typeOverride = typeOverride;
    }
}
