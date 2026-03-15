package com.bankingsim.banking.dto.transaction;

import com.bankingsim.banking.entity.enums.TransferMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class RecurringTransferRequest {

    @NotBlank
    private String sourceAccountNumber;

    private String destinationAccountNumber;

    private Long beneficiaryId;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @NotNull
    private TransferMode transferMode;

    @NotNull
    @Future
    private LocalDateTime startAt;

    @NotNull
    @Min(2)
    @Max(60)
    private Integer occurrences;

    @NotNull
    @Min(1)
    @Max(365)
    private Integer frequencyDays;

    private String remarks;
    private String transactionPin;
    private String otp;
}
