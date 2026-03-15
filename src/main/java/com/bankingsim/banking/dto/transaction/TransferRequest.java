package com.bankingsim.banking.dto.transaction;

import com.bankingsim.banking.entity.enums.TransferMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TransferRequest {

    @NotBlank
    private String sourceAccountNumber;

    private String destinationAccountNumber;

    private Long beneficiaryId;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @NotNull
    private TransferMode transferMode;

    private String remarks;
    private String transactionPin;
    private String otp;
    private LocalDateTime scheduledFor;
}
