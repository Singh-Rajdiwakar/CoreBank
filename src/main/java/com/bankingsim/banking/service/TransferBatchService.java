package com.bankingsim.banking.service;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.transaction.BulkTransferItemRequest;
import com.bankingsim.banking.dto.transaction.BulkTransferItemResult;
import com.bankingsim.banking.dto.transaction.BulkTransferRequest;
import com.bankingsim.banking.dto.transaction.BulkTransferResponse;
import com.bankingsim.banking.dto.transaction.RecurringTransferRequest;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.dto.transaction.TransferRequest;
import com.bankingsim.banking.entity.enums.TransferMode;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.util.ReferenceGenerator;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransferBatchService {

    private static final EnumSet<TransferMode> RECURRING_ALLOWED_MODES = EnumSet.of(
            TransferMode.SELF,
            TransferMode.INTERNAL,
            TransferMode.BENEFICIARY,
            TransferMode.EXTERNAL,
            TransferMode.NEFT,
            TransferMode.IMPS,
            TransferMode.RTGS,
            TransferMode.UPI
    );

    private final TransactionService transactionService;
    private final AppProperties appProperties;

    public List<TransactionResponse> setupRecurring(RecurringTransferRequest request, String idempotencyKey) {
        if (!RECURRING_ALLOWED_MODES.contains(request.getTransferMode())) {
            throw new ForbiddenOperationException("Unsupported transfer mode for recurring setup");
        }
        if (request.getAmount().compareTo(appProperties.getLimits().getHighValueTransferThreshold()) >= 0) {
            throw new ForbiddenOperationException("Recurring setup supports amounts below high-value OTP threshold");
        }

        List<TransactionResponse> responses = new ArrayList<>();
        for (int i = 0; i < request.getOccurrences(); i++) {
            TransferRequest transfer = new TransferRequest();
            transfer.setSourceAccountNumber(request.getSourceAccountNumber());
            transfer.setDestinationAccountNumber(request.getDestinationAccountNumber());
            transfer.setBeneficiaryId(request.getBeneficiaryId());
            transfer.setAmount(request.getAmount());
            transfer.setTransferMode(request.getTransferMode());
            transfer.setRemarks(request.getRemarks());
            transfer.setTransactionPin(request.getTransactionPin());
            transfer.setOtp(request.getOtp());
            transfer.setScheduledFor(request.getStartAt().plusDays((long) i * request.getFrequencyDays()));

            String rowIdempotencyKey = idempotencyKey + "-R" + (i + 1);
            responses.add(transactionService.transfer(transfer, rowIdempotencyKey));
        }
        return responses;
    }

    public BulkTransferResponse processBulk(BulkTransferRequest request, String idempotencyKey) {
        if (request.getItems().size() > 500) {
            throw new ForbiddenOperationException("Bulk transfer supports up to 500 items per request");
        }

        BigDecimal totalRequested = request.getItems().stream()
                .map(BulkTransferItemRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<BulkTransferItemResult> results = new ArrayList<>();
        int successCount = 0;
        BigDecimal successAmount = BigDecimal.ZERO;

        for (int i = 0; i < request.getItems().size(); i++) {
            BulkTransferItemRequest item = request.getItems().get(i);

            if (item.getAmount().compareTo(appProperties.getLimits().getHighValueTransferThreshold()) >= 0) {
                results.add(BulkTransferItemResult.builder()
                        .itemIndex(i + 1)
                        .destinationAccountNumber(item.getDestinationAccountNumber())
                        .amount(item.getAmount())
                        .status("FAILED")
                        .errorMessage("Item amount exceeds allowed high-value threshold for bulk simulation")
                        .build());
                continue;
            }

            try {
                TransferRequest transfer = new TransferRequest();
                transfer.setSourceAccountNumber(request.getSourceAccountNumber());
                transfer.setDestinationAccountNumber(item.getDestinationAccountNumber());
                transfer.setAmount(item.getAmount());
                transfer.setTransferMode(TransferMode.BULK);
                transfer.setRemarks(item.getRemarks() == null ? request.getRemarks() : item.getRemarks());
                transfer.setTransactionPin(request.getTransactionPin());
                transfer.setOtp(request.getOtp());

                TransactionResponse response = transactionService.transfer(transfer, idempotencyKey + "-B" + (i + 1));
                successCount++;
                successAmount = successAmount.add(item.getAmount());

                results.add(BulkTransferItemResult.builder()
                        .itemIndex(i + 1)
                        .destinationAccountNumber(item.getDestinationAccountNumber())
                        .amount(item.getAmount())
                        .status("SUCCESS")
                        .transactionId(response.getId())
                        .referenceNumber(response.getReferenceNumber())
                        .build());
            } catch (RuntimeException ex) {
                results.add(BulkTransferItemResult.builder()
                        .itemIndex(i + 1)
                        .destinationAccountNumber(item.getDestinationAccountNumber())
                        .amount(item.getAmount())
                        .status("FAILED")
                        .errorMessage(ex.getMessage())
                        .build());
            }
        }

        return BulkTransferResponse.builder()
                .batchReference("BATCH-" + ReferenceGenerator.randomToken().substring(0, 12))
                .requestedCount(request.getItems().size())
                .successCount(successCount)
                .failedCount(request.getItems().size() - successCount)
                .totalRequestedAmount(totalRequested)
                .totalSuccessfulAmount(successAmount)
                .items(results)
                .build();
    }
}
