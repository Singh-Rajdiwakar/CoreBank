package com.bankingsim.banking.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class FeeRuleRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String description;
    @NotNull
    private BigDecimal amount;
    private BigDecimal percentage = BigDecimal.ZERO;
    private boolean active = true;
}
