package com.bankingsim.banking.dto.account;

import com.bankingsim.banking.entity.enums.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class OpenAccountRequest {

    @NotNull
    private Long primaryCustomerId;

    private List<Long> secondaryCustomerIds;

    @NotNull
    private Long branchId;

    @NotNull
    private AccountType accountType;

    private String currency = "INR";

    @DecimalMin(value = "0.00")
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @DecimalMin(value = "0.00")
    private BigDecimal minimumBalance;

    @DecimalMin(value = "0.00")
    private BigDecimal interestRate;

    @DecimalMin(value = "0.00")
    private BigDecimal overdraftLimit;
}
