package com.bankingsim.banking.dto.transaction;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BulkTransferResponse {
    private String batchReference;
    private int requestedCount;
    private int successCount;
    private int failedCount;
    private BigDecimal totalRequestedAmount;
    private BigDecimal totalSuccessfulAmount;
    private List<BulkTransferItemResult> items;
}
