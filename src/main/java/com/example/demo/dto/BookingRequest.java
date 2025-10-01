package com.example.demo.dto;
import lombok.*;

@Data
public class BookingRequest {
    private Long customerId;
    private Long eventId;
    private Integer seats;
    private String seatsList;
    private String paymentMethod; // "CREDIT_CARD" etc.
}
