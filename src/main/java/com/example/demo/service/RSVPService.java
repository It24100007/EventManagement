package com.example.demo.service;

import com.example.demo.entity.RSVP;
import com.example.demo.entity.Customer;
import com.example.demo.entity.Event;
import com.example.demo.enums.RSVPResponse;
import com.example.demo.repository.RSVPRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class RSVPService {

    @Autowired
    private RSVPRepository rsvpRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EventService eventService;

    @Transactional
    public Map<String, Object> submitRSVP(Integer customerId, Integer eventId, String response) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Event event = eventService.getEventById(eventId);

        RSVPResponse rsvpResponse;
        try {
            rsvpResponse = RSVPResponse.valueOf(response.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomException("Invalid RSVP response. Must be YES, NO, or MAYBE");
        }

        // Check if RSVP already exists
        RSVP existingRSVP = rsvpRepository.findByCustomerAndEvent(customer, event).orElse(null);

        if (existingRSVP != null) {
            // Update existing RSVP
            existingRSVP.setResponse(rsvpResponse);
            rsvpRepository.save(existingRSVP);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "RSVP updated successfully");
            result.put("rsvpId", existingRSVP.getId());
            result.put("response", rsvpResponse.toString());
            return result;
        }

        // Create new RSVP
        RSVP rsvp = new RSVP();
        rsvp.setCustomer(customer);
        rsvp.setEvent(event);
        rsvp.setResponse(rsvpResponse);

        rsvp = rsvpRepository.save(rsvp);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "RSVP submitted successfully");
        result.put("rsvpId", rsvp.getId());
        result.put("response", rsvpResponse.toString());

        return result;
    }

    public List<RSVP> getCustomerRSVPs(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return rsvpRepository.findByCustomer(customer);
    }

    public List<RSVP> getEventRSVPs(Integer eventId) {
        Event event = eventService.getEventById(eventId);
        return rsvpRepository.findByEvent(event);
    }

    public Map<String, Object> getEventRSVPStatistics(Integer eventId) {
        Map<String, Object> stats = new HashMap<>();

        Long yesCount = rsvpRepository.countByEventAndResponse(eventId, RSVPResponse.YES);
        Long noCount = rsvpRepository.countByEventAndResponse(eventId, RSVPResponse.NO);
        Long maybeCount = rsvpRepository.countByEventAndResponse(eventId, RSVPResponse.MAYBE);

        stats.put("yes", yesCount);
        stats.put("no", noCount);
        stats.put("maybe", maybeCount);
        stats.put("total", yesCount + noCount + maybeCount);

        return stats;
    }
}