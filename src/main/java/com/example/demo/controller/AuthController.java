package com.example.demo.controller;

import com.example.demo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/customer/login")
    public ResponseEntity<Map<String, Object>> customerLogin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Map<String, Object> response = authService.loginCustomer(email, password);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/manager/login")
    public ResponseEntity<Map<String, Object>> managerLogin(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Map<String, Object> response = authService.loginFinanceManager(email, password);
        return ResponseEntity.ok(response);
    }
}