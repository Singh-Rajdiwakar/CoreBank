package com.bankingsim.banking.service;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.CustomerStatus;
import com.bankingsim.banking.entity.enums.RiskProfile;
import com.bankingsim.banking.fraud.FraudDetectionService;
import com.bankingsim.banking.fraud.FraudEvaluationResult;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.FraudAlertRepository;
import com.bankingsim.banking.repository.LoginAttemptRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FraudDetectionServiceTest {

    @Mock
    private BankTransactionRepository transactionRepository;
    @Mock
    private FraudAlertRepository fraudAlertRepository;
    @Mock
    private LoginAttemptRepository loginAttemptRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditService auditService;

    private AppProperties appProperties;

    @InjectMocks
    private FraudDetectionService fraudDetectionService;

    @BeforeEach
    void setUp() {
        appProperties = new AppProperties();
        AppProperties.Limits limits = new AppProperties.Limits();
        limits.setHighValueTransferThreshold(BigDecimal.valueOf(100000));
        limits.setAutoBlockFraudScore(85);
        appProperties.setLimits(limits);

        fraudDetectionService = new FraudDetectionService(
                appProperties,
                transactionRepository,
                fraudAlertRepository,
                loginAttemptRepository,
                notificationService,
                auditService
        );
    }

    @Test
    void evaluateShouldFlagHighRiskHighValueTransaction() {
        Customer customer = new Customer();
        customer.setStatus(CustomerStatus.BLACKLISTED);
        customer.setRiskProfile(RiskProfile.HIGH);
        User user = new User();
        user.setId(11L);
        customer.setUser(user);

        Account account = new Account();
        account.setStatus(AccountStatus.BLOCKED);

        when(transactionRepository.countTransactionsByInitiatedByAndInitiatedAtAfter(
                org.mockito.ArgumentMatchers.eq(11L),
                org.mockito.ArgumentMatchers.any(LocalDateTime.class)
        )).thenReturn(10L);
        when(transactionRepository.averageSuccessfulAmountByUserSince(
                org.mockito.ArgumentMatchers.eq(11L),
                org.mockito.ArgumentMatchers.any(LocalDateTime.class)
        )).thenReturn(BigDecimal.valueOf(1000));

        FraudEvaluationResult result = fraudDetectionService.evaluate(
                customer,
                account,
                BigDecimal.valueOf(500000),
                true,
                "IP mismatch"
        );

        assertTrue(result.score() >= 85);
        assertTrue(result.block());
        assertTrue(result.reviewRequired());
    }
}
