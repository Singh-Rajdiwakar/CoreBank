package com.bankingsim.banking.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.transaction.BulkTransferItemRequest;
import com.bankingsim.banking.dto.transaction.BulkTransferRequest;
import com.bankingsim.banking.dto.transaction.BulkTransferResponse;
import com.bankingsim.banking.dto.transaction.RecurringTransferRequest;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import com.bankingsim.banking.entity.enums.TransferMode;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TransferBatchServiceTest {

    @Mock
    private TransactionService transactionService;

    private TransferBatchService transferBatchService;

    @BeforeEach
    void setUp() {
        AppProperties properties = new AppProperties();
        AppProperties.Limits limits = new AppProperties.Limits();
        limits.setHighValueTransferThreshold(BigDecimal.valueOf(100000));
        properties.setLimits(limits);
        transferBatchService = new TransferBatchService(transactionService, properties);
    }

    @Test
    void setupRecurringShouldCreateConfiguredOccurrences() {
        AtomicInteger counter = new AtomicInteger(1);
        when(transactionService.transfer(any(), anyString())).thenAnswer(invocation ->
                TransactionResponse.builder()
                        .id((long) counter.getAndIncrement())
                        .referenceNumber("TXN-" + counter.get())
                        .transactionType(TransactionType.SCHEDULED_TRANSFER)
                        .status(TransactionStatus.PENDING)
                        .amount(BigDecimal.valueOf(1000))
                        .valueDate(LocalDate.now())
                        .initiatedAt(LocalDateTime.now())
                        .build());

        RecurringTransferRequest request = new RecurringTransferRequest();
        request.setSourceAccountNumber("42000000000001");
        request.setDestinationAccountNumber("42000000000002");
        request.setAmount(BigDecimal.valueOf(1000));
        request.setTransferMode(TransferMode.INTERNAL);
        request.setStartAt(LocalDateTime.now().plusDays(1));
        request.setOccurrences(3);
        request.setFrequencyDays(30);

        List<TransactionResponse> responses = transferBatchService.setupRecurring(request, "idem-rec");

        assertEquals(3, responses.size());
        verify(transactionService, times(3)).transfer(any(), anyString());
    }

    @Test
    void setupRecurringShouldRejectHighValueAmount() {
        RecurringTransferRequest request = new RecurringTransferRequest();
        request.setSourceAccountNumber("42000000000001");
        request.setDestinationAccountNumber("42000000000002");
        request.setAmount(BigDecimal.valueOf(150000));
        request.setTransferMode(TransferMode.INTERNAL);
        request.setStartAt(LocalDateTime.now().plusDays(1));
        request.setOccurrences(2);
        request.setFrequencyDays(30);

        assertThrows(ForbiddenOperationException.class, () -> transferBatchService.setupRecurring(request, "idem-rec"));
    }

    @Test
    void processBulkShouldReturnMixedSuccessAndFailure() {
        when(transactionService.transfer(any(), anyString()))
                .thenReturn(TransactionResponse.builder()
                        .id(10L)
                        .referenceNumber("TXN-10")
                        .transactionType(TransactionType.BULK_SALARY_CREDIT)
                        .status(TransactionStatus.SUCCESS)
                        .amount(BigDecimal.valueOf(1000))
                        .valueDate(LocalDate.now())
                        .initiatedAt(LocalDateTime.now())
                        .build())
                .thenThrow(new ForbiddenOperationException("Destination account not active"));

        BulkTransferItemRequest item1 = new BulkTransferItemRequest();
        item1.setDestinationAccountNumber("42000000000002");
        item1.setAmount(BigDecimal.valueOf(1000));
        BulkTransferItemRequest item2 = new BulkTransferItemRequest();
        item2.setDestinationAccountNumber("42000000000003");
        item2.setAmount(BigDecimal.valueOf(2000));

        BulkTransferRequest request = new BulkTransferRequest();
        request.setSourceAccountNumber("42000000000001");
        request.setItems(List.of(item1, item2));

        BulkTransferResponse response = transferBatchService.processBulk(request, "idem-bulk");

        assertEquals(2, response.getRequestedCount());
        assertEquals(1, response.getSuccessCount());
        assertEquals(1, response.getFailedCount());
        assertEquals(new BigDecimal("3000"), response.getTotalRequestedAmount());
        assertEquals(new BigDecimal("1000"), response.getTotalSuccessfulAmount());
        verify(transactionService, times(2)).transfer(any(), anyString());
    }
}
