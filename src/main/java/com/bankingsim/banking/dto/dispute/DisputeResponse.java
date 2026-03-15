package com.bankingsim.banking.dto.dispute;

import com.bankingsim.banking.entity.enums.DisputeCategory;
import com.bankingsim.banking.entity.enums.DisputeLiabilityTier;
import com.bankingsim.banking.entity.enums.DisputePriority;
import com.bankingsim.banking.entity.enums.DisputeReportedChannel;
import com.bankingsim.banking.entity.enums.DisputeStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DisputeResponse {
    private Long id;
    private String caseNumber;
    private Long transactionId;
    private String transactionReference;
    private Long customerId;
    private DisputeCategory category;
    private DisputePriority priority;
    private DisputeStatus status;
    private DisputeReportedChannel reportedChannel;
    private DisputeLiabilityTier liabilityTier;
    private BigDecimal disputedAmount;
    private String description;
    private String evidenceReference;
    private LocalDateTime reportedAt;
    private LocalDateTime resolutionDueAt;
    private LocalDateTime provisionalCreditDueAt;
    private boolean provisionalCreditRecommended;
    private Long assignedTo;
    private String resolutionSummary;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
}
