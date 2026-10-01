package com.ideastruct.api.controller;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final MongoOperations mongoOperations;

    public HealthController(MongoOperations mongoOperations) {
        this.mongoOperations = mongoOperations;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("backend", "RUNNING");
        response.put("timestamp", Instant.now().toString());

        Map<String, Object> dbStatus = new LinkedHashMap<>();
        boolean dbHealthy = false;
        try {
            Document pingCommand = new Document("ping", 1);
            Document pingResult = mongoOperations.executeCommand(pingCommand);
            Number ok = pingResult != null ? (Number) pingResult.get("ok") : null;
            if (ok != null && ok.doubleValue() == 1.0) {
                dbHealthy = true;
                dbStatus.put("status", "UP");
                dbStatus.put("databaseName", "ideastruct_ai");
                dbStatus.put("message", "MongoDB is reachable and responding to ping");
            } else {
                dbStatus.put("status", "DOWN");
                dbStatus.put("message", "Unexpected ping response: " + (pingResult != null ? pingResult.toJson() : "null"));
            }
        } catch (Exception ex) {
            dbStatus.put("status", "DOWN");
            dbStatus.put("error", ex.getClass().getSimpleName() + ": " + ex.getMessage());
            dbStatus.put("message", "MongoDB ping failed; database unreachable");
        }

        response.put("database", dbStatus);
        response.put("status", dbHealthy ? "UP" : "DEGRADED");

        return ResponseEntity.ok(response);
    }
}
