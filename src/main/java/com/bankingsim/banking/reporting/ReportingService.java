package com.bankingsim.banking.reporting;

import com.bankingsim.banking.dto.admin.BranchPerformanceResponse;
import com.bankingsim.banking.dto.admin.DashboardSummaryResponse;
import com.bankingsim.banking.dto.transaction.SpendingOverviewResponse;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.LoanStatus;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.mapper.TransactionMapper;
import com.bankingsim.banking.repository.AccountHolderRepository;
import com.bankingsim.banking.repository.AccountRepository;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.BranchRepository;
import com.bankingsim.banking.repository.CustomerRepository;
import com.bankingsim.banking.repository.FraudAlertRepository;
import com.bankingsim.banking.repository.LoanRepository;
import com.bankingsim.banking.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final BankTransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final LoanRepository loanRepository;
    private final BranchRepository branchRepository;
    private final AccountHolderRepository accountHolderRepository;

    public DashboardSummaryResponse dashboardSummary() {
        BigDecimal totalDeposits = accountRepository.sumBalancesByStatus(AccountStatus.ACTIVE).add(accountRepository.sumBalancesByStatus(AccountStatus.DORMANT));
        BigDecimal totalWithdrawals = transactionRepository.sumSuccessfulAmountByType(TransactionType.WITHDRAW);
        BigDecimal totalTransfers = transactionRepository.sumSuccessfulTransferAmount();

        long totalActiveAccounts = accountRepository.countByStatus(AccountStatus.ACTIVE);
        long dormant = accountRepository.countByStatus(AccountStatus.DORMANT);
        long closed = accountRepository.countByStatus(AccountStatus.CLOSED);

        return DashboardSummaryResponse.builder()
                .totalCustomers(customerRepository.count())
                .totalActiveAccounts(totalActiveAccounts)
                .totalDeposits(totalDeposits.toPlainString())
                .totalWithdrawals(totalWithdrawals.toPlainString())
                .totalTransfers(totalTransfers.toPlainString())
                .fraudFlaggedTransactions(fraudAlertRepository.count())
                .dormantAccounts(dormant)
                .closedAccounts(closed)
                .build();
    }

    public List<BranchPerformanceResponse> branchPerformance() {
        return branchRepository.findAll().stream().map(branch -> {
            long customers = customerRepository.countByBranchId(branch.getId());
            long branchAccounts = accountRepository.countByBranchId(branch.getId());
            BigDecimal transferVolume = transactionRepository.sumSuccessfulTransferAmountBySourceBranch(branch.getId());

            return BranchPerformanceResponse.builder()
                    .branchId(branch.getId())
                    .branchCode(branch.getBranchCode())
                    .customers(customers)
                    .accounts(branchAccounts)
                    .transferVolume(transferVolume.toPlainString())
                    .build();
        }).toList();
    }

    public List<TransactionResponse> highValueTransactions(BigDecimal threshold, int limit) {
        int size = Math.max(1, Math.min(limit, 500));
        return transactionRepository.findByAmountGreaterThanEqualOrderByAmountDesc(
                        threshold,
                        PageRequest.of(0, size)
                ).stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    public SpendingOverviewResponse spendingOverview(String accountNumber, LocalDate from, LocalDate to) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new com.bankingsim.banking.exception.ResourceNotFoundException("Account not found"));

        enforceAccountAccess(account);

        LocalDate fromDate = from == null ? LocalDate.now().minusMonths(1) : from;
        LocalDate toDate = to == null ? LocalDate.now() : to;

        List<BankTransaction> transactions = transactionRepository.findBySourceAccountIdOrDestinationAccountId(
                account.getId(),
                account.getId(),
                org.springframework.data.domain.PageRequest.of(0, 5000)
        ).stream().toList();

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryMap = new HashMap<>();

        for (BankTransaction tx : transactions) {
            LocalDate date = tx.getValueDate();
            if (date.isBefore(fromDate) || date.isAfter(toDate)) {
                continue;
            }
            if (tx.getSourceAccount() != null && tx.getSourceAccount().getId().equals(account.getId())) {
                totalDebit = totalDebit.add(tx.getAmount().add(tx.getCharges()).add(tx.getTax()));
                categoryMap.merge(tx.getTransactionType().name(), tx.getAmount(), BigDecimal::add);
            }
            if (tx.getDestinationAccount() != null && tx.getDestinationAccount().getId().equals(account.getId())) {
                totalCredit = totalCredit.add(tx.getAmount());
            }
        }

        Map<String, String> formatted = new HashMap<>();
        categoryMap.forEach((k, v) -> formatted.put(k, v.toPlainString()));

        return SpendingOverviewResponse.builder()
                .totalDebit(totalDebit.toPlainString())
                .totalCredit(totalCredit.toPlainString())
                .byCategory(formatted)
                .build();
    }

    public Map<String, Object> loanPortfolioSummary() {
        long total = loanRepository.count();
        long active = loanRepository.countByStatus(LoanStatus.ACTIVE);
        long overdue = loanRepository.countByStatus(LoanStatus.DEFAULTED);
        BigDecimal outstanding = loanRepository.sumOutstandingPrincipal();

        Map<String, Object> map = new HashMap<>();
        map.put("totalLoans", total);
        map.put("activeLoans", active);
        map.put("overdueLoans", overdue);
        map.put("totalOutstandingPrincipal", outstanding.toPlainString());
        return map;
    }

    public Map<String, String> revenueFromCharges() {
        BigDecimal revenue = transactionRepository.sumChargesAndTaxRevenue();
        return Map.of("chargesAndTaxRevenue", revenue.toPlainString());
    }

    public Map<String, Object> dailyTransactionVolume(LocalDate date) {
        LocalDate target = date == null ? LocalDate.now() : date;
        LocalDateTime start = target.atStartOfDay();
        LocalDateTime end = target.plusDays(1).atStartOfDay();

        long count = transactionRepository.countByInitiatedAtBetween(start, end);
        BigDecimal amount = transactionRepository.sumAmountByInitiatedAtBetween(start, end);

        Map<String, Object> map = new HashMap<>();
        map.put("date", target.toString());
        map.put("transactionCount", count);
        map.put("totalAmount", amount.toPlainString());
        return map;
    }

    public Map<String, Object> npaStyleSummary() {
        long defaulted = loanRepository.countByStatus(LoanStatus.DEFAULTED);
        long active = loanRepository.countByStatus(LoanStatus.ACTIVE);
        BigDecimal defaultedOutstanding = loanRepository.sumOutstandingPrincipalByStatus(LoanStatus.DEFAULTED);
        Map<String, Object> map = new HashMap<>();
        map.put("defaultedLoans", defaulted);
        map.put("activeLoans", active);
        map.put("defaultedOutstanding", defaultedOutstanding.toPlainString());
        return map;
    }

    public Map<String, Object> reconciliationSummary(LocalDate date) {
        LocalDate target = date == null ? LocalDate.now() : date;
        LocalDateTime start = target.atStartOfDay();
        LocalDateTime end = target.plusDays(1).atStartOfDay();

        long total = transactionRepository.countByInitiatedAtBetween(start, end);
        long success = transactionRepository.countByInitiatedAtBetweenAndStatus(start, end, TransactionStatus.SUCCESS);
        long failed = transactionRepository.countByInitiatedAtBetweenAndStatus(start, end, TransactionStatus.FAILED);
        long pending = transactionRepository.countByInitiatedAtBetweenAndStatus(start, end, TransactionStatus.PENDING);
        long flagged = transactionRepository.countByInitiatedAtBetweenAndStatus(start, end, TransactionStatus.FLAGGED);
        long reversed = transactionRepository.countByInitiatedAtBetweenAndStatus(start, end, TransactionStatus.REVERSED);

        BigDecimal totalDebit = transactionRepository.sumSuccessfulDebitsBetween(start, end);
        BigDecimal totalCredit = transactionRepository.sumSuccessfulCreditsBetween(start, end);
        BigDecimal delta = totalCredit.subtract(totalDebit).abs();

        Map<String, Object> map = new HashMap<>();
        map.put("date", target.toString());
        map.put("totalTransactions", total);
        map.put("success", success);
        map.put("failed", failed);
        map.put("pending", pending);
        map.put("flagged", flagged);
        map.put("reversed", reversed);
        map.put("successfulDebitAmount", totalDebit.toPlainString());
        map.put("successfulCreditAmount", totalCredit.toPlainString());
        map.put("debitCreditDelta", delta.toPlainString());
        return map;
    }

    public Map<String, Object> systemMonitoring() {
        Map<String, Object> monitor = new HashMap<>();
        monitor.put("users", customerRepository.count());
        monitor.put("accounts", accountRepository.count());
        monitor.put("transactions", transactionRepository.count());
        monitor.put("fraudCases", fraudAlertRepository.count());

        long todayTxns = transactionRepository.countByInitiatedAtAfter(LocalDate.now().atStartOfDay());
        monitor.put("todayTransactions", todayTxns);
        return monitor;
    }

    public Map<String, Object> monthlySummaryForCustomer() {
        Customer customer = customerRepository.findByUserId(SecurityUtils.currentUserId())
                .orElseThrow(() -> new com.bankingsim.banking.exception.ResourceNotFoundException("Customer profile missing"));

        List<Long> accountIds = accountHolderRepository.findByCustomerId(customer.getId())
                .stream().map(holder -> holder.getAccount().getId()).toList();
        if (accountIds.isEmpty()) {
            return Map.of(
                    "month", LocalDate.now().getMonth().name(),
                    "totalDebits", "0",
                    "totalCredits", "0",
                    "net", "0"
            );
        }

        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        BigDecimal debits = transactionRepository.sumSuccessfulDebitsForAccountsSince(accountIds, monthStart);
        BigDecimal credits = transactionRepository.sumSuccessfulCreditsForAccountsSince(accountIds, monthStart);

        Map<String, Object> summary = new HashMap<>();
        summary.put("month", LocalDate.now().getMonth().name());
        summary.put("totalDebits", debits.toPlainString());
        summary.put("totalCredits", credits.toPlainString());
        summary.put("net", credits.subtract(debits).toPlainString());
        return summary;
    }

    private void enforceAccountAccess(Account account) {
        if (SecurityUtils.hasRole("ROLE_ADMIN") || SecurityUtils.hasRole("ROLE_MANAGER")
                || SecurityUtils.hasRole("ROLE_EMPLOYEE") || SecurityUtils.hasRole("ROLE_AUDITOR")) {
            return;
        }
        if (!SecurityUtils.hasRole("ROLE_CUSTOMER")) {
            throw new ForbiddenOperationException("Unauthorized access");
        }
        Customer customer = customerRepository.findByUserId(SecurityUtils.currentUserId())
                .orElseThrow(() -> new com.bankingsim.banking.exception.ResourceNotFoundException("Customer profile missing"));
        boolean owned = accountHolderRepository.findByAccountIdAndCustomerId(account.getId(), customer.getId()).isPresent();
        if (!owned) {
            throw new ForbiddenOperationException("Unauthorized account access");
        }
    }
}

