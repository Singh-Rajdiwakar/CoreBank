package com.bankingsim.banking.service;

import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.AccountHolder;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.notification.NotificationTemplateKey;
import com.bankingsim.banking.notification.TransactionAlertService;
import com.bankingsim.banking.repository.AccountHolderRepository;
import com.bankingsim.banking.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TransactionAlertServiceTest {

    @Mock
    private AccountHolderRepository accountHolderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationService notificationService;

    private TransactionAlertService transactionAlertService;

    @BeforeEach
    void setUp() {
        transactionAlertService = new TransactionAlertService(accountHolderRepository, userRepository, notificationService);
    }

    @Test
    void notifyTransactionShouldPublishDebitCreditAndLowBalanceAlerts() {
        Account source = account(1L, "42000000000001", BigDecimal.valueOf(5000));
        Account destination = account(2L, "42000000000002", BigDecimal.ZERO);

        BankTransaction transaction = new BankTransaction();
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setTransactionType(TransactionType.INTERNAL_TRANSFER);
        transaction.setReferenceNumber("TXN10001");
        transaction.setAmount(BigDecimal.valueOf(1500));
        transaction.setCharges(BigDecimal.valueOf(2.5));
        transaction.setTax(BigDecimal.valueOf(0.45));
        transaction.setSourceAccount(source);
        transaction.setDestinationAccount(destination);
        transaction.setAfterBalance(BigDecimal.valueOf(3000));

        when(accountHolderRepository.findByAccountId(1L)).thenReturn(List.of(holderUser(100L)));
        when(accountHolderRepository.findByAccountId(2L)).thenReturn(List.of(holderUser(200L)));

        transactionAlertService.notifyTransaction(transaction);

        verify(notificationService, atLeastOnce()).publishTemplate(
                eq(100L),
                eq(NotificationType.TRANSACTION),
                eq(NotificationTemplateKey.TRANSACTION_DEBIT),
                anyMap()
        );
        verify(notificationService, atLeastOnce()).publishTemplate(
                eq(200L),
                eq(NotificationType.TRANSACTION),
                eq(NotificationTemplateKey.TRANSACTION_CREDIT),
                anyMap()
        );
        verify(notificationService, atLeastOnce()).publishTemplate(
                eq(100L),
                eq(NotificationType.LOW_BALANCE),
                eq(NotificationTemplateKey.LOW_BALANCE),
                anyMap()
        );
    }

    @Test
    void notifyTransactionShouldAvoidDuplicatePendingAlertsForSameUser() {
        Account source = account(3L, "42000000000003", BigDecimal.ZERO);
        BankTransaction transaction = new BankTransaction();
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setReferenceNumber("TXN20001");
        transaction.setTransactionType(TransactionType.NEFT);
        transaction.setAmount(BigDecimal.valueOf(5000));
        transaction.setInitiatedBy(300L);
        transaction.setSourceAccount(source);

        when(userRepository.existsById(300L)).thenReturn(true);
        when(accountHolderRepository.findByAccountId(3L)).thenReturn(List.of(holderUser(300L)));

        transactionAlertService.notifyTransaction(transaction);

        verify(notificationService, times(1)).publishTemplate(
                eq(300L),
                eq(NotificationType.TRANSACTION),
                eq(NotificationTemplateKey.TRANSACTION_PENDING),
                anyMap()
        );
    }

    private Account account(Long id, String accountNumber, BigDecimal minimumBalance) {
        Account account = new Account();
        account.setId(id);
        account.setAccountNumber(accountNumber);
        account.setMinimumBalance(minimumBalance);
        return account;
    }

    private AccountHolder holderUser(Long userId) {
        User user = new User();
        user.setId(userId);
        Customer customer = new Customer();
        customer.setUser(user);
        AccountHolder holder = new AccountHolder();
        holder.setCustomer(customer);
        return holder;
    }
}
