package com.example.demo.controller;

import com.example.demo.entity.Payment;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/pending")
    public ResponseEntity<List<Payment>> getPendingPayments() {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approvePayment(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> data) {
        Integer managerId = data.get("managerId");

        Map<String, Object> response = paymentService.approvePayment(id, managerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectPayment(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> data) {
        Integer managerId = data.get("managerId");

        Map<String, Object> response = paymentService.rejectPayment(id, managerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics() {
        return ResponseEntity.ok(paymentService.getPaymentStatistics());
    }

    @GetMapping("/report")
    public ResponseEntity<List<Payment>> getPaymentReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);

        return ResponseEntity.ok(paymentService.getPaymentsByDateRange(start, end));
    }
}