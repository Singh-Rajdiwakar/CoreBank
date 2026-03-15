package com.bankingsim.banking.dto.account;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AccountActionRequest {

    @NotBlank
    private String remarks;
}
