package com.ideastruct.domain.model;

import java.time.Instant;

public class GenerationMetadata {
    private String source; // LIVE_AI, DEMO, USER_EDITED
    private String provider;
    private String model;
    private Instant generatedAt;

    public GenerationMetadata() {}

    public GenerationMetadata(String source, String provider, String model, Instant generatedAt) {
        this.source = source;
        this.provider = provider;
        this.model = model;
        this.generatedAt = generatedAt;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }
}
