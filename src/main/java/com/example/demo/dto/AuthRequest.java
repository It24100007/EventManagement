package com.example.demo.dto;
import lombok.*;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
