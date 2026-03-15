package com.bankingsim.banking.dto.account;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CardStatusActionRequest {

    @NotBlank
    private String cardNumber;

    private String remarks;
}
