package com.ideastruct.api.controller;
import org.bson.Document;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
class HealthControllerTest {

    @Test
    @DisplayName("Health endpoint reports UP when MongoDB ping succeeds")
    void shouldReportUpWhenDatabaseReachable() {
        MongoOperations mongoOperations = mock(MongoOperations.class);
        when(mongoOperations.executeCommand(any(Document.class))).thenReturn(new Document("ok", 1.0));

        HealthController controller = new HealthController(mongoOperations);
        ResponseEntity<Map<String, Object>> response = controller.checkHealth();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("RUNNING", body.get("backend"));
        assertEquals("UP", body.get("status"));

        @SuppressWarnings("unchecked")
        Map<String, Object> db = (Map<String, Object>) body.get("database");
        assertNotNull(db);
        assertEquals("UP", db.get("status"));
        assertEquals("ideastruct_ai", db.get("databaseName"));
    }

    @Test
    @DisplayName("Health endpoint reports DEGRADED when MongoDB ping fails, keeping backend running")
    void shouldReportDegradedWhenDatabaseUnreachable() {
        MongoOperations mongoOperations = mock(MongoOperations.class);
        when(mongoOperations.executeCommand(any(Document.class))).thenThrow(new RuntimeException("Connection timed out"));

        HealthController controller = new HealthController(mongoOperations);
        ResponseEntity<Map<String, Object>> response = controller.checkHealth();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("RUNNING", body.get("backend"));
        assertEquals("DEGRADED", body.get("status"));

        @SuppressWarnings("unchecked")
        Map<String, Object> db = (Map<String, Object>) body.get("database");
        assertNotNull(db);
        assertEquals("DOWN", db.get("status"));
        assertTrue(db.get("error").toString().contains("Connection timed out"));
    }
}
