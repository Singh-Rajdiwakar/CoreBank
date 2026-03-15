package com.bankingsim.banking.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class LoanDecisionRequest {
    @NotNull
    private Boolean approve;
    private BigDecimal annualInterestRate;
    @NotBlank
    private String remarks;
}
