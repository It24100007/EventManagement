package com.example.demo.repository;

import com.example.demo.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByEventDateAfter(LocalDateTime date);

    @Query("SELECT e FROM Event e WHERE e.availableSeats > 0 AND e.eventDate > :currentDate ORDER BY e.eventDate")
    List<Event> findAvailableEvents(@Param("currentDate") LocalDateTime currentDate);
}