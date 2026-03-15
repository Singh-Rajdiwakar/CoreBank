package com.bankingsim.banking.entity;

import com.bankingsim.banking.entity.enums.BeneficiaryStatus;
import com.bankingsim.banking.entity.enums.BeneficiaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "beneficiaries")
public class Beneficiary extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "beneficiary_type", nullable = false, length = 20)
    private BeneficiaryType beneficiaryType;

    @Column(name = "nickname", nullable = false, length = 100)
    private String nickname;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "account_number", nullable = false, length = 30)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 20)
    private String ifscCode;

    @Column(name = "bank_name", nullable = false, length = 150)
    private String bankName;

    @Column(name = "daily_limit", nullable = false, precision = 19, scale = 2)
    private BigDecimal dailyLimit = BigDecimal.ZERO;

    @Column(name = "cooling_until")
    private LocalDateTime coolingUntil;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BeneficiaryStatus status = BeneficiaryStatus.PENDING_VERIFICATION;

    @Column(name = "is_blacklisted", nullable = false)
    private boolean blacklisted;
}
