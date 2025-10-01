package com.example.demo.service;

import com.example.demo.entity.Customer;
import com.example.demo.entity.FinanceManager;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.FinanceManagerRepository;
import com.example.demo.exception.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FinanceManagerRepository financeManagerRepository;

    public Map<String, Object> loginCustomer(String email, String password) {
        Customer customer = customerRepository.findByEmailAndPassword(email, password)
                .orElseThrow(() -> new CustomException("Invalid email or password"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", customer.getId());
        response.put("name", customer.getName());
        response.put("email", customer.getEmail());
        response.put("phone", customer.getPhone());
        response.put("userType", "CUSTOMER");

        return response;
    }

    public Map<String, Object> loginFinanceManager(String email, String password) {
        FinanceManager manager = financeManagerRepository.findByEmailAndPassword(email, password)
                .orElseThrow(() -> new CustomException("Invalid email or password"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", manager.getId());
        response.put("name", manager.getName());
        response.put("email", manager.getEmail());
        response.put("userType", "FINANCE_MANAGER");

        return response;
    }
}