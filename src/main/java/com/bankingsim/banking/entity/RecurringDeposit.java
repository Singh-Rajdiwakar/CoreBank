package com.bankingsim.banking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "recurring_deposits")
public class RecurringDeposit extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funding_account_id", nullable = false)
    private Account fundingAccount;

    @Column(name = "rd_number", nullable = false, unique = true, length = 40)
    private String rdNumber;

    @Column(name = "monthly_installment", nullable = false, precision = 19, scale = 2)
    private BigDecimal monthlyInstallment;

    @Column(name = "interest_rate", nullable = false, precision = 8, scale = 4)
    private BigDecimal interestRate;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths;

    @Column(name = "opened_on", nullable = false)
    private LocalDate openedOn;

    @Column(name = "maturity_date", nullable = false)
    private LocalDate maturityDate;

    @Column(name = "total_paid", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalPaid = BigDecimal.ZERO;

    @Column(name = "missed_installments", nullable = false)
    private Integer missedInstallments = 0;

    @Column(name = "status", nullable = false, length = 20)
    private String status;
}
