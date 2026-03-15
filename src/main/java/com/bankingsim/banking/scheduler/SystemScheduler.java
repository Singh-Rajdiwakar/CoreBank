package com.bankingsim.banking.scheduler;

import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.AccountType;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.entity.enums.TransactionChannel;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.repository.AccountHolderRepository;
import com.bankingsim.banking.repository.AccountRepository;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.CustomerRepository;
import com.bankingsim.banking.service.AccountService;
import com.bankingsim.banking.service.BeneficiaryService;
import com.bankingsim.banking.service.ChargeService;
import com.bankingsim.banking.service.DepositProductService;
import com.bankingsim.banking.service.DisputeService;
import com.bankingsim.banking.service.LoanService;
import com.bankingsim.banking.service.TransactionService;
import com.bankingsim.banking.notification.TransactionAlertService;
import com.bankingsim.banking.util.ReferenceGenerator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SystemScheduler {

    private final AccountService accountService;
    private final BeneficiaryService beneficiaryService;
    private final TransactionService transactionService;
    private final LoanService loanService;
    private final DepositProductService depositProductService;
    private final DisputeService disputeService;
    private final ChargeService chargeService;
    private final AccountRepository accountRepository;
    private final AccountHolderRepository accountHolderRepository;
    private final BankTransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final NotificationService notificationService;
    private final TransactionAlertService transactionAlertService;

    @Scheduled(cron = "0 */5 * * * *")
    public void processScheduledTransfers() {
        transactionService.processScheduledTransfers();
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void activateBeneficiaries() {
        beneficiaryService.activateCooledBeneficiaries();
    }

    @Scheduled(cron = "0 30 2 * * *")
    public void markDormantAccounts() {
        accountService.markDormantAccounts();
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void processLoansAndDeposits() {
        loanService.markMissedEmis();
        depositProductService.processFdMaturity();
        depositProductService.processRdMaturity();
    }

    @Scheduled(cron = "0 0 4 1 * *")
    public void postSavingsInterestMonthly() {
        var accounts = accountRepository.findByAccountType(AccountType.SAVINGS);
        for (Account account : accounts) {
            if (account.getStatus() != AccountStatus.ACTIVE) {
                continue;
            }

            BigDecimal monthlyInterest = account.getBalance()
                    .multiply(account.getInterestRate())
                    .divide(BigDecimal.valueOf(1200), 2, RoundingMode.HALF_UP);

            if (monthlyInterest.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            accountService.credit(account, monthlyInterest);
            BankTransaction tx = new BankTransaction();
            tx.setReferenceNumber(ReferenceGenerator.transactionReference());
            tx.setSourceAccount(null);
            tx.setDestinationAccount(account);
            tx.setTransactionType(TransactionType.INTEREST_CREDIT);
            tx.setAmount(monthlyInterest);
            tx.setCharges(BigDecimal.ZERO);
            tx.setTax(BigDecimal.ZERO);
            tx.setDescription("Monthly savings interest credit");
            tx.setInitiatedBy(0L);
            tx.setChannel(TransactionChannel.SYSTEM);
            tx.setInitiatedAt(LocalDateTime.now());
            tx.setValueDate(LocalDate.now());
            tx.setStatus(TransactionStatus.SUCCESS);
            tx.setFraudScore(0);
            BankTransaction saved = transactionRepository.save(tx);
            transactionAlertService.notifyTransaction(saved);
        }
        log.info("Savings interest posting completed");
    }

    @Scheduled(cron = "0 15 4 1 * *")
    public void applyMonthlyAccountCharges() {
        chargeService.applyMonthlyAccountCharges();
        log.info("Monthly account charge cycle completed");
    }

    @Scheduled(cron = "0 30 4 * * *")
    public void applyDailyOverdraftInterest() {
        chargeService.applyDailyOverdraftInterest();
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void lowBalanceAlerts() {
        for (Account account : accountRepository.findAll()) {
            if (account.getStatus() != AccountStatus.ACTIVE) {
                continue;
            }
            if (account.getAvailableBalance().compareTo(account.getMinimumBalance()) < 0) {
                Customer customer = accountHolderRepository.findByAccountId(account.getId()).stream()
                        .filter(holder -> holder.isPrimaryHolder())
                        .map(holder -> holder.getCustomer())
                        .findFirst()
                        .orElse(null);
                if (customer != null) {
                    notificationService.publish(customer.getUser().getId(), NotificationType.LOW_BALANCE,
                            "Low Balance Alert",
                            "Account " + account.getAccountNumber() + " is below minimum balance.");
                }
            }
        }
    }

    @Scheduled(cron = "0 0 10 1 * *")
    public void monthlyStatementsNotification() {
        customerRepository.findAll().forEach(customer ->
                notificationService.publish(customer.getUser().getId(), NotificationType.STATEMENT,
                        "Monthly Statement Ready",
                        "Your monthly statement is now available."));
    }

    @Scheduled(cron = "0 */1 * * * *")
    public void retryNotificationDispatches() {
        int processed = notificationService.retryPendingNotifications();
        if (processed > 0) {
            log.info("Notification retry cycle processed {} notifications", processed);
        }
    }

    @Scheduled(cron = "0 45 3 * * *")
    public void cleanupOldSentNotifications() {
        long deleted = notificationService.cleanupOldSentNotifications();
        if (deleted > 0) {
            log.info("Deleted {} old sent notifications", deleted);
        }
    }

    @Scheduled(cron = "0 0 */1 * * *")
    public void autoEscalateOverdueDisputes() {
        int escalated = disputeService.autoEscalateOverdueCases();
        if (escalated > 0) {
            log.info("Auto escalated {} overdue disputes", escalated);
        }
    }
}
