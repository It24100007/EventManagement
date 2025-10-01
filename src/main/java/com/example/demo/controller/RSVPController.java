package com.example.demo.controller;

import com.example.demo.entity.RSVP;
import com.example.demo.service.RSVPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rsvp")
@CrossOrigin(origins = "*")
public class RSVPController {

    @Autowired
    private RSVPService rsvpService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitRSVP(@RequestBody Map<String, Object> rsvpData) {
        Integer customerId = (Integer) rsvpData.get("customerId");
        Integer eventId = (Integer) rsvpData.get("eventId");
        String response = (String) rsvpData.get("response");

        Map<String, Object> result = rsvpService.submitRSVP(customerId, eventId, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RSVP>> getCustomerRSVPs(@PathVariable Integer customerId) {
        return ResponseEntity.ok(rsvpService.getCustomerRSVPs(customerId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<RSVP>> getEventRSVPs(@PathVariable Integer eventId) {
        return ResponseEntity.ok(rsvpService.getEventRSVPs(eventId));
    }

    @GetMapping("/event/{eventId}/statistics")
    public ResponseEntity<Map<String, Object>> getEventRSVPStatistics(@PathVariable Integer eventId) {
        return ResponseEntity.ok(rsvpService.getEventRSVPStatistics(eventId));
    }
}