package com.bankingsim.banking.dto.account;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class CreateFdRequest {

    @NotBlank
    private String fundingAccountNumber;

    @NotNull
    @DecimalMin("1000.00")
    private BigDecimal principalAmount;

    @NotNull
    private Integer tenureMonths;

    private boolean autoRenew;

    @NotBlank
    private String payoutMode;
}
