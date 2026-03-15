package com.bankingsim.banking.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class BulkTransferItemRequest {

    @NotBlank
    private String destinationAccountNumber;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    private String remarks;
}
