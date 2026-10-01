package com.ideastruct.domain.classification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ProjectClassifierTest {

    private ProjectClassifier classifier;

    @BeforeEach
    void setUp() {
        classifier = new ProjectClassifier();
    }

    @Test
    @DisplayName("Classifies pure software project as SOFTWARE")
    void shouldClassifySoftwareProject() {
        String title = "Smart Task & Habit Tracker";
        String idea = "A web app and mobile app for tracking personal habits with user login, notifications, a dashboard, and a PostgreSQL database.";

        ProjectClassification classification = classifier.classify(title, idea, null);

        assertNotNull(classification);
        assertEquals("SOFTWARE", classification.getType());
        assertEquals("HIGH", classification.getConfidence());
        assertTrue(classification.getReason().contains("software architecture"));
    }

    @Test
    @DisplayName("Classifies pure electronics/embedded project as HARDWARE")
    void shouldClassifyHardwareProject() {
        String title = "Automated Soil Moisture Irrigation Device";
        String idea = "An ESP32 microcontroller circuit with a capacitive soil moisture sensor, relay module, 5V power supply, and buzzer for physical alert.";

        ProjectClassification classification = classifier.classify(title, idea, null);

        assertNotNull(classification);
        assertEquals("HARDWARE", classification.getType());
        assertTrue("HIGH".equals(classification.getConfidence()) || "MEDIUM".equals(classification.getConfidence()));
        assertTrue(classification.getReason().contains("circuit design") || classification.getReason().contains("hardware"));
    }

    @Test
    @DisplayName("Classifies IoT connected device project as HYBRID")
    void shouldClassifyHybridProject() {
        String title = "IoT Smart Home Energy Monitor";
        String idea = "An IoT connected device using an ESP32 microcontroller and current sensor that transmits telemetry via MQTT to a cloud backend and mobile app dashboard.";

        ProjectClassification classification = classifier.classify(title, idea, null);

        assertNotNull(classification);
        assertEquals("HYBRID", classification.getType());
        assertEquals("HIGH", classification.getConfidence());
        assertTrue(classification.getReason().contains("combines physical hardware") || classification.getReason().contains("software application"));
    }

    @Test
    @DisplayName("Respects explicit manual override")
    void shouldRespectManualOverride() {
        String title = "Ambiguous System";
        String idea = "A generic telemetry system for gathering data.";

        ProjectClassification classification = classifier.classify(title, idea, "HARDWARE");

        assertNotNull(classification);
        assertEquals("HARDWARE", classification.getType());
        assertEquals("HIGH", classification.getConfidence());
        assertTrue(classification.getReason().contains("Explicitly specified"));
    }

    @Test
    @DisplayName("Proves all 4 modes: AUTO, SOFTWARE, HARDWARE, HYBRID")
    void shouldProveAllFourModes() {
        String genericIdea = "A system that manages operations and records data efficiently.";

        // Mode 1: AUTO (no override) -> heuristic default
        ProjectClassification autoClass = classifier.classify("Generic Tool", genericIdea, null);
        assertNotNull(autoClass);
        assertEquals("SOFTWARE", autoClass.getType());

        // Mode 2: SOFTWARE override
        ProjectClassification swClass = classifier.classify("Generic Tool", genericIdea, "SOFTWARE");
        assertEquals("SOFTWARE", swClass.getType());
        assertEquals("HIGH", swClass.getConfidence());
        assertTrue(swClass.getReason().contains("Explicitly specified"));

        // Mode 3: HARDWARE override
        ProjectClassification hwClass = classifier.classify("Generic Tool", genericIdea, "HARDWARE");
        assertEquals("HARDWARE", hwClass.getType());
        assertEquals("HIGH", hwClass.getConfidence());
        assertTrue(hwClass.getReason().contains("Explicitly specified"));

        // Mode 4: HYBRID override
        ProjectClassification hyClass = classifier.classify("Generic Tool", genericIdea, "HYBRID");
        assertEquals("HYBRID", hyClass.getType());
        assertEquals("HIGH", hyClass.getConfidence());
        assertTrue(hyClass.getReason().contains("Explicitly specified"));
    }

    @Test
    @DisplayName("Low confidence classification honestly states Needs confirmation")
    void shouldReportLowConfidenceHonestly() {
        // Idea with no domain keywords
        String vagueIdea = "Something completely abstract that has no specific words at all.";
        ProjectClassification classification = classifier.classify("Abstract Idea", vagueIdea, null);

        assertNotNull(classification);
        assertEquals("LOW", classification.getConfidence());
        assertTrue(classification.getReason().contains("Needs confirmation by user"));
    }
}
