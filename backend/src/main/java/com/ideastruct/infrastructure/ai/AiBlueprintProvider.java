package com.ideastruct.infrastructure.ai;

import java.util.Map;

public interface AiBlueprintProvider {
    /**
     * Generates a structured blueprint from the given software title and idea.
     *
     * @param title the software project title
     * @param idea the natural language idea description
     * @return parsed blueprint JSON map matching canonical schema v1.0 / v2.0
     */
    Map<String, Object> generateBlueprint(String title, String idea);

    /**
     * Generates a structured blueprint honoring an explicit project type override if provided.
     *
     * @param title the project title
     * @param idea the natural language idea description
     * @param typeOverride explicit override (SOFTWARE, HARDWARE, HYBRID) or null for AUTO
     * @return parsed blueprint JSON map
     */
    default Map<String, Object> generateBlueprint(String title, String idea, String typeOverride) {
        return generateBlueprint(title, idea);
    }

    /**
     * Returns the generation source category (e.g. "LIVE_AI" or "DEMO").
     */
    String getSource();

    /**
     * Returns the name of the external AI provider (e.g. "google" for Gemini),
     * or null if this is an internal demo/fixture generator.
     */
    String getProviderName();

    /**
     * Returns the model identifier used by this provider.
     */
    String getModelName();

    /**
     * Checks if this provider has valid credentials and is ready for live requests.
     */
    boolean isAvailable();
}
