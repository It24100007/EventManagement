package com.example.demo.repository;

import com.example.demo.entity.RSVP;
import com.example.demo.entity.Customer;
import com.example.demo.entity.Event;
import com.example.demo.enums.RSVPResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RSVPRepository extends JpaRepository<RSVP, Integer> {
    Optional<RSVP> findByCustomerAndEvent(Customer customer, Event event);
    List<RSVP> findByCustomer(Customer customer);
    List<RSVP> findByEvent(Event event);
    List<RSVP> findByResponse(RSVPResponse response);

    @Query("SELECT COUNT(r) FROM RSVP r WHERE r.event.id = :eventId AND r.response = :response")
    Long countByEventAndResponse(@Param("eventId") Integer eventId,
                                 @Param("response") RSVPResponse response);
}