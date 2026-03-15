package com.bankingsim.banking.dto.admin;

import com.bankingsim.banking.entity.enums.FraudCaseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FraudReviewRequest {
    @NotNull
    private FraudCaseStatus status;
    @NotBlank
    private String notes;
}
