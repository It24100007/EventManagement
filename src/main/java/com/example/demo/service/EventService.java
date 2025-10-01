package com.example.demo.service;

import com.example.demo.entity.Event;
import com.example.demo.repository.EventRepository;
import com.example.demo.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getAvailableEvents() {
        return eventRepository.findAvailableEvents(LocalDateTime.now());
    }

    public Event getEventById(Integer id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    public List<Event> getUpcomingEvents() {
        return eventRepository.findByEventDateAfter(LocalDateTime.now());
    }

    @Transactional
    public synchronized boolean reserveSeats(Integer eventId, Integer seats) {
        Event event = getEventById(eventId);

        if (event.getAvailableSeats() >= seats) {
            event.setAvailableSeats(event.getAvailableSeats() - seats);
            eventRepository.save(event);
            return true;
        }
        return false;
    }

    @Transactional
    public synchronized void releaseSeats(Integer eventId, Integer seats) {
        Event event = getEventById(eventId);
        event.setAvailableSeats(event.getAvailableSeats() + seats);
        eventRepository.save(event);
    }
}