package com.bankingsim.banking.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.dispute.DisputeCreateRequest;
import com.bankingsim.banking.dto.dispute.DisputeEvidenceRequest;
import com.bankingsim.banking.dto.dispute.DisputeResponse;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.DisputeCase;
import com.bankingsim.banking.entity.DisputeEvidence;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.DisputeCategory;
import com.bankingsim.banking.entity.enums.DisputeLiabilityTier;
import com.bankingsim.banking.entity.enums.DisputePriority;
import com.bankingsim.banking.entity.enums.DisputeReportedChannel;
import com.bankingsim.banking.entity.enums.DisputeStatus;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.exception.DuplicateResourceException;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.DisputeCaseRepository;
import com.bankingsim.banking.repository.DisputeEvidenceRepository;
import com.bankingsim.banking.repository.UserRepository;
import com.bankingsim.banking.security.CustomUserPrincipal;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock
    private DisputeCaseRepository disputeCaseRepository;
    @Mock
    private BankTransactionRepository transactionRepository;
    @Mock
    private CustomerService customerService;
    @Mock
    private AccountService accountService;
    @Mock
    private DisputeEvidenceRepository disputeEvidenceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditService auditService;

    private AppProperties appProperties;

    @InjectMocks
    private DisputeService disputeService;

    @BeforeEach
    void setUp() {
        appProperties = new AppProperties();
        AppProperties.Disputes disputes = new AppProperties.Disputes();
        disputes.setRaiseWindowDays(180);
        disputes.setZeroLiabilityDays(3);
        disputes.setLimitedLiabilityDays(7);
        disputes.setProvisionalCreditDays(10);
        disputes.setResolutionSlaDays(90);
        appProperties.setDisputes(disputes);

        disputeService = new DisputeService(
                disputeCaseRepository,
                transactionRepository,
                customerService,
                accountService,
                disputeEvidenceRepository,
                userRepository,
                auditLogService,
                notificationService,
                auditService,
                appProperties
        );

        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(
                        new CustomUserPrincipal(100L, "customer1", "x", true, true, java.util.Set.of("ROLE_CUSTOMER")),
                        null,
                        "ROLE_CUSTOMER")
        );
    }

    @Test
    void createShouldAssignZeroLiabilityWhenReportedWithinThreeDays() {
        Customer customer = customer(1L, 100L);
        BankTransaction transaction = transaction(11L, 100L, LocalDateTime.now().minusDays(1));

        DisputeCreateRequest request = new DisputeCreateRequest();
        request.setTransactionId(11L);
        request.setCategory(DisputeCategory.UNAUTHORIZED_TRANSACTION);
        request.setReportedChannel(DisputeReportedChannel.MOBILE_APP);
        request.setPriority(DisputePriority.HIGH);
        request.setDescription("Unauthorized debit noticed");
        request.setEvidenceReference("doc://evidence-1");

        when(customerService.getCustomerByUserId(100L)).thenReturn(customer);
        when(transactionRepository.findById(11L)).thenReturn(Optional.of(transaction));
        when(disputeCaseRepository.existsActiveByCustomerAndTransaction(eq(1L), eq(11L), any())).thenReturn(false);
        when(disputeCaseRepository.findByCaseNumber(any())).thenReturn(Optional.empty());
        when(disputeCaseRepository.save(any(DisputeCase.class))).thenAnswer(invocation -> {
            DisputeCase dispute = invocation.getArgument(0);
            dispute.setId(901L);
            return dispute;
        });

        DisputeResponse response = disputeService.create(request);

        assertEquals(DisputeLiabilityTier.ZERO, response.getLiabilityTier());
        assertEquals(DisputeStatus.OPEN, response.getStatus());
        assertEquals(DisputePriority.HIGH, response.getPriority());
        assertEquals(11L, response.getTransactionId());
        verify(notificationService).publish(eq(100L), eq(NotificationType.DISPUTE), any(), any());
    }

    @Test
    void createShouldRejectDuplicateActiveDisputeForSameTransaction() {
        Customer customer = customer(2L, 101L);
        BankTransaction transaction = transaction(12L, 101L, LocalDateTime.now().minusDays(2));

        DisputeCreateRequest request = new DisputeCreateRequest();
        request.setTransactionId(12L);
        request.setCategory(DisputeCategory.FRAUD);
        request.setReportedChannel(DisputeReportedChannel.MOBILE_APP);
        request.setDescription("Duplicate dispute");

        when(customerService.getCustomerByUserId(100L)).thenReturn(customer);
        when(transactionRepository.findById(12L)).thenReturn(Optional.of(transaction));
        when(disputeCaseRepository.existsActiveByCustomerAndTransaction(eq(2L), eq(12L), any())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> disputeService.create(request));
    }

    @Test
    void uploadEvidenceShouldMoveEvidenceRequiredCaseToUnderReview() {
        Customer customer = customer(1L, 100L);
        DisputeCase dispute = new DisputeCase();
        dispute.setId(99L);
        dispute.setCustomer(customer);
        dispute.setStatus(DisputeStatus.EVIDENCE_REQUIRED);
        dispute.setCaseNumber("DSP001");

        DisputeEvidenceRequest request = new DisputeEvidenceRequest();
        request.setFileName("proof.png");
        request.setFileUrl("storage://disputes/99/proof.png");
        request.setFileType("image/png");
        request.setNotes("Screenshot");

        when(disputeCaseRepository.findById(99L)).thenReturn(Optional.of(dispute));
        when(customerService.getCustomerByUserId(100L)).thenReturn(customer);
        when(disputeCaseRepository.save(any(DisputeCase.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(disputeEvidenceRepository.save(any(DisputeEvidence.class))).thenAnswer(invocation -> {
            DisputeEvidence evidence = invocation.getArgument(0);
            evidence.setId(500L);
            return evidence;
        });

        var response = disputeService.uploadEvidence(99L, request);

        assertEquals(500L, response.getId());
        assertEquals(99L, response.getDisputeId());
        assertEquals("proof.png", response.getFileName());
        assertEquals(DisputeStatus.UNDER_REVIEW, dispute.getStatus());
        verify(auditService).log(eq(100L), eq("DISPUTE_EVIDENCE_UPLOAD"), eq("DISPUTE_CASE"), eq("99"), any(), any(), eq(true), any());
    }

    private Customer customer(Long customerId, Long userId) {
        User user = new User();
        user.setId(userId);
        Customer customer = new Customer();
        customer.setId(customerId);
        customer.setUser(user);
        return customer;
    }

    private BankTransaction transaction(Long txnId, Long initiatedBy, LocalDateTime initiatedAt) {
        BankTransaction tx = new BankTransaction();
        tx.setId(txnId);
        tx.setReferenceNumber("TXN-" + txnId);
        tx.setInitiatedBy(initiatedBy);
        tx.setInitiatedAt(initiatedAt);
        tx.setAmount(BigDecimal.valueOf(1000));
        tx.setCharges(BigDecimal.valueOf(5));
        tx.setTax(BigDecimal.ONE);
        tx.setSourceAccount(new Account());
        return tx;
    }
}
