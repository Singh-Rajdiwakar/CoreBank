package com.bankingsim.banking.dto.account;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class EmiPaymentRequest {

    @NotNull
    private Long scheduleId;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal amount;
}
