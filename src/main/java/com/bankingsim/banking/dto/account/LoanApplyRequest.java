package com.bankingsim.banking.dto.account;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class LoanApplyRequest {

    @NotBlank
    private String disbursementAccountNumber;

    @NotBlank
    private String loanType;

    @NotNull
    @DecimalMin("10000.00")
    private BigDecimal principalAmount;

    @NotNull
    private Integer tenureMonths;
}
