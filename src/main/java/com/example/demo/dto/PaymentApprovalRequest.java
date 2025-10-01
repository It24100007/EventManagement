package com.example.demo.dto;
import lombok.*;

@Data
public class PaymentApprovalRequest {
    private Long paymentId;
    private boolean approve;
    private Long financeManagerId;
}
