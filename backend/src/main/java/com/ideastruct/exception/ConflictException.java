package com.ideastruct.exception;

public class ConflictException extends RuntimeException {
    private final long currentRevision;
    private final Long expectedRevision;

    public ConflictException(String message, long currentRevision, Long expectedRevision) {
        super(message);
        this.currentRevision = currentRevision;
        this.expectedRevision = expectedRevision;
    }

    public long getCurrentRevision() {
        return currentRevision;
    }

    public Long getExpectedRevision() {
        return expectedRevision;
    }
}
