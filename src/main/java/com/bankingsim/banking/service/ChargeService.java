package com.bankingsim.banking.service;

import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.TransactionChannel;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import com.bankingsim.banking.notification.TransactionAlertService;
import com.bankingsim.banking.repository.AccountRepository;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.util.ReferenceGenerator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChargeService {

    private final AccountRepository accountRepository;
    private final AccountService accountService;
    private final PricingService pricingService;
    private final BankTransactionRepository transactionRepository;
    private final TransactionAlertService transactionAlertService;

    @Transactional
    public void applyMonthlyAccountCharges() {
        BigDecimal maintenance = pricingService.accountMaintenanceCharge();
        BigDecimal minBalancePenalty = pricingService.minBalancePenalty();

        for (Account account : accountRepository.findAll()) {
            if (account.getStatus() != AccountStatus.ACTIVE) {
                continue;
            }

            if (maintenance.compareTo(BigDecimal.ZERO) > 0) {
                applyCharge(account, maintenance, TransactionType.SERVICE_CHARGE_DEBIT, "Monthly account maintenance charge");
            }

            if (account.getMinimumBalance().compareTo(BigDecimal.ZERO) > 0
                    && account.getAvailableBalance().compareTo(account.getMinimumBalance()) < 0
                    && minBalancePenalty.compareTo(BigDecimal.ZERO) > 0) {
                applyCharge(account, minBalancePenalty, TransactionType.PENALTY_DEBIT, "Minimum balance penalty debit");
            }
        }
    }

    @Transactional
    public void applyDailyOverdraftInterest() {
        BigDecimal dailyPercent = pricingService.overdraftDailyInterestPercent();
        if (dailyPercent.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        for (Account account : accountRepository.findAll()) {
            if (account.getStatus() != AccountStatus.ACTIVE) {
                continue;
            }
            if (account.getBalance().compareTo(BigDecimal.ZERO) >= 0) {
                continue;
            }

            BigDecimal principal = account.getBalance().abs();
            BigDecimal interest = principal
                    .multiply(dailyPercent)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (interest.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            applyCharge(account, interest, TransactionType.PENALTY_DEBIT, "Daily overdraft interest debit");
        }
    }

    private void applyCharge(Account account, BigDecimal amount, TransactionType type, String remarks) {
        Account locked = accountService.getAccountForUpdate(account.getAccountNumber());
        BigDecimal before = locked.getAvailableBalance();

        try {
            accountService.debit(locked, amount);
            createChargeTransaction(locked, type, amount, before, before.subtract(amount), TransactionStatus.SUCCESS, null, remarks);
        } catch (RuntimeException ex) {
            createChargeTransaction(locked, type, amount, before, before, TransactionStatus.FAILED, ex.getMessage(), remarks);
        }
    }

    private void createChargeTransaction(Account account,
                                         TransactionType type,
                                         BigDecimal amount,
                                         BigDecimal before,
                                         BigDecimal after,
                                         TransactionStatus status,
                                         String failureReason,
                                         String remarks) {
        BankTransaction transaction = new BankTransaction();
        transaction.setReferenceNumber(ReferenceGenerator.transactionReference());
        transaction.setSourceAccount(account);
        transaction.setDestinationAccount(null);
        transaction.setTransactionType(type);
        transaction.setAmount(amount);
        transaction.setCharges(BigDecimal.ZERO);
        transaction.setTax(BigDecimal.ZERO);
        transaction.setDescription(remarks);
        transaction.setInitiatedBy(0L);
        transaction.setChannel(TransactionChannel.SYSTEM);
        transaction.setInitiatedAt(LocalDateTime.now());
        transaction.setValueDate(LocalDate.now());
        transaction.setStatus(status);
        transaction.setFailureReason(failureReason);
        transaction.setFraudScore(0);
        transaction.setBeforeBalance(before);
        transaction.setAfterBalance(after);
        BankTransaction saved = transactionRepository.save(transaction);
        transactionAlertService.notifyTransaction(saved);
    }
}
