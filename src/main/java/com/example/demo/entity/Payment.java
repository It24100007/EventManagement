package com.example.demo.entity;

import com.example.demo.enums.PaymentMethod;
import com.example.demo.enums.PaymentStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private FinanceManager approvedBy;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "refund_date")
    private LocalDateTime refundDate;

    @PrePersist
    protected void onCreate() {
        paymentDate = LocalDateTime.now();
        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING;
        }
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public FinanceManager getApprovedBy() { return approvedBy; }
    public void setApprovedBy(FinanceManager approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
    public LocalDateTime getApprovedDate() { return approvedDate; }
    public void setApprovedDate(LocalDateTime approvedDate) { this.approvedDate = approvedDate; }
    public LocalDateTime getRefundDate() { return refundDate; }
    public void setRefundDate(LocalDateTime refundDate) { this.refundDate = refundDate; }
}
