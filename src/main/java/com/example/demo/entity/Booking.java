package com.example.demo.entity;

import com.example.demo.enums.BookingStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "seats_booked", nullable = false)
    private Integer seatsBooked;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false, length = 20)
    private BookingStatus bookingStatus;

    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @PrePersist
    protected void onCreate() {
        bookingDate = LocalDateTime.now();
        if (bookingStatus == null) {
            bookingStatus = BookingStatus.PENDING;
        }
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public Integer getSeatsBooked() { return seatsBooked; }
    public void setSeatsBooked(Integer seatsBooked) { this.seatsBooked = seatsBooked; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BookingStatus getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(BookingStatus bookingStatus) { this.bookingStatus = bookingStatus; }
    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
}
