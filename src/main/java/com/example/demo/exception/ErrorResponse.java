package com.example.demo.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private LocalDateTime timestamp;
    private String message;
    private String details;
    private int status;

    public ErrorResponse(String message, String details, int status) {
        this.timestamp = LocalDateTime.now();
        this.message = message;
        this.details = details;
        this.status = status;
    }

    // Getters and Setters
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
}
