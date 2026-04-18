package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.account.EmiPaymentRequest;
import com.bankingsim.banking.dto.account.EmiScheduleResponse;
import com.bankingsim.banking.dto.account.LoanApplyRequest;
import com.bankingsim.banking.dto.account.LoanDecisionRequest;
import com.bankingsim.banking.dto.account.LoanResponse;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.EmiSchedule;
import com.bankingsim.banking.entity.Loan;
import com.bankingsim.banking.entity.enums.EmiStatus;
import com.bankingsim.banking.entity.enums.LoanStatus;
import com.bankingsim.banking.entity.enums.LoanType;
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
import com.bankingsim.banking.repository.EmiScheduleRepository;
import com.bankingsim.banking.repository.EmployeeRepository;
import com.bankingsim.banking.repository.LoanRepository;
import com.bankingsim.banking.util.ReferenceGenerator;
import com.bankingsim.banking.util.SecurityUtils;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final EmiScheduleRepository emiScheduleRepository;
    private final EmployeeRepository employeeRepository;
    private final AccountService accountService;
    private final CustomerService customerService;
    private final BankTransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final TransactionAlertService transactionAlertService;
    private final AuditService auditService;
    private final AppProperties appProperties;

    @Transactional
    public LoanResponse apply(LoanApplyRequest request) {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        Account account = accountService.getEntityByNumber(request.getDisbursementAccountNumber());

        if (!accountService.listByCustomer(customer.getId(), 0, 100).getContent().stream()
                .anyMatch(a -> a.getAccountNumber().equals(account.getAccountNumber()))) {
            throw new ForbiddenOperationException("Disbursement account must belong to applicant");
        }

        Loan loan = new Loan();
        loan.setCustomer(customer);
        loan.setDisbursementAccount(account);
        loan.setLoanType(LoanType.valueOf(request.getLoanType().toUpperCase()));
        loan.setStatus(LoanStatus.APPLIED);
        loan.setPrincipalAmount(request.getPrincipalAmount());
        loan.setAnnualInterestRate(BigDecimal.ZERO);
        loan.setTenureMonths(request.getTenureMonths());

        int creditScore = simulateCreditScore(customer);
        int riskScore = Math.max(1, 100 - creditScore);
        loan.setCreditScore(creditScore);
        loan.setRiskScore(riskScore);

        Loan saved = loanRepository.save(loan);

        auditService.log(SecurityUtils.currentUserId(), "LOAN_APPLY", "LOAN", saved.getId().toString(), null,
                saved.getLoanType().name(), true, "Loan application submitted");

        return toResponse(saved);
    }

    private void enforceEmployeeLoanAccess(Loan loan) {
        if (SecurityUtils.hasRole("ROLE_ADMIN") || SecurityUtils.hasRole("ROLE_AUDITOR")) {
            return;
        }
        if (SecurityUtils.hasRole("ROLE_MANAGER") || SecurityUtils.hasRole("ROLE_EMPLOYEE")) {
            Long userId = SecurityUtils.currentUserId();
            Long empBranchId = employeeRepository.findByUserId(userId)
                    .map(emp -> emp.getBranch().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
            if (!empBranchId.equals(loan.getCustomer().getBranch().getId())) {
                throw new ForbiddenOperationException("Cannot access loan from a different branch");
            }
        }
    }

    @Transactional
    public LoanResponse review(Long loanId, LoanDecisionRequest request) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        enforceEmployeeLoanAccess(loan);

        if (loan.getStatus() != LoanStatus.APPLIED && loan.getStatus() != LoanStatus.UNDER_REVIEW) {
            throw new ForbiddenOperationException("Loan cannot be reviewed in current state");
        }

        if (request.getApprove()) {
            BigDecimal rate = request.getAnnualInterestRate() == null ? defaultRateForType(loan.getLoanType()) : request.getAnnualInterestRate();
            loan.setAnnualInterestRate(rate);
            loan.setStatus(LoanStatus.APPROVED);
            loan.setApprovedOn(LocalDate.now());
            loan.setEmiAmount(calculateEmi(loan.getPrincipalAmount(), rate, loan.getTenureMonths()));
            loan.setOutstandingPrincipal(loan.getPrincipalAmount());
        } else {
            loan.setStatus(LoanStatus.REJECTED);
            loan.setRejectionReason(request.getRemarks());
        }

        Loan saved = loanRepository.save(loan);

        auditService.log(SecurityUtils.currentUserId(), request.getApprove() ? "LOAN_APPROVE" : "LOAN_REJECT", "LOAN",
                loanId.toString(), null, saved.getStatus().name(), true, request.getRemarks());

        if (request.getApprove()) {
            notificationService.publish(saved.getCustomer().getUser().getId(), NotificationType.GENERAL,
                    "Loan Approved",
                    "Loan " + saved.getId() + " approved. Please wait for disbursement.");
        }

        return toResponse(saved);
    }

    @Transactional
    public LoanResponse disburse(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        enforceEmployeeLoanAccess(loan);

        if (loan.getStatus() != LoanStatus.APPROVED) {
            throw new ForbiddenOperationException("Only approved loans can be disbursed");
        }

        Account account = accountService.getAccountForUpdate(loan.getDisbursementAccount().getAccountNumber());
        accountService.credit(account, loan.getPrincipalAmount());

        loan.setStatus(LoanStatus.ACTIVE);
        loan.setDisbursedOn(LocalDate.now());
        loan.setOutstandingPrincipal(loan.getPrincipalAmount());
        Loan saved = loanRepository.save(loan);

        createLoanTransaction(saved, TransactionType.DEPOSIT, loan.getPrincipalAmount(), "Loan disbursement");
        generateEmiSchedule(saved);

        notificationService.publish(saved.getCustomer().getUser().getId(), NotificationType.GENERAL,
                "Loan Disbursed",
                "Loan amount has been credited to account " + account.getAccountNumber());

        auditService.log(SecurityUtils.currentUserId(), "LOAN_DISBURSE", "LOAN", loanId.toString(), null,
                LoanStatus.ACTIVE.name(), true, "Loan disbursed");

        return toResponse(saved);
    }

    @Transactional
    public LoanResponse payEmi(EmiPaymentRequest request) {
        EmiSchedule schedule = emiScheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("EMI schedule not found"));

        Loan loan = schedule.getLoan();
        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new ForbiddenOperationException("Loan is not active");
        }

        Account account = accountService.getAccountForUpdate(loan.getDisbursementAccount().getAccountNumber());
        if (account.getAvailableBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for EMI payment");
        }

        accountService.debit(account, request.getAmount());

        if (request.getAmount().compareTo(schedule.getTotalDue()) >= 0) {
            schedule.setStatus(EmiStatus.PAID);
            schedule.setPaidOn(LocalDate.now());
            loan.setOutstandingPrincipal(loan.getOutstandingPrincipal().subtract(schedule.getPrincipalComponent()));
        } else {
            schedule.setStatus(EmiStatus.PARTIAL);
            BigDecimal proportion = request.getAmount().divide(schedule.getTotalDue(), 6, RoundingMode.HALF_UP);
            BigDecimal principalPaid = schedule.getPrincipalComponent().multiply(proportion);
            loan.setOutstandingPrincipal(loan.getOutstandingPrincipal().subtract(principalPaid));
        }

        emiScheduleRepository.save(schedule);

        if (loan.getOutstandingPrincipal().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setStatus(LoanStatus.CLOSED);
            loan.setOutstandingPrincipal(BigDecimal.ZERO);
        }
        Loan savedLoan = loanRepository.save(loan);

        createLoanTransaction(savedLoan, TransactionType.LOAN_EMI_DEBIT, request.getAmount(), "Loan EMI payment");

        auditService.log(SecurityUtils.currentUserId(), "EMI_PAYMENT", "LOAN", savedLoan.getId().toString(), null,
                schedule.getStatus().name(), true, "EMI payment processed");

        return toResponse(savedLoan);
    }

    @Transactional
    public LoanResponse foreclose(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new ForbiddenOperationException("Only active loan can be foreclosed");
        }

        Account account = accountService.getAccountForUpdate(loan.getDisbursementAccount().getAccountNumber());
        BigDecimal foreclosureAmount = loan.getOutstandingPrincipal().add(
                loan.getOutstandingPrincipal().multiply(BigDecimal.valueOf(0.02))
        );

        if (account.getAvailableBalance().compareTo(foreclosureAmount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for foreclosure");
        }

        accountService.debit(account, foreclosureAmount);
        loan.setOutstandingPrincipal(BigDecimal.ZERO);
        loan.setStatus(LoanStatus.FORECLOSED);
        Loan saved = loanRepository.save(loan);

        List<EmiSchedule> schedules = emiScheduleRepository.findByLoanIdOrderByInstallmentNumberAsc(saved.getId());
        schedules.stream()
                .filter(e -> e.getStatus() == EmiStatus.PENDING || e.getStatus() == EmiStatus.MISSED)
                .forEach(e -> {
                    e.setStatus(EmiStatus.PAID);
                    e.setPaidOn(LocalDate.now());
                });
        emiScheduleRepository.saveAll(schedules);

        createLoanTransaction(saved, TransactionType.LOAN_EMI_DEBIT, foreclosureAmount, "Loan foreclosure");

        auditService.log(SecurityUtils.currentUserId(), "LOAN_FORECLOSE", "LOAN", loanId.toString(), null,
                LoanStatus.FORECLOSED.name(), true, "Loan foreclosed");

        return toResponse(saved);
    }

    public List<LoanResponse> myLoans() {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        return loanRepository.findByCustomerId(customer.getId()).stream().map(this::toResponse).toList();
    }

    public List<LoanResponse> getAllLoans(LoanStatus status) {
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN") || SecurityUtils.hasRole("ROLE_AUDITOR");
        
        if (!isAdmin) {
            Long userId = SecurityUtils.currentUserId();
            Long branchId = employeeRepository.findByUserId(userId)
                    .map(emp -> emp.getBranch().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
                    
            if (status != null) {
                return loanRepository.findByCustomerBranchIdAndStatus(branchId, status).stream().map(this::toResponse).toList();
            }
            return loanRepository.findByCustomerBranchId(branchId).stream().map(this::toResponse).toList();
        }

        if (status != null) {
            return loanRepository.findByStatus(status).stream().map(this::toResponse).toList();
        }
        return loanRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<EmiScheduleResponse> emiSchedule(Long loanId) {
        return emiScheduleRepository.findByLoanIdOrderByInstallmentNumberAsc(loanId).stream()
                .map(schedule -> EmiScheduleResponse.builder()
                        .id(schedule.getId())
                        .installmentNumber(schedule.getInstallmentNumber())
                        .dueDate(schedule.getDueDate())
                        .principalComponent(schedule.getPrincipalComponent())
                        .interestComponent(schedule.getInterestComponent())
                        .penaltyComponent(schedule.getPenaltyComponent())
                        .totalDue(schedule.getTotalDue())
                        .status(schedule.getStatus())
                        .build())
                .toList();
    }

    @Transactional
    public void markMissedEmis() {
        List<EmiSchedule> overdue = emiScheduleRepository.findByStatusAndDueDateBefore(EmiStatus.PENDING, LocalDate.now());
        for (EmiSchedule schedule : overdue) {
            schedule.setStatus(EmiStatus.MISSED);
            BigDecimal penalty = schedule.getTotalDue()
                    .multiply(appProperties.getFees().getEmiLatePenaltyPercent())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            schedule.setPenaltyComponent(schedule.getPenaltyComponent().add(penalty));
            schedule.setTotalDue(schedule.getTotalDue().add(penalty));
        }
        emiScheduleRepository.saveAll(overdue);
    }

    private void generateEmiSchedule(Loan loan) {
        List<EmiSchedule> schedules = new ArrayList<>();
        BigDecimal outstanding = loan.getPrincipalAmount();
        BigDecimal monthlyRate = loan.getAnnualInterestRate().divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);

        for (int i = 1; i <= loan.getTenureMonths(); i++) {
            BigDecimal interest = outstanding.multiply(monthlyRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principal = loan.getEmiAmount().subtract(interest).setScale(2, RoundingMode.HALF_UP);
            if (i == loan.getTenureMonths()) {
                principal = outstanding;
            }
            outstanding = outstanding.subtract(principal).max(BigDecimal.ZERO);

            EmiSchedule schedule = new EmiSchedule();
            schedule.setLoan(loan);
            schedule.setInstallmentNumber(i);
            schedule.setDueDate(loan.getDisbursedOn().plusMonths(i));
            schedule.setPrincipalComponent(principal);
            schedule.setInterestComponent(interest);
            schedule.setPenaltyComponent(BigDecimal.ZERO);
            schedule.setTotalDue(principal.add(interest));
            schedule.setStatus(EmiStatus.PENDING);
            schedules.add(schedule);
        }

        emiScheduleRepository.saveAll(schedules);
    }

    private BigDecimal calculateEmi(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        if (annualRate.compareTo(BigDecimal.ZERO) <= 0) {
            return principal.divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);
        }

        MathContext mc = new MathContext(20, RoundingMode.HALF_UP);
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(1200), 12, RoundingMode.HALF_UP);
        BigDecimal onePlusRPowerN = pow(BigDecimal.ONE.add(monthlyRate, mc), tenureMonths, mc);

        BigDecimal numerator = principal.multiply(monthlyRate, mc).multiply(onePlusRPowerN, mc);
        BigDecimal denominator = onePlusRPowerN.subtract(BigDecimal.ONE, mc);
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal pow(BigDecimal base, int exponent, MathContext mc) {
        BigDecimal result = BigDecimal.ONE;
        for (int i = 0; i < exponent; i++) {
            result = result.multiply(base, mc);
        }
        return result;
    }

    private BigDecimal defaultRateForType(LoanType type) {
        return switch (type) {
            case PERSONAL -> BigDecimal.valueOf(13.5);
            case HOME -> BigDecimal.valueOf(8.75);
            case EDUCATION -> BigDecimal.valueOf(9.5);
            case VEHICLE -> BigDecimal.valueOf(10.5);
        };
    }

    private int simulateCreditScore(Customer customer) {
        int base = switch (customer.getRiskProfile()) {
            case LOW -> 780;
            case MEDIUM -> 700;
            case HIGH -> 620;
        };
        int adjustment = customer.getIncomeRange() == null ? 0 : switch (customer.getIncomeRange()) {
            case BELOW_300K -> -40;
            case BETWEEN_300K_700K -> -10;
            case BETWEEN_700K_1500K -> 20;
            case ABOVE_1500K -> 40;
        };
        return Math.max(300, Math.min(900, base + adjustment));
    }

    private LoanResponse toResponse(Loan loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .loanType(loan.getLoanType())
                .status(loan.getStatus())
                .principalAmount(loan.getPrincipalAmount())
                .annualInterestRate(loan.getAnnualInterestRate())
                .tenureMonths(loan.getTenureMonths())
                .emiAmount(loan.getEmiAmount())
                .outstandingPrincipal(loan.getOutstandingPrincipal())
                .creditScore(loan.getCreditScore())
                .riskScore(loan.getRiskScore())
                .build();
    }

    private void createLoanTransaction(Loan loan, TransactionType type, BigDecimal amount, String remarks) {
        BankTransaction transaction = new BankTransaction();
        transaction.setReferenceNumber(ReferenceGenerator.transactionReference());
        transaction.setSourceAccount(type == TransactionType.DEPOSIT ? null : loan.getDisbursementAccount());
        transaction.setDestinationAccount(type == TransactionType.DEPOSIT ? loan.getDisbursementAccount() : null);
        transaction.setTransactionType(type);
        transaction.setAmount(amount);
        transaction.setCharges(BigDecimal.ZERO);
        transaction.setTax(BigDecimal.ZERO);
        transaction.setDescription(remarks);
        transaction.setInitiatedBy(SecurityUtils.currentUserId());
        transaction.setChannel(TransactionChannel.SYSTEM);
        transaction.setInitiatedAt(LocalDateTime.now());
        transaction.setValueDate(LocalDate.now());
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setFraudScore(0);
        BankTransaction saved = transactionRepository.save(transaction);
        transactionAlertService.notifyTransaction(saved);
    }
}
