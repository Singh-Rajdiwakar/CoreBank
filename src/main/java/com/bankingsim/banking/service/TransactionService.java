package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.account.DepositRequest;
import com.bankingsim.banking.dto.account.WithdrawalRequest;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.dto.transaction.TransferRequest;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Beneficiary;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.TransactionAudit;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.BeneficiaryStatus;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.entity.enums.OtpPurpose;
import com.bankingsim.banking.entity.enums.TransactionChannel;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import com.bankingsim.banking.entity.enums.TransferMode;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.exception.InsufficientBalanceException;
import com.bankingsim.banking.exception.OtpValidationException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.fraud.FraudDetectionService;
import com.bankingsim.banking.fraud.FraudEvaluationResult;
import com.bankingsim.banking.mapper.TransactionMapper;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.notification.TransactionAlertService;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.TransactionAuditRepository;
import com.bankingsim.banking.repository.UserRepository;
import com.bankingsim.banking.util.RequestMetadataUtil;
import com.bankingsim.banking.util.ReferenceGenerator;
import com.bankingsim.banking.util.SecurityUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountService accountService;
    private final CustomerService customerService;
    private final BeneficiaryService beneficiaryService;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final BankTransactionRepository transactionRepository;
    private final TransactionAuditRepository transactionAuditRepository;
    private final FraudDetectionService fraudDetectionService;
    private final NotificationService notificationService;
    private final TransactionAlertService transactionAlertService;
    private final AuditService auditService;
    private final UserRepository userRepository;
    private final AppProperties appProperties;
    private final PricingService pricingService;

    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        Account account = accountService.getAccountForUpdate(request.getAccountNumber());

        if (account.getStatus() == AccountStatus.CLOSED || account.getStatus() == AccountStatus.BLOCKED) {
            throw new ForbiddenOperationException("Deposit not allowed for closed/blocked account");
        }

        BankTransaction transaction = baseTransaction(
                TransactionType.DEPOSIT,
                request.getAmount(),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                request.getRemarks(),
                null,
                account,
                null
        );
        transaction.setChannel(resolveChannelFromOperationMode(request.getMode()));

        if ("CHEQUE".equalsIgnoreCase(request.getMode())) {
            transaction.setStatus(TransactionStatus.PENDING);
            transaction.setDescription("Cheque deposit pending clearance: cheque=" + request.getChequeNumber()
                    + " slip=" + request.getDepositSlipReference());

            account.setBalance(account.getBalance().add(request.getAmount()));
            account.setHoldAmount(account.getHoldAmount().add(request.getAmount()));
            accountService.save(account);

            saveTransactionAudit(transaction, null, TransactionStatus.PENDING, "Cheque pending");
        } else {
            BigDecimal before = account.getAvailableBalance();
            accountService.credit(account, request.getAmount());
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setBeforeBalance(before);
            transaction.setAfterBalance(before.add(request.getAmount()));
        }

        BankTransaction saved = transactionRepository.save(transaction);
        saveTransactionAudit(saved, null, saved.getStatus(), "CHEQUE".equalsIgnoreCase(request.getMode()) ? "Cheque pending" : "Cash deposit");
        transactionAlertService.notifyTransaction(saved);

        auditService.log(SecurityUtils.currentUserId(), "DEPOSIT", "TRANSACTION", saved.getId().toString(), null,
                saved.getReferenceNumber(), true, "Deposit initiated");

        return TransactionMapper.toResponse(saved);
    }

    @Transactional
    public TransactionResponse clearChequeDeposit(String referenceNumber) {
        BankTransaction transaction = transactionRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (transaction.getTransactionType() != TransactionType.DEPOSIT || transaction.getStatus() != TransactionStatus.PENDING) {
            throw new ForbiddenOperationException("Only pending cheque deposits can be cleared");
        }

        Account account = accountService.getAccountForUpdate(transaction.getDestinationAccount().getAccountNumber());
        accountService.releaseHold(account, transaction.getAmount());

        TransactionStatus old = transaction.getStatus();
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setBeforeBalance(account.getAvailableBalance());
        transaction.setAfterBalance(account.getAvailableBalance());
        BankTransaction saved = transactionRepository.save(transaction);

        saveTransactionAudit(saved, old, TransactionStatus.SUCCESS, "Cheque cleared");
        transactionAlertService.notifyTransaction(saved);

        auditService.log(SecurityUtils.currentUserId(), "CHEQUE_CLEAR", "TRANSACTION", saved.getId().toString(),
                old.name(), TransactionStatus.SUCCESS.name(), true, "Cheque deposit cleared");

        return TransactionMapper.toResponse(saved);
    }

    @Transactional
    public TransactionResponse withdraw(WithdrawalRequest request) {
        Account account = accountService.getAccountForUpdate(request.getAccountNumber());

        accountService.validateTransferAllowed(account);
        if (account.getStatus() == AccountStatus.FREEZED) {
            throw new ForbiddenOperationException("Withdrawal not allowed from frozen account");
        }

        if ("ATM".equalsIgnoreCase(request.getMode())) {
            BigDecimal withdrawnToday = transactionRepository.sumWithdrawalsByAccountSince(account.getId(), LocalDateTime.now().toLocalDate().atStartOfDay());
            if (withdrawnToday.add(request.getAmount()).compareTo(appProperties.getLimits().getMaxAtmWithdrawalPerDay()) > 0) {
                throw new ForbiddenOperationException("ATM withdrawal daily limit exceeded");
            }
        }

        BigDecimal charges = "ATM".equalsIgnoreCase(request.getMode()) ? pricingService.atmWithdrawalCharge(request.getAmount()) : BigDecimal.ZERO;
        BigDecimal totalDebit = request.getAmount().add(charges);
        BigDecimal before = account.getAvailableBalance();
        accountService.debit(account, totalDebit);

        BankTransaction transaction = baseTransaction(
                TransactionType.WITHDRAW,
                request.getAmount(),
                charges,
                BigDecimal.ZERO,
                buildWithdrawalRemarks(request),
                account,
                null,
                null
        );
        transaction.setChannel(resolveChannelFromOperationMode(request.getMode()));
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setBeforeBalance(before);
        transaction.setAfterBalance(before.subtract(totalDebit));

        BankTransaction saved = transactionRepository.save(transaction);
        saveTransactionAudit(saved, null, TransactionStatus.SUCCESS, "Withdrawal completed");
        transactionAlertService.notifyTransaction(saved);

        auditService.log(SecurityUtils.currentUserId(), "WITHDRAWAL", "TRANSACTION", saved.getId().toString(), null,
                saved.getReferenceNumber(), true, "Withdrawal success");

        return TransactionMapper.toResponse(saved);
    }

    @Transactional
    public TransactionResponse transfer(TransferRequest request, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new ForbiddenOperationException("Idempotency-Key header is required for transfer operations");
        }

        BankTransaction existing = transactionRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existing != null) {
            return TransactionMapper.toResponse(existing);
        }

        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        Customer customer = null;

        if (SecurityUtils.hasRole("ROLE_CUSTOMER")) {
            customer = customerService.getCustomerByUserId(user.getId());
            if (customer.getStatus().name().equals("BLACKLISTED") || customer.getStatus().name().equals("SUSPENDED")) {
                throw new ForbiddenOperationException("Customer profile is blocked for transfers");
            }
            if (!customer.getKycStatus().name().equals("VERIFIED")) {
                throw new ForbiddenOperationException("KYC must be verified for transfer");
            }
            verifyTransactionPin(customer, request.getTransactionPin());
        }

        Account source = accountService.getAccountForUpdate(request.getSourceAccountNumber());
        accountService.validateTransferAllowed(source);

        if (customer != null && !isAccountOwnedByCustomer(source, customer)) {
            throw new ForbiddenOperationException("Cannot transfer from another customer's account");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ForbiddenOperationException("Transfer amount must be positive");
        }

        validateTransferLimits(user.getId(), request.getAmount());

        TransferResolution resolution = resolveDestination(request, customer);
        if (resolution.destination() != null && resolution.destination().getAccountNumber().equals(source.getAccountNumber())) {
            throw new ForbiddenOperationException("Source and destination accounts cannot be same");
        }

        if (request.getAmount().compareTo(appProperties.getLimits().getHighValueTransferThreshold()) >= 0) {
            if (request.getOtp() == null || request.getOtp().isBlank()) {
                throw new OtpValidationException("OTP required for high-value transfer");
            }
            authService.validateOtp(user, OtpPurpose.TRANSFER, request.getOtp());
        }

        BigDecimal charges = resolveTransferCharges(request.getTransferMode(), request.getAmount());
        BigDecimal tax = charges.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalDebit = request.getAmount().add(charges).add(tax);

        if (source.getAvailableBalance().add(source.getOverdraftLimit()).compareTo(totalDebit) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for transfer + charges");
        }

        BankTransaction transaction = baseTransaction(
                toTransactionType(request.getTransferMode()),
                request.getAmount(),
                charges,
                tax,
                request.getRemarks(),
                source,
                resolution.destination(),
                request.getScheduledFor()
        );
        transaction.setIdempotencyKey(idempotencyKey);

        String ipMismatchReason = null;
        if (user.getLastLoginIp() != null && !user.getLastLoginIp().equals(RequestMetadataUtil.currentIp())) {
            ipMismatchReason = "IP mismatch from previous login";
        }

        FraudEvaluationResult fraudResult = fraudDetectionService.evaluate(
                customer,
                source,
                request.getAmount(),
                resolution.newBeneficiary(),
                ipMismatchReason
        );
        transaction.setFraudScore(fraudResult.score());

        if (request.getScheduledFor() != null && request.getScheduledFor().isAfter(LocalDateTime.now())) {
            transaction.setStatus(TransactionStatus.PENDING);
            transaction.setApprovalRequired(false);
            BankTransaction saved = transactionRepository.save(transaction);
            saveTransactionAudit(saved, null, TransactionStatus.PENDING, "Scheduled transfer queued");
            transactionAlertService.notifyTransaction(saved);
            return TransactionMapper.toResponse(saved);
        }

        if (fraudResult.block()) {
            transaction.setStatus(TransactionStatus.FLAGGED);
            transaction.setFailureReason(String.join("; ", fraudResult.reasons()));
            transaction.setApprovalRequired(true);
            BankTransaction saved = transactionRepository.save(transaction);
            saveTransactionAudit(saved, null, TransactionStatus.FLAGGED, "Auto blocked by fraud engine");
            fraudDetectionService.createAlertIfNeeded(saved, customer, fraudResult);
            notificationService.publish(user.getId(), NotificationType.FRAUD,
                    "Transfer Blocked",
                    "Transfer was blocked due to fraud risk: " + transaction.getFailureReason());
            transactionAlertService.notifyTransaction(saved);
            return TransactionMapper.toResponse(saved);
        }

        if (fraudResult.reviewRequired() || request.getAmount().compareTo(appProperties.getLimits().getMakerCheckerThreshold()) >= 0) {
            transaction.setStatus(TransactionStatus.PENDING);
            transaction.setApprovalRequired(true);
            transaction.setFailureReason(String.join("; ", fraudResult.reasons()));
            BankTransaction saved = transactionRepository.save(transaction);
            saveTransactionAudit(saved, null, TransactionStatus.PENDING, "Pending maker-checker approval");
            fraudDetectionService.createAlertIfNeeded(saved, customer, fraudResult);
            transactionAlertService.notifyTransaction(saved);
            return TransactionMapper.toResponse(saved);
        }

        return executeTransfer(transaction, source, resolution.destination(), totalDebit);
    }

    @Transactional
    public TransactionResponse approvePending(Long transactionId, String remarks) {
        BankTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.PENDING && transaction.getStatus() != TransactionStatus.FLAGGED) {
            throw new ForbiddenOperationException("Only pending/flagged transactions can be approved");
        }

        Account source = transaction.getSourceAccount() == null
                ? null
                : accountService.getAccountForUpdate(transaction.getSourceAccount().getAccountNumber());
        Account destination = transaction.getDestinationAccount() == null
                ? null
                : accountService.getAccountForUpdate(transaction.getDestinationAccount().getAccountNumber());

        if (source == null) {
            throw new ForbiddenOperationException("Only transfer pending transactions can be approved");
        }

        BigDecimal totalDebit = transaction.getAmount().add(transaction.getCharges()).add(transaction.getTax());
        TransactionResponse response = executeTransfer(transaction, source, destination, totalDebit);

        BankTransaction updated = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found after approval"));
        updated.setApprovedBy(SecurityUtils.currentUserId());
        updated.setApprovedAt(LocalDateTime.now());
        transactionRepository.save(updated);

        auditService.log(SecurityUtils.currentUserId(), "TRANSFER_APPROVE", "TRANSACTION", transactionId.toString(),
                null, TransactionStatus.SUCCESS.name(), true, remarks);

        return response;
    }

    @Transactional
    public TransactionResponse rejectPending(Long transactionId, String remarks) {
        BankTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.PENDING && transaction.getStatus() != TransactionStatus.FLAGGED) {
            throw new ForbiddenOperationException("Only pending/flagged transactions can be rejected");
        }

        TransactionStatus old = transaction.getStatus();
        transaction.setStatus(TransactionStatus.CANCELLED);
        transaction.setFailureReason(remarks);
        transaction.setApprovedBy(SecurityUtils.currentUserId());
        transaction.setApprovedAt(LocalDateTime.now());
        BankTransaction saved = transactionRepository.save(transaction);

        saveTransactionAudit(saved, old, TransactionStatus.CANCELLED, remarks);
        transactionAlertService.notifyTransaction(saved);
        auditService.log(SecurityUtils.currentUserId(), "TRANSFER_REJECT", "TRANSACTION", transactionId.toString(),
                old.name(), TransactionStatus.CANCELLED.name(), true, remarks);

        return TransactionMapper.toResponse(saved);
    }

    @Transactional
    public TransactionResponse cancelScheduled(Long transactionId) {
        BankTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.PENDING || transaction.getScheduledFor() == null) {
            throw new ForbiddenOperationException("Only pending scheduled transfers can be cancelled");
        }

        if (!transaction.getInitiatedBy().equals(SecurityUtils.currentUserId()) && SecurityUtils.hasRole("ROLE_CUSTOMER")) {
            throw new ForbiddenOperationException("Cannot cancel other user's scheduled transfer");
        }

        TransactionStatus old = transaction.getStatus();
        transaction.setStatus(TransactionStatus.CANCELLED);
        BankTransaction saved = transactionRepository.save(transaction);
        saveTransactionAudit(saved, old, TransactionStatus.CANCELLED, "User cancelled scheduled transfer");
        transactionAlertService.notifyTransaction(saved);

        return TransactionMapper.toResponse(saved);
    }

    @Transactional
    public TransactionResponse reverse(String referenceNumber, String reason) {
        BankTransaction original = transactionRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (original.getStatus() != TransactionStatus.SUCCESS) {
            throw new ForbiddenOperationException("Only successful transactions can be reversed");
        }

        if (original.getTransactionType() == TransactionType.REVERSAL) {
            throw new ForbiddenOperationException("Cannot reverse a reversal transaction");
        }

        if (original.getSourceAccount() == null || original.getDestinationAccount() == null) {
            throw new ForbiddenOperationException("Reversal currently supported only for transfer transactions");
        }

        Account src = accountService.getAccountForUpdate(original.getSourceAccount().getAccountNumber());
        Account dest = accountService.getAccountForUpdate(original.getDestinationAccount().getAccountNumber());

        if (dest.getAvailableBalance().compareTo(original.getAmount()) < 0) {
            throw new InsufficientBalanceException("Destination account has insufficient balance for reversal");
        }

        BigDecimal beforeDest = dest.getAvailableBalance();
        accountService.debit(dest, original.getAmount());

        BigDecimal refundAmount = original.getAmount().add(original.getCharges()).add(original.getTax());
        BigDecimal beforeSrc = src.getAvailableBalance();
        accountService.credit(src, refundAmount);

        original.setStatus(TransactionStatus.REVERSED);
        transactionRepository.save(original);
        saveTransactionAudit(original, TransactionStatus.SUCCESS, TransactionStatus.REVERSED, "Marked reversed");
        transactionAlertService.notifyTransaction(original);

        BankTransaction reversal = baseTransaction(
                TransactionType.REVERSAL,
                original.getAmount(),
                original.getCharges(),
                original.getTax(),
                reason,
                dest,
                src,
                null
        );
        reversal.setStatus(TransactionStatus.SUCCESS);
        reversal.setBeforeBalance(beforeDest);
        reversal.setAfterBalance(beforeDest.subtract(original.getAmount()));

        BankTransaction saved = transactionRepository.save(reversal);
        saveTransactionAudit(saved, null, TransactionStatus.SUCCESS, "Reversal executed");
        transactionAlertService.notifyTransaction(saved);

        auditService.log(SecurityUtils.currentUserId(), "TRANSFER_REVERSAL", "TRANSACTION", saved.getId().toString(),
                null, saved.getReferenceNumber(), true, reason);

        return TransactionMapper.toResponse(saved);
    }

    @Transactional
    public void processScheduledTransfers() {
        List<BankTransaction> scheduled = transactionRepository.findByStatusAndScheduledForBefore(
                TransactionStatus.PENDING,
                LocalDateTime.now()
        );

        for (BankTransaction transaction : scheduled) {
            if (transaction.getSourceAccount() == null) {
                continue;
            }
            Account source = accountService.getAccountForUpdate(transaction.getSourceAccount().getAccountNumber());
            Account destination = transaction.getDestinationAccount() == null ? null
                    : accountService.getAccountForUpdate(transaction.getDestinationAccount().getAccountNumber());
            BigDecimal totalDebit = transaction.getAmount().add(transaction.getCharges()).add(transaction.getTax());
            executeTransfer(transaction, source, destination, totalDebit);
        }
    }

    public List<TransactionResponse> myRecentTransactions() {
        Long userId = SecurityUtils.currentUserId();
        if (userId == null) {
            return java.util.Collections.emptyList();
        }
        return transactionRepository.findTop20ByInitiatedByOrderByInitiatedAtDesc(userId).stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    public List<TransactionResponse> pendingApprovals() {
        return transactionRepository.findByStatusInOrderByInitiatedAtDesc(
                        List.of(TransactionStatus.PENDING, TransactionStatus.FLAGGED),
                        PageRequest.of(0, 200)
                ).stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    public TransactionResponse getById(Long transactionId) {
        BankTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return TransactionMapper.toResponse(transaction);
    }

    @Transactional
    protected TransactionResponse executeTransfer(BankTransaction transaction, Account source, Account destination, BigDecimal totalDebit) {
        BigDecimal before = source.getAvailableBalance();
        accountService.debit(source, totalDebit);
        if (destination != null) {
            accountService.credit(destination, transaction.getAmount());
        }

        TransactionStatus old = transaction.getStatus();
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setBeforeBalance(before);
        transaction.setAfterBalance(before.subtract(totalDebit));
        transaction.setFailureReason(null);
        BankTransaction saved = transactionRepository.save(transaction);

        saveTransactionAudit(saved, old, TransactionStatus.SUCCESS, "Transfer executed successfully");

        notificationService.publish(transaction.getInitiatedBy(), NotificationType.TRANSFER,
                "Transfer Successful",
                "Transfer " + saved.getReferenceNumber() + " completed successfully");
        transactionAlertService.notifyTransaction(saved);

        auditService.log(transaction.getInitiatedBy(), "TRANSFER_INITIATE", "TRANSACTION", saved.getId().toString(),
                old == null ? null : old.name(), TransactionStatus.SUCCESS.name(), true, "Transfer completed");

        return TransactionMapper.toResponse(saved);
    }

    private void validateTransferLimits(Long userId, BigDecimal amount) {
        if (appProperties.getLimits().getTransferPerTransactionLimit() != null
                && amount.compareTo(appProperties.getLimits().getTransferPerTransactionLimit()) > 0) {
            throw new ForbiddenOperationException("Per transaction transfer limit exceeded");
        }

        BigDecimal usedToday = transactionRepository.getTotalSuccessfulTransfers(userId, LocalDate.now().atStartOfDay());
        if (usedToday.add(amount).compareTo(appProperties.getLimits().getTransferDailyLimit()) > 0) {
            throw new ForbiddenOperationException("Daily transfer limit exceeded");
        }

        BigDecimal usedMonth = transactionRepository.getTotalSuccessfulTransfers(
                userId,
                LocalDate.now().withDayOfMonth(1).atStartOfDay()
        );
        if (usedMonth.add(amount).compareTo(appProperties.getLimits().getTransferMonthlyLimit()) > 0) {
            throw new ForbiddenOperationException("Monthly transfer limit exceeded");
        }
    }

    private void verifyTransactionPin(Customer customer, String pin) {
        if (customer.getTransactionPinHash() == null || customer.getTransactionPinHash().isBlank()) {
            throw new ForbiddenOperationException("Set transaction PIN before transfers");
        }
        if (pin == null || !passwordEncoder.matches(pin, customer.getTransactionPinHash())) {
            throw new ForbiddenOperationException("Invalid transaction PIN");
        }
    }

    private boolean isAccountOwnedByCustomer(Account account, Customer customer) {
        return accountService.isOwnedByCustomer(account, customer.getId());
    }

    private TransferResolution resolveDestination(TransferRequest request, Customer customer) {
        Account destination = null;
        boolean newBeneficiary = false;

        switch (request.getTransferMode()) {
            case SELF -> {
                if (request.getDestinationAccountNumber() == null) {
                    throw new ForbiddenOperationException("Destination account is required for self transfer");
                }
                destination = accountService.getAccountForUpdate(request.getDestinationAccountNumber());
                if (customer != null && !isAccountOwnedByCustomer(destination, customer)) {
                    throw new ForbiddenOperationException("Self transfer destination must be your own account");
                }
            }
            case INTERNAL -> {
                if (request.getDestinationAccountNumber() == null) {
                    throw new ForbiddenOperationException("Destination account is required for internal transfer");
                }
                destination = accountService.getAccountForUpdate(request.getDestinationAccountNumber());
            }
            case BENEFICIARY, EXTERNAL, NEFT, IMPS, RTGS, UPI -> {
                if (customer == null) {
                    throw new ForbiddenOperationException("Beneficiary transfer is allowed only for customer users");
                }
                if (request.getBeneficiaryId() == null) {
                    throw new ForbiddenOperationException("Beneficiary is required for beneficiary transfer");
                }
                Beneficiary beneficiary = beneficiaryService.getBeneficiaryForCustomer(request.getBeneficiaryId(), customer.getId());
                if (beneficiary.isBlacklisted()) {
                    throw new ForbiddenOperationException("Beneficiary is blacklisted");
                }
                if (beneficiary.getStatus() != BeneficiaryStatus.ACTIVE) {
                    throw new ForbiddenOperationException("Beneficiary is not active");
                }
                if (request.getAmount().compareTo(beneficiary.getDailyLimit()) > 0) {
                    throw new ForbiddenOperationException("Beneficiary transfer limit exceeded");
                }
                newBeneficiary = beneficiary.getCreatedAt() != null && beneficiary.getCreatedAt().isAfter(LocalDateTime.now().minusHours(48));
                destination = accountService.findByAccountNumberOrNull(beneficiary.getAccountNumber());
            }
            case SCHEDULED, RECURRING, BULK -> {
                if (request.getDestinationAccountNumber() == null) {
                    throw new ForbiddenOperationException("Destination account is required");
                }
                destination = accountService.getEntityByNumber(request.getDestinationAccountNumber());
            }
            default -> throw new ForbiddenOperationException("Unsupported transfer mode: " + request.getTransferMode());
        }

        return new TransferResolution(destination, newBeneficiary);
    }

    private TransactionType toTransactionType(TransferMode mode) {
        return switch (mode) {
            case SELF, INTERNAL -> TransactionType.INTERNAL_TRANSFER;
            case BENEFICIARY -> TransactionType.BENEFICIARY_TRANSFER;
            case EXTERNAL -> TransactionType.EXTERNAL_TRANSFER;
            case NEFT -> TransactionType.NEFT;
            case IMPS -> TransactionType.IMPS;
            case RTGS -> TransactionType.RTGS;
            case UPI -> TransactionType.UPI;
            case SCHEDULED, RECURRING -> TransactionType.SCHEDULED_TRANSFER;
            case BULK -> TransactionType.BULK_SALARY_CREDIT;
        };
    }

    private BigDecimal resolveTransferCharges(TransferMode mode, BigDecimal amount) {
        return pricingService.transferCharge(mode, amount);
    }

    private BankTransaction baseTransaction(TransactionType type,
                                            BigDecimal amount,
                                            BigDecimal charges,
                                            BigDecimal tax,
                                            String remarks,
                                            Account source,
                                            Account destination,
                                            LocalDateTime scheduledFor) {
        BankTransaction transaction = new BankTransaction();
        transaction.setReferenceNumber(ReferenceGenerator.transactionReference());
        transaction.setSourceAccount(source);
        transaction.setDestinationAccount(destination);
        transaction.setTransactionType(type);
        transaction.setAmount(amount);
        transaction.setCharges(charges);
        transaction.setTax(tax);
        transaction.setDescription(remarks);
        transaction.setInitiatedBy(SecurityUtils.currentUserId());
        transaction.setChannel(TransactionChannel.API);
        transaction.setInitiatedAt(LocalDateTime.now());
        transaction.setValueDate(LocalDate.now());
        transaction.setStatus(TransactionStatus.INITIATED);
        transaction.setIpAddress(RequestMetadataUtil.currentIp());
        transaction.setDeviceInfo(RequestMetadataUtil.currentDevice());
        transaction.setScheduledFor(scheduledFor);
        return transaction;
    }

    private void saveTransactionAudit(BankTransaction transaction,
                                      TransactionStatus oldStatus,
                                      TransactionStatus newStatus,
                                      String remarks) {
        TransactionAudit audit = new TransactionAudit();
        audit.setTransaction(transaction);
        audit.setOldStatus(oldStatus);
        audit.setNewStatus(newStatus);
        audit.setChangedBy(resolveActorUserId());
        audit.setChangedAt(LocalDateTime.now());
        audit.setRemarks(remarks);
        transactionAuditRepository.save(audit);
    }

    private String buildWithdrawalRemarks(WithdrawalRequest request) {
        if (!"ATM".equalsIgnoreCase(request.getMode()) || request.getCardNumber() == null || request.getCardNumber().isBlank()) {
            return request.getRemarks();
        }
        if (request.getRemarks() == null || request.getRemarks().isBlank()) {
            return "CARD=" + request.getCardNumber();
        }
        if (request.getRemarks().contains("CARD=" + request.getCardNumber())) {
            return request.getRemarks();
        }
        return "CARD=" + request.getCardNumber() + " | " + request.getRemarks();
    }

    private TransactionChannel resolveChannelFromOperationMode(String mode) {
        if (mode == null) {
            return TransactionChannel.API;
        }
        if ("ATM".equalsIgnoreCase(mode)) {
            return TransactionChannel.ATM;
        }
        if ("CASH".equalsIgnoreCase(mode) || "CHEQUE".equalsIgnoreCase(mode) || "TELLER".equalsIgnoreCase(mode)) {
            return TransactionChannel.BRANCH;
        }
        return TransactionChannel.API;
    }

    private record TransferResolution(Account destination, boolean newBeneficiary) {
    }

    private Long resolveActorUserId() {
        try {
            return SecurityUtils.currentUserId();
        } catch (Exception ex) {
            return null;
        }
    }
}
