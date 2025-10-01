package com.example.demo.dto;
import lombok.*;

@Data
public class RSVPRequest {
    private Long customerId;
    private Long eventId;
    private String response; // YES/NO/MAYBE
}
