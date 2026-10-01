package com.ideastruct.infrastructure.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class DemoBlueprintProvider implements AiBlueprintProvider {

    private final ObjectMapper objectMapper;
    private final com.ideastruct.domain.classification.ProjectClassifier classifier;

    public DemoBlueprintProvider(ObjectMapper objectMapper) {
        this(objectMapper, new com.ideastruct.domain.classification.ProjectClassifier());
    }

    @org.springframework.beans.factory.annotation.Autowired
    public DemoBlueprintProvider(ObjectMapper objectMapper, com.ideastruct.domain.classification.ProjectClassifier classifier) {
        this.objectMapper = objectMapper;
        this.classifier = classifier != null ? classifier : new com.ideastruct.domain.classification.ProjectClassifier();
    }

    @Override
    public Map<String, Object> generateBlueprint(String title, String idea) {
        return generateBlueprint(title, idea, null);
    }

    @Override
    public Map<String, Object> generateBlueprint(String title, String idea, String typeOverride) {
        try {
            com.ideastruct.domain.classification.ProjectClassification classification =
                    classifier.classify(title, idea, typeOverride);

            String fixtureFile;
            if ("HARDWARE".equalsIgnoreCase(classification.getType())) {
                String text = ((title != null ? title : "") + " " + (idea != null ? idea : "")).toLowerCase();
                if (text.contains("parking") || text.contains("park") || text.contains("spotsense") || text.contains("garage") || text.contains("occupancy")) {
                    fixtureFile = "fixtures/hardware_parking_blueprint.json";
                } else if (text.contains("feeder") || text.contains("pet") || text.contains("kibble") || text.contains("nutripaw") || text.contains("food dispenser") || text.contains("load cell")) {
                    fixtureFile = "fixtures/hardware_pet_feeder_blueprint.json";
                } else if (text.contains("soil") || text.contains("irrigat") || text.contains("plant") || text.contains("crop")
                        || text.contains("farm") || text.contains("greenhouse") || text.contains("garden")
                        || text.contains("valve") || text.contains("moisture") || text.contains("water")) {
                    fixtureFile = "fixtures/hardware_agriculture_blueprint.json";
                } else if (text.contains("health") || text.contains("wearable") || text.contains("pulse") || text.contains("heart")
                        || text.contains("oximeter") || text.contains("wrist") || text.contains("fitness") || text.contains("patient")
                        || text.contains("temp") || text.contains("biometric")) {
                    fixtureFile = "fixtures/hardware_wearable_blueprint.json";
                } else if (text.contains("robot") || text.contains("rover") || text.contains("obstacle") || text.contains("chassis")
                        || text.contains("sonar") || text.contains("servo") || text.contains("motor") || text.contains("car")
                        || text.contains("autonomous") || text.contains("vehicle")) {
                    fixtureFile = "fixtures/hardware_robotics_blueprint.json";
                } else {
                    fixtureFile = "fixtures/hardware_blueprint.json";
                }
            } else if ("HYBRID".equalsIgnoreCase(classification.getType())) {
                fixtureFile = "fixtures/hybrid_blueprint.json";
            } else {
                fixtureFile = "fixtures/food_ordering_blueprint.json";
            }

            ClassPathResource resource = new ClassPathResource(fixtureFile);
            try (InputStream is = resource.getInputStream()) {
                Map<String, Object> fixture = objectMapper.readValue(is, new TypeReference<LinkedHashMap<String, Object>>() {});

                // Ensure schemaVersion is 2.0
                fixture.put("schemaVersion", "2.0");

                // Ensure the overview reflects the current project title
                if (fixture.containsKey("overview") && fixture.get("overview") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> overview = (Map<String, Object>) fixture.get("overview");
                    if (title != null && !title.isBlank()) {
                        overview.put("projectName", title);
                    }
                }

                // Ensure classification reflects this evaluation
                Map<String, Object> classMap = new LinkedHashMap<>();
                classMap.put("type", classification.getType());
                classMap.put("reason", classification.getReason());
                classMap.put("confidence", classification.getConfidence());
                fixture.put("classification", classMap);
                fixture.put("projectType", classification.getType());

                return fixture;
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load demo blueprint fixture: " + e.getMessage(), e);
        }
    }

    @Override
    public String getSource() {
        return "DEMO";
    }

    @Override
    public String getProviderName() {
        return null; // Truthful: DEMO does not invoke any live AI provider
    }

    @Override
    public String getModelName() {
        return "deterministic-fixture-v1";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
