package com.example.demo.repository;

import com.example.demo.entity.Booking;
import com.example.demo.entity.Customer;
import com.example.demo.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByCustomer(Customer customer);
    List<Booking> findByCustomerOrderByBookingDateDesc(Customer customer);
    List<Booking> findByBookingStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    List<Booking> findBookingsByDateRange(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingStatus = :status")
    Long countByStatus(@Param("status") BookingStatus status);

    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.bookingStatus = 'CONFIRMED'")
    Double getTotalRevenue();

    @Query("SELECT b FROM Booking b JOIN FETCH b.customer JOIN FETCH b.event")
    List<Booking> findAllWithDetails();
}
