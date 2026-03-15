package com.bankingsim.banking.dto.account;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateRdRequest {

    @NotBlank
    private String fundingAccountNumber;

    @NotNull
    @DecimalMin("500.00")
    private BigDecimal monthlyInstallment;

    @NotNull
    private Integer tenureMonths;
}
