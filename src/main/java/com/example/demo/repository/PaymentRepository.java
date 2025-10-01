package com.example.demo.repository;

import com.example.demo.entity.Payment;
import com.example.demo.entity.Booking;
import com.example.demo.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByBooking(Booking booking);
    List<Payment> findByPaymentStatus(PaymentStatus status);

    @Query("SELECT p FROM Payment p JOIN FETCH p.booking b JOIN FETCH b.customer JOIN FETCH b.event WHERE p.paymentStatus = :status")
    List<Payment> findByPaymentStatusWithDetails(@Param("status") PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    List<Payment> findPaymentsByDateRange(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'COMPLETED'")
    Double getTotalCompletedPayments();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status")
    Long countByStatus(@Param("status") PaymentStatus status);
}