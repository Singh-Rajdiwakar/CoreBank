package com.bankingsim.banking.dto.account;

import com.bankingsim.banking.entity.enums.BeneficiaryType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class BeneficiaryCreateRequest {

    @NotNull
    private BeneficiaryType beneficiaryType;

    @NotBlank
    private String nickname;

    @NotBlank
    private String name;

    @NotBlank
    private String accountNumber;

    @NotBlank
    private String ifscCode;

    @NotBlank
    private String bankName;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal dailyLimit;
}
