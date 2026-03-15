package com.bankingsim.banking.dto.transaction;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class BulkTransferRequest {

    @NotBlank
    private String sourceAccountNumber;

    @Valid
    @NotEmpty
    private List<BulkTransferItemRequest> items;

    private String transactionPin;
    private String otp;
    private String remarks;
}
