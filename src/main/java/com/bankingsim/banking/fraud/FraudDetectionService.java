package com.bankingsim.banking.fraud;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.admin.FraudCaseResponse;
import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.FraudAlert;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.FraudCaseStatus;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.FraudAlertRepository;
import com.bankingsim.banking.repository.LoginAttemptRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final AppProperties appProperties;
    private final BankTransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public FraudEvaluationResult evaluate(Customer customer,
                                          Account source,
                                          BigDecimal amount,
                                          boolean newBeneficiary,
                                          String ipMismatchReason) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        if (amount.compareTo(appProperties.getLimits().getHighValueTransferThreshold()) >= 0) {
            score += 30;
            reasons.add("High amount transaction");
        }

        if (source.getStatus() == AccountStatus.BLOCKED || source.getStatus() == AccountStatus.FREEZED) {
            score += 50;
            reasons.add("Source account blocked/frozen");
        }

        if (customer != null) {
            if (customer.getStatus().name().equals("BLACKLISTED") || customer.getRiskProfile().name().equals("HIGH")) {
                score += 25;
                reasons.add("High-risk or blacklisted customer");
            }

            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            long countLastHour = transactionRepository.countTransactionsByInitiatedByAndInitiatedAtAfter(customer.getUser().getId(), oneHourAgo);
            if (countLastHour >= 8) {
                score += 20;
                reasons.add("High transaction velocity");
            }

            long failedTxLastHour = transactionRepository.countFailedTransactionsByUserSince(customer.getUser().getId(), oneHourAgo);
            if (failedTxLastHour >= 3) {
                score += 10;
                reasons.add("Multiple failed transactions in short time");
            }

            long failedLoginToday = loginAttemptRepository.countByUsernameAndSuccessIsFalseAndAttemptedAtAfter(
                    customer.getUser().getUsername(),
                    LocalDateTime.now().minusHours(24)
            );
            if (failedLoginToday >= 3) {
                score += 15;
                reasons.add("Too many failed login attempts");
            }

            BigDecimal avg = transactionRepository.averageSuccessfulAmountByUserSince(customer.getUser().getId(), LocalDateTime.now().minusDays(30));
            if (avg != null && avg.compareTo(BigDecimal.ZERO) > 0 && amount.compareTo(avg.multiply(BigDecimal.valueOf(4))) > 0) {
                score += 20;
                reasons.add("Amount unusually high compared to user pattern");
            }
        }

        if (newBeneficiary) {
            score += 15;
            reasons.add("Transfer to newly added beneficiary");
        }

        int hour = LocalDateTime.now().getHour();
        if (hour < 5 || hour >= 23) {
            score += 10;
            reasons.add("Suspicious transaction time window");
        }

        if (ipMismatchReason != null && !ipMismatchReason.isBlank()) {
            score += 10;
            reasons.add(ipMismatchReason);
        }

        boolean block = score >= appProperties.getLimits().getAutoBlockFraudScore();
        boolean review = score >= 60;
        return new FraudEvaluationResult(score, reasons, block, review);
    }

    @Transactional
    public FraudAlert createAlertIfNeeded(BankTransaction transaction, Customer customer, FraudEvaluationResult result) {
        if (!result.reviewRequired() && !result.block()) {
            return null;
        }
        FraudAlert alert = new FraudAlert();
        alert.setTransaction(transaction);
        alert.setCustomer(customer);
        alert.setScore(result.score());
        alert.setReason(String.join("; ", result.reasons()));
        alert.setStatus(result.block() ? FraudCaseStatus.BLOCKED : FraudCaseStatus.UNDER_REVIEW);
        FraudAlert saved = fraudAlertRepository.save(alert);

        Long targetUserId = customer != null ? customer.getUser().getId() : transaction.getInitiatedBy();
        if (targetUserId != null) {
            notificationService.publish(targetUserId, NotificationType.FRAUD,
                    "Fraud Alert Raised",
                    "Transaction " + transaction.getReferenceNumber() + " is marked for fraud review.");
        }
        return saved;
    }

    public List<FraudCaseResponse> listCases() {
        return fraudAlertRepository.findAll().stream()
                .map(alert -> FraudCaseResponse.builder()
                        .id(alert.getId())
                        .transactionId(alert.getTransaction() == null ? null : alert.getTransaction().getId())
                        .score(alert.getScore())
                        .reason(alert.getReason())
                        .status(alert.getStatus())
                        .build())
                .toList();
    }

    @Transactional
    public FraudCaseResponse reviewCase(Long caseId, FraudCaseStatus status, String notes, Long reviewerId) {
        FraudAlert alert = fraudAlertRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Fraud case not found"));
        FraudCaseStatus oldStatus = alert.getStatus();
        alert.setStatus(status);
        alert.setReviewNotes(notes);
        alert.setReviewedBy(reviewerId);
        alert.setReviewedAt(LocalDateTime.now());
        FraudAlert saved = fraudAlertRepository.save(alert);

        auditService.log(reviewerId, "FRAUD_REVIEW_DECISION", "FRAUD_ALERT", saved.getId().toString(),
                oldStatus.name(), status.name(), true, notes);

        return FraudCaseResponse.builder()
                .id(saved.getId())
                .transactionId(saved.getTransaction() == null ? null : saved.getTransaction().getId())
                .score(saved.getScore())
                .reason(saved.getReason())
                .status(saved.getStatus())
                .build();
    }
}
