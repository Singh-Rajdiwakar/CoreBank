package com.bankingsim.banking.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.dto.transaction.TransferRequest;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import com.bankingsim.banking.entity.enums.TransferMode;
import com.bankingsim.banking.fraud.FraudDetectionService;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.notification.TransactionAlertService;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.TransactionAuditRepository;
import com.bankingsim.banking.repository.UserRepository;
import com.bankingsim.banking.audit.AuditService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private AccountService accountService;
    @Mock
    private CustomerService customerService;
    @Mock
    private BeneficiaryService beneficiaryService;
    @Mock
    private AuthService authService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private BankTransactionRepository transactionRepository;
    @Mock
    private TransactionAuditRepository transactionAuditRepository;
    @Mock
    private FraudDetectionService fraudDetectionService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private TransactionAlertService transactionAlertService;
    @Mock
    private AuditService auditService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PricingService pricingService;

    private AppProperties appProperties;

    @InjectMocks
    private TransactionService transactionService;

    @BeforeEach
    void setup() {
        appProperties = new AppProperties();
        AppProperties.Limits limits = new AppProperties.Limits();
        limits.setHighValueTransferThreshold(BigDecimal.valueOf(100000));
        limits.setMakerCheckerThreshold(BigDecimal.valueOf(250000));
        limits.setTransferPerTransactionLimit(BigDecimal.valueOf(1000000));
        limits.setTransferDailyLimit(BigDecimal.valueOf(500000));
        limits.setTransferMonthlyLimit(BigDecimal.valueOf(3000000));
        appProperties.setLimits(limits);

        AppProperties.Fees fees = new AppProperties.Fees();
        fees.setInternalTransferFee(BigDecimal.valueOf(2.5));
        fees.setExternalTransferFee(BigDecimal.valueOf(7.5));
        appProperties.setFees(fees);

        transactionService = new TransactionService(
                accountService,
                customerService,
                beneficiaryService,
                authService,
                passwordEncoder,
                transactionRepository,
                transactionAuditRepository,
                fraudDetectionService,
                notificationService,
                transactionAlertService,
                auditService,
                userRepository,
                appProperties,
                pricingService
        );
    }

    @Test
    void transferShouldReturnExistingWhenIdempotencyKeyAlreadyUsed() {
        TransferRequest request = new TransferRequest();
        request.setSourceAccountNumber("42000000000001");
        request.setDestinationAccountNumber("42000000000002");
        request.setAmount(BigDecimal.valueOf(1000));
        request.setTransferMode(TransferMode.INTERNAL);

        BankTransaction existing = new BankTransaction();
        existing.setId(10L);
        existing.setReferenceNumber("TXN202601010001");
        existing.setTransactionType(TransactionType.INTERNAL_TRANSFER);
        existing.setStatus(TransactionStatus.SUCCESS);
        existing.setAmount(BigDecimal.valueOf(1000));
        existing.setCharges(BigDecimal.valueOf(2.5));
        existing.setTax(BigDecimal.ZERO);
        existing.setInitiatedAt(LocalDateTime.now());
        existing.setValueDate(LocalDate.now());

        when(transactionRepository.findByIdempotencyKey("idem-001")).thenReturn(Optional.of(existing));

        TransactionResponse response = transactionService.transfer(request, "idem-001");

        assertEquals("TXN202601010001", response.getReferenceNumber());
        assertEquals(TransactionStatus.SUCCESS, response.getStatus());
    }
}
