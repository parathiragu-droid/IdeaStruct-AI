package com.ideastruct.infrastructure.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.net.ssl.SSLSession;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class GeminiAiBlueprintProviderTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    private static class FakeHttpResponse implements HttpResponse<String> {
        private final int statusCode;
        private final String body;
        private final HttpHeaders customHeaders;

        public FakeHttpResponse(int statusCode, String body) {
            this(statusCode, body, HttpHeaders.of(Map.of(), (k, v) -> true));
        }

        public FakeHttpResponse(int statusCode, String body, HttpHeaders headers) {
            this.statusCode = statusCode;
            this.body = body;
            this.customHeaders = headers;
        }

        @Override public int statusCode() { return statusCode; }
        @Override public String body() { return body; }
        @Override public HttpRequest request() { return null; }
        @Override public Optional<HttpResponse<String>> previousResponse() { return Optional.empty(); }
        @Override public HttpHeaders headers() { return customHeaders; }
        @Override public URI uri() { return URI.create("https://example.com"); }
        @Override public HttpClient.Version version() { return HttpClient.Version.HTTP_2; }
        @Override public Optional<SSLSession> sslSession() { return Optional.empty(); }
    }

    private String createGeminiResponseEnvelope(String jsonContent) {
        return """
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      {
                        "text": %s
                      }
                    ],
                    "role": "model"
                  },
                  "finishReason": "STOP"
                }
              ]
            }
            """.formatted(objectMapper.valueToTree(jsonContent).toString());
    }

    private String getValidBlueprintJson() {
        return """
            {
              "schemaVersion": "1.0",
              "overview": {
                "projectName": "Test Project",
                "summary": "Summary of the test project.",
                "problemStatement": "Problem statement for the test project.",
                "targetUsers": ["Engineers"],
                "goals": ["Ship fast"],
                "scope": ["Core API"],
                "outOfScope": ["Mobile app"]
              },
              "features": [
                {
                  "id": "feature-auth",
                  "name": "User Auth",
                  "description": "Handles authentication",
                  "priority": "HIGH",
                  "roleIds": ["role-admin"],
                  "needsApi": true,
                  "needsUi": true,
                  "needsPersistence": true
                }
              ],
              "roles": [
                {
                  "id": "role-admin",
                  "name": "Administrator",
                  "description": "Full access",
                  "permissions": ["READ", "WRITE"],
                  "interactive": true
                }
              ],
              "requirements": [
                {
                  "id": "req-login",
                  "type": "FUNCTIONAL",
                  "description": "Users can log in",
                  "featureIds": ["feature-auth"],
                  "acceptanceCriteria": ["Valid credentials pass"],
                  "source": "USER_STATED"
                }
              ],
              "database": {
                "collections": [],
                "relationships": []
              },
              "apis": [],
              "uiScreens": [],
              "roadmap": [],
              "assumptions": [
                {
                  "id": "asm-oauth",
                  "description": "Standard OAuth is used",
                  "affectedEntityIds": ["feature-auth"],
                  "reason": "Standard security practice"
                }
              ],
              "openQuestions": [
                {
                  "id": "q-mfa",
                  "question": "Is MFA required for MVP?",
                  "affectedEntityIds": ["feature-auth"],
                  "whyItMatters": "Affects sprint velocity"
                }
              ]
            }
            """;
    }

    @Test
    @DisplayName("Valid schema response parses successfully and returns blueprint map")
    void shouldParseValidSchemaResponse() {
        FakeHttpResponse response = new FakeHttpResponse(200, createGeminiResponseEnvelope(getValidBlueprintJson()));
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        Map<String, Object> bp = provider.generateBlueprint("Test Project", "Some idea description");

        assertNotNull(bp);
        assertEquals("LIVE_AI", provider.getSource());
        assertEquals("google", provider.getProviderName());
        assertEquals("gemini-2.5-flash", provider.getModelName());
        assertEquals("1.0", bp.get("schemaVersion"));
        assertTrue(bp.containsKey("overview"));
        assertTrue(bp.containsKey("features"));
        assertTrue(bp.containsKey("assumptions"));
        assertTrue(bp.containsKey("openQuestions"));
    }

    @Test
    @DisplayName("Malformed JSON from provider throws RuntimeException with parse error")
    void shouldThrowOnMalformedJson() {
        FakeHttpResponse response = new FakeHttpResponse(200, createGeminiResponseEnvelope("```json { invalid: [json without close"));
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("AI blueprint generation failed"));
    }

    @Test
    @DisplayName("Empty candidates response throws RuntimeException")
    void shouldThrowOnEmptyCandidates() {
        FakeHttpResponse response = new FakeHttpResponse(200, "{\"candidates\": []}");
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("empty candidates"));
    }

    @Test
    @DisplayName("Blank text content in candidate throws RuntimeException")
    void shouldThrowOnBlankTextContent() {
        FakeHttpResponse response = new FakeHttpResponse(200, createGeminiResponseEnvelope("   "));
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("empty text content"));
    }

    @Test
    @DisplayName("HTTP Timeout throws RuntimeException")
    void shouldThrowOnTimeout() {
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper,
                req -> { throw new HttpTimeoutException("request timed out"); }
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("timed out"));
    }

    @Test
    @DisplayName("HTTP 500 Provider error propagates sanitized error message")
    void shouldThrowOnProviderServerError() {
        FakeHttpResponse response = new FakeHttpResponse(500, "{\"error\": {\"code\": 500, \"message\": \"Internal backend error\"}}");
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("500"));
        assertTrue(ex.getMessage().contains("Internal backend error"));
    }

    @Test
    @DisplayName("HTTP 429 Quota / Rate limit error propagates sanitized message")
    void shouldThrowOnQuotaError() {
        FakeHttpResponse response = new FakeHttpResponse(429, "{\"error\": {\"code\": 429, \"message\": \"Resource has been exhausted (e.g. check quota).\"}}");
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("429"));
        assertTrue(ex.getMessage().contains("Resource has been exhausted"));
    }

    @Test
    @DisplayName("Schema validation failure - missing required section throws IllegalArgumentException")
    void shouldThrowWhenRequiredSectionIsMissing() {
        String missingRoadmapJson = """
            {
              "schemaVersion": "1.0",
              "overview": { "projectName": "P" },
              "features": [],
              "roles": [],
              "requirements": [],
              "database": { "collections": [], "relationships": [] },
              "apis": [],
              "uiScreens": [],
              "assumptions": [],
              "openQuestions": []
            }
            """;

        FakeHttpResponse response = new FakeHttpResponse(200, createGeminiResponseEnvelope(missingRoadmapJson));
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("missing required section: roadmap"));
    }

    @Test
    @DisplayName("Schema validation failure - wrong schemaVersion throws IllegalArgumentException")
    void shouldThrowOnInvalidSchemaVersion() {
        String invalidVersionJson = getValidBlueprintJson().replace("\"1.0\"", "\"3.0\"");
        FakeHttpResponse response = new FakeHttpResponse(200, createGeminiResponseEnvelope(invalidVersionJson));
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("Invalid schemaVersion"));
    }

    @Test
    @DisplayName("Duplicate entity ID across sections is rejected")
    void shouldThrowOnDuplicateEntityId() {
        String duplicateIdJson = getValidBlueprintJson()
                .replace("\"feature-auth\"", "\"id-clash\"")
                .replace("\"role-admin\"", "\"id-clash\"");

        FakeHttpResponse response = new FakeHttpResponse(200, createGeminiResponseEnvelope(duplicateIdJson));
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> response
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        assertTrue(ex.getMessage().contains("Duplicate entity ID"));
    }

    @Test
    @DisplayName("HTTP 503 honors Retry-After header and stops at bounded retry limit")
    void shouldHonorRetryAfterAndBeBounded() {
        java.util.concurrent.atomic.AtomicInteger callCount = new java.util.concurrent.atomic.AtomicInteger(0);
        HttpHeaders headers = HttpHeaders.of(Map.of("Retry-After", java.util.List.of("1")), (k, v) -> true);
        FakeHttpResponse response503 = new FakeHttpResponse(503, "{\"error\": {\"code\": 503, \"message\": \"Service Unavailable\"}}", headers);

        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "test-api-key", "gemini-2.5-flash", 30, 8192, objectMapper, req -> {
                    callCount.incrementAndGet();
                    return response503;
                }
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                provider.generateBlueprint("Test Project", "Idea")
        );

        // 1 initial call + 2 retries = 3 calls total (bounded finite retries)
        assertEquals(3, callCount.get());
        assertTrue(ex.getMessage().contains("503"));
        assertTrue(ex.getMessage().contains("Service Unavailable"));
    }

    @Test
    @DisplayName("Missing API key marks provider unavailable and throws on call")
    void shouldThrowWhenApiKeyIsMissing() {
        GeminiAiBlueprintProvider provider = new GeminiAiBlueprintProvider(
                "", "gemini-2.5-flash", 30, 8192, objectMapper, req -> null
        );

        assertFalse(provider.isAvailable());
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                provider.generateBlueprint("Project", "Idea")
        );
        assertTrue(ex.getMessage().contains("Gemini API key is not configured"));
    }
}
