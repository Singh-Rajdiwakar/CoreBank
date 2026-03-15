package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.common.AuditLogResponse;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.dispute.DisputeAssignRequest;
import com.bankingsim.banking.dto.dispute.DisputeCreateRequest;
import com.bankingsim.banking.dto.dispute.DisputeEvidenceRequest;
import com.bankingsim.banking.dto.dispute.DisputeEvidenceResponse;
import com.bankingsim.banking.dto.dispute.DisputeResponse;
import com.bankingsim.banking.dto.dispute.DisputeStatusUpdateRequest;
import com.bankingsim.banking.dto.dispute.DisputeSummaryResponse;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.DisputeCase;
import com.bankingsim.banking.entity.DisputeEvidence;
import com.bankingsim.banking.entity.enums.DisputeLiabilityTier;
import com.bankingsim.banking.entity.enums.DisputePriority;
import com.bankingsim.banking.entity.enums.DisputeStatus;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.exception.DuplicateResourceException;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.mapper.DisputeMapper;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.DisputeCaseRepository;
import com.bankingsim.banking.repository.DisputeEvidenceRepository;
import com.bankingsim.banking.repository.UserRepository;
import com.bankingsim.banking.util.PageMapper;
import com.bankingsim.banking.util.ReferenceGenerator;
import com.bankingsim.banking.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeCaseRepository disputeCaseRepository;
    private final BankTransactionRepository transactionRepository;
    private final CustomerService customerService;
    private final AccountService accountService;
    private final DisputeEvidenceRepository disputeEvidenceRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final AppProperties appProperties;

    @Transactional
    public DisputeResponse create(DisputeCreateRequest request) {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        BankTransaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!hasTransactionAccess(customer, transaction)) {
            throw new ForbiddenOperationException("Cannot raise dispute for another customer's transaction");
        }

        LocalDateTime txnTime = transaction.getInitiatedAt() == null ? transaction.getCreatedAt() : transaction.getInitiatedAt();
        if (txnTime == null) {
            throw new ForbiddenOperationException("Transaction timestamp is unavailable for dispute");
        }
        if (txnTime.isBefore(LocalDateTime.now().minusDays(appProperties.getDisputes().getRaiseWindowDays()))) {
            throw new ForbiddenOperationException("Dispute reporting window has expired");
        }

        List<DisputeStatus> activeStatuses = List.of(
                DisputeStatus.OPEN,
                DisputeStatus.EVIDENCE_REQUIRED,
                DisputeStatus.UNDER_REVIEW,
                DisputeStatus.ESCALATED
        );
        if (disputeCaseRepository.existsActiveByCustomerAndTransaction(customer.getId(), transaction.getId(), activeStatuses)) {
            throw new DuplicateResourceException("Active dispute already exists for this transaction");
        }

        LocalDateTime now = LocalDateTime.now();
        DisputeLiabilityTier liabilityTier = resolveLiabilityTier(txnTime);

        DisputeCase dispute = new DisputeCase();
        dispute.setCaseNumber(generateCaseNumber());
        dispute.setTransaction(transaction);
        dispute.setCustomer(customer);
        dispute.setCategory(request.getCategory());
        dispute.setPriority(resolvePriority(request.getPriority(), transaction.getAmount()));
        dispute.setStatus(DisputeStatus.OPEN);
        dispute.setReportedChannel(request.getReportedChannel());
        dispute.setLiabilityTier(liabilityTier);
        dispute.setDisputedAmount(resolveDisputedAmount(transaction));
        dispute.setDescription(request.getDescription());
        dispute.setEvidenceReference(request.getEvidenceReference());
        dispute.setReportedAt(now);
        dispute.setResolutionDueAt(now.plusDays(appProperties.getDisputes().getResolutionSlaDays()));
        if (liabilityTier != DisputeLiabilityTier.FULL) {
            dispute.setProvisionalCreditDueAt(now.plusDays(appProperties.getDisputes().getProvisionalCreditDays()));
        }

        DisputeCase saved = disputeCaseRepository.save(dispute);
        auditService.log(SecurityUtils.currentUserId(), "DISPUTE_CREATE", "DISPUTE_CASE",
                saved.getId().toString(), null, saved.getStatus().name(), true,
                "Dispute raised for txRef=" + transaction.getReferenceNumber());
        notificationService.publish(customer.getUser().getId(), NotificationType.DISPUTE,
                "Dispute Case Raised",
                "Dispute case " + saved.getCaseNumber() + " has been raised and is under review.");

        return DisputeMapper.toResponse(saved);
    }

    public PageResponse<DisputeResponse> myDisputes(DisputeStatus status, int page, int size) {
        Long customerId = customerService.getCustomerByUserId(SecurityUtils.currentUserId()).getId();
        var pageable = PageRequest.of(page, size);
        var result = status == null
                ? disputeCaseRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable)
                : disputeCaseRepository.findByCustomerIdAndStatusOrderByCreatedAtDesc(customerId, status, pageable);
        return PageMapper.from(result.map(DisputeMapper::toResponse));
    }

    public DisputeResponse myDisputeById(Long disputeId) {
        DisputeCase dispute = disputeCaseRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        enforceReadAccess(dispute);
        return DisputeMapper.toResponse(dispute);
    }

    public List<DisputeEvidenceResponse> listEvidence(Long disputeId) {
        DisputeCase dispute = disputeCaseRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        enforceReadAccess(dispute);
        return disputeEvidenceRepository.findByDisputeCaseIdOrderByUploadedAtDesc(disputeId).stream()
                .map(this::toEvidenceResponse)
                .toList();
    }

    @Transactional
    public DisputeEvidenceResponse uploadEvidence(Long disputeId, DisputeEvidenceRequest request) {
        DisputeCase dispute = disputeCaseRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        enforceEvidenceWriteAccess(dispute);

        Long actor = SecurityUtils.currentUserId();

        DisputeEvidence evidence = new DisputeEvidence();
        evidence.setDisputeCase(dispute);
        evidence.setFileName(request.getFileName());
        evidence.setFileUrl(request.getFileUrl());
        evidence.setFileType(request.getFileType());
        evidence.setChecksum(request.getChecksum());
        evidence.setNotes(request.getNotes());
        evidence.setUploadedBy(actor);
        evidence.setUploadedAt(LocalDateTime.now());
        DisputeEvidence savedEvidence = disputeEvidenceRepository.save(evidence);

        DisputeStatus previousStatus = dispute.getStatus();
        if (dispute.getStatus() == DisputeStatus.EVIDENCE_REQUIRED) {
            dispute.setStatus(DisputeStatus.UNDER_REVIEW);
            disputeCaseRepository.save(dispute);
            auditService.log(actor, "DISPUTE_STATUS_UPDATE", "DISPUTE_CASE", dispute.getId().toString(),
                    previousStatus.name(), DisputeStatus.UNDER_REVIEW.name(), true,
                    "Auto moved to UNDER_REVIEW after evidence upload");
        }

        auditService.log(actor, "DISPUTE_EVIDENCE_UPLOAD", "DISPUTE_CASE", dispute.getId().toString(),
                null, savedEvidence.getFileName(), true, "Evidence metadata uploaded");

        if (!actor.equals(dispute.getCustomer().getUser().getId())) {
            notificationService.publish(dispute.getCustomer().getUser().getId(), NotificationType.DISPUTE,
                    "Dispute Evidence Updated",
                    "New evidence was added to dispute case " + dispute.getCaseNumber() + ".");
        } else if (dispute.getAssignedTo() != null && userRepository.existsById(dispute.getAssignedTo())) {
            notificationService.publish(dispute.getAssignedTo(), NotificationType.DISPUTE,
                    "Customer Uploaded Evidence",
                    "New evidence was uploaded for dispute case " + dispute.getCaseNumber() + ".");
        }

        return toEvidenceResponse(savedEvidence);
    }

    public PageResponse<AuditLogResponse> timeline(Long disputeId, int page, int size) {
        DisputeCase dispute = disputeCaseRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        enforceReadAccess(dispute);
        return PageMapper.from(auditLogService.byTarget("DISPUTE_CASE", disputeId.toString(), page, size));
    }

    public PageResponse<DisputeResponse> operationsQueue(DisputeStatus status, boolean overdueOnly, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 200));
        if (overdueOnly) {
            List<DisputeCase> overdue = disputeCaseRepository.findOverdue(
                    List.of(DisputeStatus.OPEN, DisputeStatus.EVIDENCE_REQUIRED, DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED),
                    LocalDateTime.now(),
                    PageRequest.of(0, safeSize)
            );
            return PageResponse.<DisputeResponse>builder()
                    .content(overdue.stream().map(DisputeMapper::toResponse).toList())
                    .page(0)
                    .size(safeSize)
                    .totalElements(overdue.size())
                    .totalPages(1)
                    .first(true)
                    .last(true)
                    .build();
        }

        var pageResult = status == null
                ? disputeCaseRepository.findAll(PageRequest.of(safePage, safeSize))
                : disputeCaseRepository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(safePage, safeSize));
        return PageMapper.from(pageResult.map(DisputeMapper::toResponse));
    }

    public DisputeSummaryResponse summary() {
        return DisputeSummaryResponse.builder()
                .openCount(disputeCaseRepository.countByStatus(DisputeStatus.OPEN))
                .underReviewCount(disputeCaseRepository.countByStatus(DisputeStatus.UNDER_REVIEW))
                .escalatedCount(disputeCaseRepository.countByStatus(DisputeStatus.ESCALATED))
                .resolvedCount(disputeCaseRepository.countByStatus(DisputeStatus.RESOLVED))
                .rejectedCount(disputeCaseRepository.countByStatus(DisputeStatus.REJECTED))
                .closedCount(disputeCaseRepository.countByStatus(DisputeStatus.CLOSED))
                .build();
    }

    @Transactional
    public DisputeResponse assign(Long disputeId, DisputeAssignRequest request) {
        DisputeCase dispute = disputeCaseRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        if (!userRepository.existsById(request.getAssigneeUserId())) {
            throw new ResourceNotFoundException("Assignee user not found");
        }
        Long old = dispute.getAssignedTo();
        dispute.setAssignedTo(request.getAssigneeUserId());
        DisputeCase saved = disputeCaseRepository.save(dispute);

        auditService.log(SecurityUtils.currentUserId(), "DISPUTE_ASSIGN", "DISPUTE_CASE", saved.getId().toString(),
                old == null ? null : old.toString(), saved.getAssignedTo().toString(), true,
                "Dispute assigned");

        return DisputeMapper.toResponse(saved);
    }

    @Transactional
    public DisputeResponse updateStatus(Long disputeId, DisputeStatusUpdateRequest request) {
        DisputeCase dispute = disputeCaseRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        if (dispute.getStatus() == DisputeStatus.CLOSED) {
            throw new ForbiddenOperationException("Closed dispute cannot be changed");
        }
        if ((request.getStatus() == DisputeStatus.RESOLVED || request.getStatus() == DisputeStatus.REJECTED)
                && (request.getResolutionSummary() == null || request.getResolutionSummary().isBlank())) {
            throw new ForbiddenOperationException("resolutionSummary is required for final decision");
        }
        if (request.getStatus() == DisputeStatus.CLOSED
                && dispute.getStatus() != DisputeStatus.RESOLVED
                && dispute.getStatus() != DisputeStatus.REJECTED) {
            throw new ForbiddenOperationException("Only resolved/rejected disputes can be closed");
        }

        DisputeStatus oldStatus = dispute.getStatus();
        dispute.setStatus(request.getStatus());
        if (request.getProvisionalCreditRecommended() != null) {
            dispute.setProvisionalCreditRecommended(request.getProvisionalCreditRecommended());
        }
        if (request.getResolutionSummary() != null) {
            dispute.setResolutionSummary(request.getResolutionSummary());
        }
        if (request.getStatus() == DisputeStatus.RESOLVED || request.getStatus() == DisputeStatus.REJECTED) {
            dispute.setResolvedAt(LocalDateTime.now());
        }
        if (request.getStatus() == DisputeStatus.CLOSED) {
            dispute.setClosedAt(LocalDateTime.now());
        }

        DisputeCase saved = disputeCaseRepository.save(dispute);
        auditService.log(SecurityUtils.currentUserId(), "DISPUTE_STATUS_UPDATE", "DISPUTE_CASE", saved.getId().toString(),
                oldStatus.name(), saved.getStatus().name(), true, "Dispute status updated");
        notificationService.publish(saved.getCustomer().getUser().getId(), NotificationType.DISPUTE,
                "Dispute Status Updated",
                "Dispute case " + saved.getCaseNumber() + " status is now " + saved.getStatus() + ".");

        return DisputeMapper.toResponse(saved);
    }

    @Transactional
    public int autoEscalateOverdueCases() {
        int batchSize = Math.max(1, Math.min(appProperties.getDisputes().getOverdueEscalationBatchSize(), 1000));
        List<DisputeCase> overdue = disputeCaseRepository.findOverdue(
                List.of(DisputeStatus.OPEN, DisputeStatus.EVIDENCE_REQUIRED, DisputeStatus.UNDER_REVIEW),
                LocalDateTime.now(),
                PageRequest.of(0, batchSize)
        );
        for (DisputeCase dispute : overdue) {
            DisputeStatus old = dispute.getStatus();
            dispute.setStatus(DisputeStatus.ESCALATED);
            notificationService.publish(dispute.getCustomer().getUser().getId(), NotificationType.DISPUTE,
                    "Dispute Escalated",
                    "Dispute case " + dispute.getCaseNumber() + " has been escalated for priority review.");
            auditService.log(0L, "DISPUTE_AUTO_ESCALATE", "DISPUTE_CASE", dispute.getId().toString(),
                    old.name(), DisputeStatus.ESCALATED.name(), true, "SLA overdue auto escalation");
        }
        disputeCaseRepository.saveAll(overdue);
        return overdue.size();
    }

    private void enforceReadAccess(DisputeCase dispute) {
        if (SecurityUtils.hasRole("ROLE_ADMIN")
                || SecurityUtils.hasRole("ROLE_MANAGER")
                || SecurityUtils.hasRole("ROLE_EMPLOYEE")
                || SecurityUtils.hasRole("ROLE_AUDITOR")) {
            return;
        }
        if (SecurityUtils.hasRole("ROLE_CUSTOMER")) {
            Long customerId = customerService.getCustomerByUserId(SecurityUtils.currentUserId()).getId();
            if (dispute.getCustomer().getId().equals(customerId)) {
                return;
            }
            throw new ForbiddenOperationException("Dispute does not belong to customer");
        }
        throw new ForbiddenOperationException("Unauthorized dispute access");
    }

    private void enforceEvidenceWriteAccess(DisputeCase dispute) {
        if (SecurityUtils.hasRole("ROLE_ADMIN")
                || SecurityUtils.hasRole("ROLE_MANAGER")
                || SecurityUtils.hasRole("ROLE_EMPLOYEE")) {
            return;
        }
        if (SecurityUtils.hasRole("ROLE_AUDITOR")) {
            throw new ForbiddenOperationException("Auditor has read-only access");
        }
        if (SecurityUtils.hasRole("ROLE_CUSTOMER")) {
            Long customerId = customerService.getCustomerByUserId(SecurityUtils.currentUserId()).getId();
            if (!dispute.getCustomer().getId().equals(customerId)) {
                throw new ForbiddenOperationException("Dispute does not belong to customer");
            }
            Set<DisputeStatus> allowed = Set.of(
                    DisputeStatus.OPEN,
                    DisputeStatus.EVIDENCE_REQUIRED,
                    DisputeStatus.UNDER_REVIEW,
                    DisputeStatus.ESCALATED
            );
            if (!allowed.contains(dispute.getStatus())) {
                throw new ForbiddenOperationException("Evidence upload is not allowed in current dispute status");
            }
            return;
        }
        throw new ForbiddenOperationException("Unauthorized evidence upload");
    }

    private DisputeEvidenceResponse toEvidenceResponse(DisputeEvidence evidence) {
        return DisputeEvidenceResponse.builder()
                .id(evidence.getId())
                .disputeId(evidence.getDisputeCase().getId())
                .fileName(evidence.getFileName())
                .fileUrl(evidence.getFileUrl())
                .fileType(evidence.getFileType())
                .checksum(evidence.getChecksum())
                .notes(evidence.getNotes())
                .uploadedBy(evidence.getUploadedBy())
                .uploadedAt(evidence.getUploadedAt())
                .createdAt(evidence.getCreatedAt())
                .build();
    }

    private boolean hasTransactionAccess(Customer customer, BankTransaction tx) {
        if (tx.getInitiatedBy() != null && tx.getInitiatedBy().equals(customer.getUser().getId())) {
            return true;
        }
        if (tx.getSourceAccount() != null && accountService.isOwnedByCustomer(tx.getSourceAccount(), customer.getId())) {
            return true;
        }
        return tx.getDestinationAccount() != null
                && accountService.isOwnedByCustomer(tx.getDestinationAccount(), customer.getId());
    }

    private DisputeLiabilityTier resolveLiabilityTier(LocalDateTime txnTime) {
        long days = java.time.Duration.between(txnTime, LocalDateTime.now()).toDays();
        if (days <= appProperties.getDisputes().getZeroLiabilityDays()) {
            return DisputeLiabilityTier.ZERO;
        }
        if (days <= appProperties.getDisputes().getLimitedLiabilityDays()) {
            return DisputeLiabilityTier.LIMITED;
        }
        return DisputeLiabilityTier.FULL;
    }

    private DisputePriority resolvePriority(DisputePriority requested, BigDecimal amount) {
        if (requested != null) {
            return requested;
        }
        BigDecimal highThreshold = appProperties.getLimits().getHighValueTransferThreshold();
        if (amount != null && highThreshold != null && amount.compareTo(highThreshold) >= 0) {
            return DisputePriority.HIGH;
        }
        return DisputePriority.MEDIUM;
    }

    private BigDecimal resolveDisputedAmount(BankTransaction tx) {
        BigDecimal amount = tx.getAmount() == null ? BigDecimal.ZERO : tx.getAmount();
        BigDecimal charges = tx.getCharges() == null ? BigDecimal.ZERO : tx.getCharges();
        BigDecimal tax = tx.getTax() == null ? BigDecimal.ZERO : tx.getTax();
        return amount.add(charges).add(tax);
    }

    private String generateCaseNumber() {
        String number;
        do {
            number = ReferenceGenerator.disputeCaseNumber();
        } while (disputeCaseRepository.findByCaseNumber(number).isPresent());
        return number;
    }
}
