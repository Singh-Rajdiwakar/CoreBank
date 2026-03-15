package com.bankingsim.banking.dto.transaction;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApproveTransactionRequest {

    @NotBlank
    private String remarks;
}
