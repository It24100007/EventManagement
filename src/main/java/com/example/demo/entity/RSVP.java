package com.example.demo.entity;

import com.example.demo.enums.RSVPResponse;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rsvp", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"customer_id", "event_id"})
})
public class RSVP {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RSVPResponse response;

    @Column(name = "rsvp_date")
    private LocalDateTime rsvpDate;

    @PrePersist
    protected void onCreate() {
        rsvpDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public RSVPResponse getResponse() { return response; }
    public void setResponse(RSVPResponse response) { this.response = response; }
    public LocalDateTime getRsvpDate() { return rsvpDate; }
    public void setRsvpDate(LocalDateTime rsvpDate) { this.rsvpDate = rsvpDate; }
}