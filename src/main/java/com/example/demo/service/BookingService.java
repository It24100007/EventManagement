package com.example.demo.service;

import com.example.demo.entity.Booking;
import com.example.demo.entity.Customer;
import com.example.demo.entity.Event;
import com.example.demo.entity.Payment;
import com.example.demo.enums.BookingStatus;
import com.example.demo.enums.PaymentMethod;
import com.example.demo.enums.PaymentStatus;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.exception.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    public Map<String, Object> createBooking(Integer customerId, Integer eventId,
                                             Integer seats, String paymentMethod) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Event event = eventService.getEventById(eventId);

        // Validate seats availability
        if (event.getAvailableSeats() < seats) {
            throw new InsufficientSeatsException(
                    "Only " + event.getAvailableSeats() + " seats available"
            );
        }

        if (seats <= 0) {
            throw new InvalidBookingException("Number of seats must be greater than 0");
        }

        // Reserve seats
        if (!eventService.reserveSeats(eventId, seats)) {
            throw new InsufficientSeatsException("Unable to reserve seats");
        }

        // Create booking
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setEvent(event);
        booking.setSeatsBooked(seats);

        BigDecimal totalAmount = event.getPricePerSeat().multiply(new BigDecimal(seats));
        booking.setTotalAmount(totalAmount);
        booking.setBookingStatus(BookingStatus.PENDING);

        booking = bookingRepository.save(booking);

        // Create payment record
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(PaymentMethod.valueOf(paymentMethod));
        payment.setPaymentStatus(PaymentStatus.PENDING);

        payment = paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("bookingId", booking.getId());
        response.put("paymentId", payment.getId());
        response.put("message", "Booking created successfully. Awaiting payment approval.");
        response.put("totalAmount", totalAmount);

        return response;
    }

    @Transactional
    public Map<String, Object> updateBooking(Integer bookingId, Integer additionalSeats) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getBookingStatus() == BookingStatus.CANCELED) {
            throw new InvalidBookingException("Cannot update a canceled booking");
        }

        Event event = booking.getEvent();

        // Validate additional seats
        if (event.getAvailableSeats() < additionalSeats) {
            throw new InsufficientSeatsException(
                    "Only " + event.getAvailableSeats() + " seats available"
            );
        }

        // Reserve additional seats
        if (!eventService.reserveSeats(event.getId(), additionalSeats)) {
            throw new InsufficientSeatsException("Unable to reserve additional seats");
        }

        // Update booking
        int newTotalSeats = booking.getSeatsBooked() + additionalSeats;
        booking.setSeatsBooked(newTotalSeats);

        BigDecimal newTotalAmount = event.getPricePerSeat()
                .multiply(new BigDecimal(newTotalSeats));
        booking.setTotalAmount(newTotalAmount);

        booking = bookingRepository.save(booking);

        // Update payment
        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setAmount(newTotalAmount);
        paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("bookingId", booking.getId());
        response.put("totalSeats", newTotalSeats);
        response.put("totalAmount", newTotalAmount);
        response.put("message", "Booking updated successfully");

        return response;
    }

    @Transactional
    public Map<String, Object> cancelBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getBookingStatus() == BookingStatus.CANCELED) {
            throw new InvalidBookingException("Booking is already canceled");
        }

        // Release seats
        eventService.releaseSeats(booking.getEvent().getId(), booking.getSeatsBooked());

        // Update booking status
        booking.setBookingStatus(BookingStatus.CANCELED);
        bookingRepository.save(booking);

        // Process refund if payment was completed
        Payment payment = paymentRepository.findByBooking(booking).orElse(null);
        if (payment != null && payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            payment.setPaymentStatus(PaymentStatus.REFUND_REQUESTED);
            paymentRepository.save(payment);

            // Auto-process refund
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
            payment.setRefundDate(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Booking canceled successfully");
        response.put("refundStatus", payment != null ? payment.getPaymentStatus().toString() : "N/A");

        return response;
    }

    public List<Booking> getCustomerBookings(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return bookingRepository.findByCustomerOrderByBookingDateDesc(customer);
    }

    public Booking getBookingById(Integer bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithDetails();
    }

    public List<Booking> getBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return bookingRepository.findBookingsByDateRange(startDate, endDate);
    }

    public Map<String, Object> getBookingStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalBookings", bookingRepository.count());
        stats.put("pendingBookings", bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.put("confirmedBookings", bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        stats.put("canceledBookings", bookingRepository.countByStatus(BookingStatus.CANCELED));

        Double totalRevenue = bookingRepository.getTotalRevenue();
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        return stats;
    }
}