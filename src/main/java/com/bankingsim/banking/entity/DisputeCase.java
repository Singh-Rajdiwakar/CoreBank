package com.bankingsim.banking.entity;

import com.bankingsim.banking.entity.enums.DisputeCategory;
import com.bankingsim.banking.entity.enums.DisputeLiabilityTier;
import com.bankingsim.banking.entity.enums.DisputePriority;
import com.bankingsim.banking.entity.enums.DisputeReportedChannel;
import com.bankingsim.banking.entity.enums.DisputeStatus;
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
@Table(name = "dispute_cases")
public class DisputeCase extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", nullable = false, unique = true, length = 40)
    private String caseNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id", nullable = false)
    private BankTransaction transaction;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 40)
    private DisputeCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private DisputePriority priority = DisputePriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private DisputeStatus status = DisputeStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "reported_channel", nullable = false, length = 30)
    private DisputeReportedChannel reportedChannel;

    @Enumerated(EnumType.STRING)
    @Column(name = "liability_tier", nullable = false, length = 20)
    private DisputeLiabilityTier liabilityTier;

    @Column(name = "disputed_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal disputedAmount;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "evidence_reference", length = 255)
    private String evidenceReference;

    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt;

    @Column(name = "resolution_due_at", nullable = false)
    private LocalDateTime resolutionDueAt;

    @Column(name = "provisional_credit_due_at")
    private LocalDateTime provisionalCreditDueAt;

    @Column(name = "provisional_credit_recommended", nullable = false)
    private boolean provisionalCreditRecommended;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "resolution_summary", length = 500)
    private String resolutionSummary;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
