package com.ideastruct.api.dto;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {
    private String code;
    private String message;
    private Map<String, String> fieldErrors;
    private String timestamp;
    private String requestId;

    public ErrorResponse() {
        this.timestamp = Instant.now().toString();
    }

    public ErrorResponse(String code, String message, Map<String, String> fieldErrors, String requestId) {
        this.code = code;
        this.message = message;
        this.fieldErrors = fieldErrors;
        this.timestamp = Instant.now().toString();
        this.requestId = requestId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
}
