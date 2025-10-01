package com.example.demo.exception;

public class InsufficientSeatsException extends RuntimeException {
    public InsufficientSeatsException(String message) {
        super(message);
    }
}