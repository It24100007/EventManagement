package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                ex.getMessage(),
                request.getDescription(false),
                HttpStatus.NOT_FOUND.value()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InsufficientSeatsException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientSeatsException(
            InsufficientSeatsException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                ex.getMessage(),
                request.getDescription(false),
                HttpStatus.BAD_REQUEST.value()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidBookingException.class)
    public ResponseEntity<ErrorResponse> handleInvalidBookingException(
            InvalidBookingException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                ex.getMessage(),
                request.getDescription(false),
                HttpStatus.BAD_REQUEST.value()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(
            CustomException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                ex.getMessage(),
                request.getDescription(false),
                HttpStatus.BAD_REQUEST.value()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                "An error occurred: " + ex.getMessage(),
                request.getDescription(false),
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}