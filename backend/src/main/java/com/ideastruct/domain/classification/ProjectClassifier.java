package com.ideastruct.domain.classification;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class ProjectClassifier {

    private static final List<String> HARDWARE_KEYWORDS = List.of(
            "arduino", "esp32", "esp8266", "stm32", "raspberry pi", "microcontroller",
            "mcu", "sensor", "sensors", "actuator", "actuators", "circuit", "circuits",
            "wiring", "pcb", "breadboard", "gpio", "pinout", "voltage", "gnd",
            "resistor", "capacitor", "diode", "transistor", "mosfet", "relay",
            "voltage regulator", "power supply", "battery", "li-ion", "dht11", "dht22",
            "ultrasonic", "infrared", "pir", "accelerometer", "gyroscope", "mq-2", "mq-135",
            "moisture sensor", "gas sensor", "gas detector", "soil moisture", "stepper motor",
            "servo motor", "dc motor", "solenoid", "buzzer", "led strip", "neopixel",
            "oled display", "lcd1602", "7-segment", "i2c", "spi", "uart", "pwm",
            "soldering", "enclosure", "chassis", "robotics", "drone", "embedded device",
            "physical device", "hardware device", "firmware", "schematic"
    );

    private static final List<String> SOFTWARE_KEYWORDS = List.of(
            "web app", "website", "mobile app", "ios", "android", "flutter", "react native",
            "desktop app", "frontend", "ui/ux", "screens", "web portal", "portal",
            "backend", "rest api", "api", "apis", "database", "mongodb", "postgresql",
            "mysql", "sqlite", "redis", "cloud service", "saas", "dashboard", "analytics dashboard",
            "user login", "authentication", "signup", "user role", "e-commerce", "shopping cart",
            "payment gateway", "stripe", "subscription", "notification service", "crud",
            "platform", "management system", "crm", "erp", "booking system", "admin panel"
    );

    private static final List<String> HYBRID_TRIGGERS = List.of(
            "iot", "internet of things", "connected device", "smart home", "smart agriculture",
            "telemetry", "remote monitoring", "smart device with app", "hardware with mobile app",
            "embedded system with dashboard", "wearable synced", "fleet tracking", "cold chain",
            "asset tracker"
    );

    /**
     * Fast local preview and DEMO heuristic keyword classifier.
     * Note: This is a deterministic keyword-scoring heuristic rather than an ML/semantic classifier.
     * Respects manualOverride if explicitly provided and valid (SOFTWARE, HARDWARE, HYBRID).
     */
    public ProjectClassification classify(String title, String idea, String manualOverride) {
        if (manualOverride != null && !manualOverride.isBlank()) {
            String upper = manualOverride.trim().toUpperCase(Locale.ROOT);
            if ("SOFTWARE".equals(upper) || "HARDWARE".equals(upper) || "HYBRID".equals(upper)) {
                return new ProjectClassification(
                        upper,
                        "Explicitly specified by user as " + upper + " project.",
                        "HIGH"
                );
            }
        }

        String combined = ((title != null ? title : "") + " " + (idea != null ? idea : "")).toLowerCase(Locale.ROOT);

        int hardwareScore = calculateScore(combined, HARDWARE_KEYWORDS);
        int softwareScore = calculateScore(combined, SOFTWARE_KEYWORDS);
        int hybridTriggerScore = calculateScore(combined, HYBRID_TRIGGERS);

        // Check if both hardware and software aspects are present
        boolean hasHardware = hardwareScore > 0;
        boolean hasSoftware = softwareScore > 0;
        boolean explicitHybrid = hybridTriggerScore > 0;

        if (explicitHybrid || (hasHardware && hasSoftware && (hardwareScore >= 2 && softwareScore >= 2))) {
            String confidence = (explicitHybrid || (hardwareScore >= 3 && softwareScore >= 3)) ? "HIGH" : "MEDIUM";
            return new ProjectClassification(
                    "HYBRID",
                    "Project combines physical hardware/embedded electronics (sensors, controllers, or physical components) with a software application layer (mobile/web dashboard, APIs, or cloud database).",
                    confidence
            );
        } else if (hardwareScore > softwareScore && hardwareScore >= 1) {
            String confidence = hardwareScore >= 3 ? "HIGH" : (hardwareScore >= 2 ? "MEDIUM" : "LOW");
            String reason = "LOW".equals(confidence)
                    ? "Heuristic keyword matching found minimal hardware indicators; low confidence classification. Needs confirmation by user."
                    : "Project primarily focuses on physical circuit design, embedded controller selection, sensors/actuators, and wiring connections.";
            return new ProjectClassification(
                    "HARDWARE",
                    reason,
                    confidence
            );
        } else {
            String confidence = softwareScore >= 3 ? "HIGH" : (softwareScore >= 1 ? "MEDIUM" : "LOW");
            String reason = "LOW".equals(confidence)
                    ? "Heuristic keyword matching found minimal indicators; low confidence default to SOFTWARE. Needs confirmation by user."
                    : "Project focuses on software architecture, frontend screens, database schema design, and backend REST APIs.";
            return new ProjectClassification(
                    "SOFTWARE",
                    reason,
                    confidence
            );
        }
    }

    private int calculateScore(String text, List<String> keywords) {
        int score = 0;
        for (String keyword : keywords) {
            if (containsWordOrPhrase(text, keyword)) {
                score++;
            }
        }
        return score;
    }

    private boolean containsWordOrPhrase(String text, String phrase) {
        if (phrase.contains(" ")) {
            return text.contains(phrase);
        }
        // Word boundary regex for single word to avoid accidental partial matches
        Pattern pattern = Pattern.compile("\\b" + Pattern.quote(phrase) + "\\b");
        return pattern.matcher(text).find();
    }
}
