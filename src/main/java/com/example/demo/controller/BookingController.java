package com.example.demo.controller;

import com.example.demo.entity.Booking;
import com.example.demo.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Map<String, Object> bookingData) {
        Integer customerId = (Integer) bookingData.get("customerId");
        Integer eventId = (Integer) bookingData.get("eventId");
        Integer seats = (Integer) bookingData.get("seats");
        String paymentMethod = (String) bookingData.get("paymentMethod");

        Map<String, Object> response = bookingService.createBooking(customerId, eventId, seats, paymentMethod);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBooking(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> updateData) {
        Integer additionalSeats = updateData.get("additionalSeats");

        Map<String, Object> response = bookingService.updateBooking(id, additionalSeats);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Integer id) {
        Map<String, Object> response = bookingService.cancelBooking(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Booking>> getCustomerBookings(@PathVariable Integer customerId) {
        return ResponseEntity.ok(bookingService.getCustomerBookings(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getBookingStatistics() {
        return ResponseEntity.ok(bookingService.getBookingStatistics());
    }

    @GetMapping("/report")
    public ResponseEntity<List<Booking>> getBookingReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);

        return ResponseEntity.ok(bookingService.getBookingsByDateRange(start, end));
    }
}
