package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.account.CreateFdRequest;
import com.bankingsim.banking.dto.account.CreateRdRequest;
import com.bankingsim.banking.dto.account.FixedDepositResponse;
import com.bankingsim.banking.dto.account.RecurringDepositResponse;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.FixedDeposit;
import com.bankingsim.banking.entity.RecurringDeposit;
import com.bankingsim.banking.entity.enums.InterestPayoutMode;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.entity.enums.TransactionChannel;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.exception.InsufficientBalanceException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.notification.TransactionAlertService;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.FixedDepositRepository;
import com.bankingsim.banking.repository.RecurringDepositRepository;
import com.bankingsim.banking.util.ReferenceGenerator;
import com.bankingsim.banking.util.SecurityUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DepositProductService {

    private final FixedDepositRepository fixedDepositRepository;
    private final RecurringDepositRepository recurringDepositRepository;
    private final AccountService accountService;
    private final CustomerService customerService;
    private final BankTransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final TransactionAlertService transactionAlertService;
    private final AuditService auditService;
    private final AppProperties appProperties;

    @Transactional
    public FixedDepositResponse createFd(CreateFdRequest request) {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        Account account = accountService.getAccountForUpdate(request.getFundingAccountNumber());
        ensureOwnAccount(customer, account);

        if (account.getAvailableBalance().compareTo(request.getPrincipalAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for FD creation");
        }

        accountService.debit(account, request.getPrincipalAmount());

        BigDecimal rate = resolveFdRate(request.getTenureMonths());
        BigDecimal maturityAmount = calculateSimpleMaturity(request.getPrincipalAmount(), rate, request.getTenureMonths());

        FixedDeposit fd = new FixedDeposit();
        fd.setCustomer(customer);
        fd.setFundingAccount(account);
        fd.setFdNumber(ReferenceGenerator.fdNumber());
        fd.setPrincipalAmount(request.getPrincipalAmount());
        fd.setInterestRate(rate);
        fd.setTenureMonths(request.getTenureMonths());
        fd.setOpenedOn(LocalDate.now());
        fd.setMaturityDate(LocalDate.now().plusMonths(request.getTenureMonths()));
        fd.setMaturityAmount(maturityAmount);
        fd.setAutoRenew(request.isAutoRenew());
        fd.setPayoutMode(InterestPayoutMode.valueOf(request.getPayoutMode().toUpperCase()));
        fd.setStatus("ACTIVE");
        fd.setCertificateNumber("FDCERT-" + ReferenceGenerator.randomToken().substring(0, 10));

        FixedDeposit saved = fixedDepositRepository.save(fd);
        createDepositTransaction(account, null, TransactionType.FD_CREATION, request.getPrincipalAmount(), "FD creation " + saved.getFdNumber());

        auditService.log(SecurityUtils.currentUserId(), "FD_CREATE", "FIXED_DEPOSIT", saved.getId().toString(), null,
                saved.getFdNumber(), true, "FD created");

        return toResponse(saved);
    }

    @Transactional
    public FixedDepositResponse prematureWithdraw(String fdNumber) {
        FixedDeposit fd = fixedDepositRepository.findByFdNumber(fdNumber)
                .orElseThrow(() -> new ResourceNotFoundException("FD not found"));

        if (!"ACTIVE".equals(fd.getStatus())) {
            throw new ForbiddenOperationException("FD is not active");
        }

        Account account = accountService.getAccountForUpdate(fd.getFundingAccount().getAccountNumber());

        long monthsHeld = Math.max(1, ChronoUnit.MONTHS.between(fd.getOpenedOn(), LocalDate.now()));
        BigDecimal fullInterest = fd.getMaturityAmount().subtract(fd.getPrincipalAmount());
        BigDecimal proportion = BigDecimal.valueOf(monthsHeld)
                .divide(BigDecimal.valueOf(fd.getTenureMonths()), 6, RoundingMode.HALF_UP);
        BigDecimal accruedInterest = fullInterest.multiply(proportion).setScale(2, RoundingMode.HALF_UP);
        BigDecimal penalty = accruedInterest
                .multiply(appProperties.getFees().getFdPrematureWithdrawalPenaltyPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal payout = fd.getPrincipalAmount().add(accruedInterest).subtract(penalty);
        accountService.credit(account, payout);

        fd.setStatus("PREMATURE_CLOSED");
        FixedDeposit saved = fixedDepositRepository.save(fd);

        createDepositTransaction(null, account, TransactionType.FD_MATURITY_PAYOUT, payout,
                "FD premature withdrawal " + saved.getFdNumber());

        auditService.log(SecurityUtils.currentUserId(), "FD_PREMATURE_WITHDRAW", "FIXED_DEPOSIT", saved.getId().toString(),
                "ACTIVE", saved.getStatus(), true, "FD prematurely withdrawn");

        return toResponse(saved);
    }

    @Transactional
    public RecurringDepositResponse createRd(CreateRdRequest request) {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        Account account = accountService.getAccountForUpdate(request.getFundingAccountNumber());
        ensureOwnAccount(customer, account);

        RecurringDeposit rd = new RecurringDeposit();
        rd.setCustomer(customer);
        rd.setFundingAccount(account);
        rd.setRdNumber(ReferenceGenerator.rdNumber());
        rd.setMonthlyInstallment(request.getMonthlyInstallment());
        rd.setInterestRate(resolveRdRate(request.getTenureMonths()));
        rd.setTenureMonths(request.getTenureMonths());
        rd.setOpenedOn(LocalDate.now());
        rd.setMaturityDate(LocalDate.now().plusMonths(request.getTenureMonths()));
        rd.setStatus("ACTIVE");

        RecurringDeposit saved = recurringDepositRepository.save(rd);

        auditService.log(SecurityUtils.currentUserId(), "RD_CREATE", "RECURRING_DEPOSIT", saved.getId().toString(), null,
                saved.getRdNumber(), true, "RD created");

        return toResponse(saved);
    }

    @Transactional
    public RecurringDepositResponse payRdInstallment(String rdNumber) {
        RecurringDeposit rd = recurringDepositRepository.findByRdNumber(rdNumber)
                .orElseThrow(() -> new ResourceNotFoundException("RD not found"));

        if (!"ACTIVE".equals(rd.getStatus())) {
            throw new ForbiddenOperationException("RD is not active");
        }

        Account account = accountService.getAccountForUpdate(rd.getFundingAccount().getAccountNumber());

        if (account.getAvailableBalance().compareTo(rd.getMonthlyInstallment()) < 0) {
            rd.setMissedInstallments(rd.getMissedInstallments() + 1);
            recurringDepositRepository.save(rd);
            throw new InsufficientBalanceException("Insufficient funds for RD installment");
        }

        accountService.debit(account, rd.getMonthlyInstallment());
        rd.setTotalPaid(rd.getTotalPaid().add(rd.getMonthlyInstallment()));
        RecurringDeposit saved = recurringDepositRepository.save(rd);

        createDepositTransaction(account, null, TransactionType.RD_INSTALLMENT_DEBIT, rd.getMonthlyInstallment(),
                "RD installment debit " + saved.getRdNumber());

        return toResponse(saved);
    }

    @Transactional
    public void processFdMaturity() {
        List<FixedDeposit> matured = fixedDepositRepository.findByMaturityDateLessThanEqualAndStatus(LocalDate.now(), "ACTIVE");
        for (FixedDeposit fd : matured) {
            Account account = accountService.getAccountForUpdate(fd.getFundingAccount().getAccountNumber());
            accountService.credit(account, fd.getMaturityAmount());
            createDepositTransaction(null, account, TransactionType.FD_MATURITY_PAYOUT, fd.getMaturityAmount(),
                    "FD maturity payout " + fd.getFdNumber());

            if (fd.isAutoRenew()) {
                fd.setOpenedOn(LocalDate.now());
                fd.setMaturityDate(LocalDate.now().plusMonths(fd.getTenureMonths()));
            } else {
                fd.setStatus("MATURED");
            }
            fixedDepositRepository.save(fd);

            notificationService.publish(fd.getCustomer().getUser().getId(), NotificationType.FD_MATURITY,
                    "FD Maturity",
                    "FD " + fd.getFdNumber() + " has matured with payout amount " + fd.getMaturityAmount());
        }
    }

    @Transactional
    public void processRdMaturity() {
        List<RecurringDeposit> matured = recurringDepositRepository.findByMaturityDateLessThanEqualAndStatus(LocalDate.now(), "ACTIVE");
        for (RecurringDeposit rd : matured) {
            BigDecimal maturityAmount = calculateRdMaturity(rd);
            Account account = accountService.getAccountForUpdate(rd.getFundingAccount().getAccountNumber());
            accountService.credit(account, maturityAmount);
            createDepositTransaction(null, account, TransactionType.FD_MATURITY_PAYOUT, maturityAmount,
                    "RD maturity payout " + rd.getRdNumber());
            rd.setStatus("MATURED");
            recurringDepositRepository.save(rd);
        }
    }

    public List<FixedDepositResponse> myFds() {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        return fixedDepositRepository.findAll().stream()
                .filter(fd -> fd.getCustomer().getId().equals(customer.getId()))
                .map(this::toResponse)
                .toList();
    }

    public List<RecurringDepositResponse> myRds() {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        return recurringDepositRepository.findAll().stream()
                .filter(rd -> rd.getCustomer().getId().equals(customer.getId()))
                .map(this::toResponse)
                .toList();
    }

    private void ensureOwnAccount(Customer customer, Account account) {
        boolean owned = accountService.listByCustomer(customer.getId(), 0, 200).getContent().stream()
                .anyMatch(a -> a.getAccountNumber().equals(account.getAccountNumber()));
        if (!owned) {
            throw new ForbiddenOperationException("Funding account does not belong to customer");
        }
    }

    private BigDecimal resolveFdRate(int tenureMonths) {
        if (tenureMonths < 12) {
            return BigDecimal.valueOf(6.25);
        }
        if (tenureMonths <= 36) {
            return BigDecimal.valueOf(7.10);
        }
        return BigDecimal.valueOf(7.35);
    }

    private BigDecimal resolveRdRate(int tenureMonths) {
        if (tenureMonths < 12) {
            return BigDecimal.valueOf(6.0);
        }
        if (tenureMonths <= 36) {
            return BigDecimal.valueOf(6.8);
        }
        return BigDecimal.valueOf(7.0);
    }

    private BigDecimal calculateSimpleMaturity(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        BigDecimal years = BigDecimal.valueOf(tenureMonths).divide(BigDecimal.valueOf(12), 6, RoundingMode.HALF_UP);
        BigDecimal interest = principal
                .multiply(annualRate)
                .multiply(years)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return principal.add(interest);
    }

    private BigDecimal calculateRdMaturity(RecurringDeposit rd) {
        BigDecimal totalPrincipal = rd.getTotalPaid();
        BigDecimal years = BigDecimal.valueOf(rd.getTenureMonths()).divide(BigDecimal.valueOf(12), 6, RoundingMode.HALF_UP);
        BigDecimal interest = totalPrincipal
                .multiply(rd.getInterestRate())
                .multiply(years)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return totalPrincipal.add(interest);
    }

    private FixedDepositResponse toResponse(FixedDeposit fd) {
        return FixedDepositResponse.builder()
                .id(fd.getId())
                .fdNumber(fd.getFdNumber())
                .principalAmount(fd.getPrincipalAmount())
                .interestRate(fd.getInterestRate())
                .tenureMonths(fd.getTenureMonths())
                .openedOn(fd.getOpenedOn())
                .maturityDate(fd.getMaturityDate())
                .maturityAmount(fd.getMaturityAmount())
                .autoRenew(fd.isAutoRenew())
                .payoutMode(fd.getPayoutMode().name())
                .status(fd.getStatus())
                .certificateNumber(fd.getCertificateNumber())
                .build();
    }

    private RecurringDepositResponse toResponse(RecurringDeposit rd) {
        return RecurringDepositResponse.builder()
                .id(rd.getId())
                .rdNumber(rd.getRdNumber())
                .monthlyInstallment(rd.getMonthlyInstallment())
                .interestRate(rd.getInterestRate())
                .tenureMonths(rd.getTenureMonths())
                .openedOn(rd.getOpenedOn())
                .maturityDate(rd.getMaturityDate())
                .totalPaid(rd.getTotalPaid())
                .missedInstallments(rd.getMissedInstallments())
                .status(rd.getStatus())
                .build();
    }

    private void createDepositTransaction(Account source,
                                          Account destination,
                                          TransactionType type,
                                          BigDecimal amount,
                                          String remarks) {
        BankTransaction transaction = new BankTransaction();
        transaction.setReferenceNumber(ReferenceGenerator.transactionReference());
        transaction.setSourceAccount(source);
        transaction.setDestinationAccount(destination);
        transaction.setTransactionType(type);
        transaction.setAmount(amount);
        transaction.setCharges(BigDecimal.ZERO);
        transaction.setTax(BigDecimal.ZERO);
        transaction.setDescription(remarks);
        transaction.setInitiatedBy(resolveActor());
        transaction.setChannel(TransactionChannel.SYSTEM);
        transaction.setInitiatedAt(LocalDateTime.now());
        transaction.setValueDate(LocalDate.now());
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setFraudScore(0);
        BankTransaction saved = transactionRepository.save(transaction);
        transactionAlertService.notifyTransaction(saved);
    }

    private Long resolveActor() {
        try {
            return SecurityUtils.currentUserId();
        } catch (Exception ex) {
            return 0L;
        }
    }
}
