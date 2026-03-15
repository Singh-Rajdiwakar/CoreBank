package com.bankingsim.banking.mapper;

import com.bankingsim.banking.dto.dispute.DisputeResponse;
import com.bankingsim.banking.entity.DisputeCase;

public final class DisputeMapper {

    private DisputeMapper() {
    }

    public static DisputeResponse toResponse(DisputeCase dispute) {
        return DisputeResponse.builder()
                .id(dispute.getId())
                .caseNumber(dispute.getCaseNumber())
                .transactionId(dispute.getTransaction().getId())
                .transactionReference(dispute.getTransaction().getReferenceNumber())
                .customerId(dispute.getCustomer().getId())
                .category(dispute.getCategory())
                .priority(dispute.getPriority())
                .status(dispute.getStatus())
                .reportedChannel(dispute.getReportedChannel())
                .liabilityTier(dispute.getLiabilityTier())
                .disputedAmount(dispute.getDisputedAmount())
                .description(dispute.getDescription())
                .evidenceReference(dispute.getEvidenceReference())
                .reportedAt(dispute.getReportedAt())
                .resolutionDueAt(dispute.getResolutionDueAt())
                .provisionalCreditDueAt(dispute.getProvisionalCreditDueAt())
                .provisionalCreditRecommended(dispute.isProvisionalCreditRecommended())
                .assignedTo(dispute.getAssignedTo())
                .resolutionSummary(dispute.getResolutionSummary())
                .resolvedAt(dispute.getResolvedAt())
                .closedAt(dispute.getClosedAt())
                .createdAt(dispute.getCreatedAt())
                .build();
    }
}
