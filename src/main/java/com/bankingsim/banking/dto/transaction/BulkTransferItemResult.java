package com.bankingsim.banking.dto.transaction;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BulkTransferItemResult {
    private Integer itemIndex;
    private String destinationAccountNumber;
    private BigDecimal amount;
    private String status;
    private Long transactionId;
    private String referenceNumber;
    private String errorMessage;
}
