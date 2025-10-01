package com.example.demo.service;

import com.example.demo.entity.Payment;
import com.example.demo.entity.Booking;
import com.example.demo.entity.Event;
import com.example.demo.entity.FinanceManager;
import com.example.demo.enums.PaymentStatus;
import com.example.demo.enums.BookingStatus;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.FinanceManagerRepository;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.InvalidBookingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

    @Service
    public class PaymentService {

        @Autowired
        private PaymentRepository paymentRepository;

        @Autowired
        private BookingRepository bookingRepository;

        @Autowired
        private FinanceManagerRepository financeManagerRepository;

        public List<Payment> getPendingPayments() {
            return paymentRepository.findByPaymentStatusWithDetails(PaymentStatus.PENDING);
        }

        public List<Payment> getAllPayments() {
            return paymentRepository.findAll();
        }

        public Payment getPaymentById(Integer paymentId) {
            return paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        }

        @Transactional
        public Map<String, Object> approvePayment(Integer paymentId, Integer managerId) {
            Payment payment = getPaymentById(paymentId);

            if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
                throw new InvalidBookingException("Only pending payments can be approved");
            }

            FinanceManager manager = financeManagerRepository.findById(managerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Finance Manager not found"));

            // Update payment
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setApprovedBy(manager);
            payment.setApprovedDate(LocalDateTime.now());
            paymentRepository.save(payment);

            // Update booking status
            Booking booking = payment.getBooking();
            booking.setBookingStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment approved successfully");
            response.put("paymentId", payment.getId());
            response.put("bookingId", booking.getId());
            response.put("status", "COMPLETED");

            return response;
        }

        @Transactional
        public Map<String, Object> rejectPayment(Integer paymentId, Integer managerId) {
            Payment payment = getPaymentById(paymentId);

            if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
                throw new InvalidBookingException("Only pending payments can be rejected");
            }

            FinanceManager manager = financeManagerRepository.findById(managerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Finance Manager not found"));

            // Update payment
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setApprovedBy(manager);
            payment.setApprovedDate(LocalDateTime.now());
            paymentRepository.save(payment);

            // Update booking and release seats
            Booking booking = payment.getBooking();
            booking.setBookingStatus(BookingStatus.CANCELED);
            bookingRepository.save(booking);

            // Release seats back to event
            Event event = booking.getEvent();
            event.setAvailableSeats(event.getAvailableSeats() + booking.getSeatsBooked());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment rejected");
            response.put("paymentId", payment.getId());
            response.put("bookingId", booking.getId());
            response.put("status", "FAILED");

            return response;
        }

        public List<Payment> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
            return paymentRepository.findPaymentsByDateRange(startDate, endDate);
        }

        public Map<String, Object> getPaymentStatistics() {
            Map<String, Object> stats = new HashMap<>();

            stats.put("totalPayments", paymentRepository.count());
            stats.put("pendingPayments", paymentRepository.countByStatus(PaymentStatus.PENDING));
            stats.put("completedPayments", paymentRepository.countByStatus(PaymentStatus.COMPLETED));
            stats.put("failedPayments", paymentRepository.countByStatus(PaymentStatus.FAILED));
            stats.put("refundedPayments", paymentRepository.countByStatus(PaymentStatus.REFUNDED));

            Double totalCompleted = paymentRepository.getTotalCompletedPayments();
            stats.put("totalRevenue", totalCompleted != null ? totalCompleted : 0.0);

            return stats;
        }
    }