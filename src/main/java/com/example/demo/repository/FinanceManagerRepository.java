package com.example.demo.repository;

import com.example.demo.entity.FinanceManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FinanceManagerRepository extends JpaRepository<FinanceManager, Integer> {
    Optional<FinanceManager> findByEmail(String email);
    Optional<FinanceManager> findByEmailAndPassword(String email, String password);
}