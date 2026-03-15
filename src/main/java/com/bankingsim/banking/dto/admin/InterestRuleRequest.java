package com.bankingsim.banking.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class InterestRuleRequest {
    @NotBlank
    private String productType;
    @NotNull
    private BigDecimal annualRate;
    private boolean active = true;
}
