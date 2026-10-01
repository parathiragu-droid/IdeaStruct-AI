package com.ideastruct.exception;

import com.ideastruct.api.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        String reqId = UUID.randomUUID().toString().substring(0, 8);
        ErrorResponse err = new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage(), null, reqId);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        String reqId = UUID.randomUUID().toString().substring(0, 8);
        Map<String, String> details = new HashMap<>();
        details.put("currentRevision", String.valueOf(ex.getCurrentRevision()));
        if (ex.getExpectedRevision() != null) {
            details.put("expectedRevision", String.valueOf(ex.getExpectedRevision()));
        }
        ErrorResponse err = new ErrorResponse("CONFLICT", ex.getMessage(), details, reqId);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        String reqId = UUID.randomUUID().toString().substring(0, 8);
        ErrorResponse err = new ErrorResponse("BAD_REQUEST", ex.getMessage(), null, reqId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        String reqId = UUID.randomUUID().toString().substring(0, 8);
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        ErrorResponse err = new ErrorResponse("VALIDATION_ERROR", "Invalid request parameters.", fieldErrors, reqId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ErrorResponse> handleAiServiceException(AiServiceException ex) {
        String reqId = UUID.randomUUID().toString().substring(0, 8);
        log.warn("[ReqId: {}] AI service error: {}", reqId, ex.getMessage());
        HttpStatus status = ex.getStatusCode() == 429 ? HttpStatus.TOO_MANY_REQUESTS :
                           ex.getStatusCode() == 503 ? HttpStatus.SERVICE_UNAVAILABLE :
                           ex.getStatusCode() == 504 ? HttpStatus.GATEWAY_TIMEOUT :
                           ex.getStatusCode() == 400 ? HttpStatus.BAD_REQUEST :
                           HttpStatus.BAD_GATEWAY;
        ErrorResponse err = new ErrorResponse("AI_SERVICE_ERROR", ex.getMessage(), null, reqId);
        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        String reqId = UUID.randomUUID().toString().substring(0, 8);
        log.error("[ReqId: {}] Uncaught server exception", reqId, ex);
        ErrorResponse err = new ErrorResponse("INTERNAL_ERROR", "An internal server error occurred.", null, reqId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }
}
