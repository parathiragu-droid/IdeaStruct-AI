package com.ideastruct.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${FRONTEND_URL:}")
    private String frontendUrl;

    @Value("${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
    private String configuredOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = new ArrayList<>();
        origins.add("http://localhost:5173");
        origins.add("http://127.0.0.1:5173");

        if (configuredOrigins != null && !configuredOrigins.isBlank()) {
            for (String origin : configuredOrigins.split(",")) {
                String trimmed = origin.trim();
                if (trimmed.endsWith("/")) {
                    trimmed = trimmed.substring(0, trimmed.length() - 1);
                }
                if (!trimmed.isEmpty() && !origins.contains(trimmed)) {
                    origins.add(trimmed);
                }
            }
        }

        if (frontendUrl != null && !frontendUrl.isBlank()) {
            for (String origin : frontendUrl.split(",")) {
                String trimmed = origin.trim();
                if (trimmed.endsWith("/")) {
                    trimmed = trimmed.substring(0, trimmed.length() - 1);
                }
                if (!trimmed.isEmpty() && !origins.contains(trimmed)) {
                    origins.add(trimmed);
                }
            }
        }

        registry.addMapping("/api/**")
                .allowedOrigins(origins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}

