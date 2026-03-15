package com.bankingsim.banking.dto.transaction;

import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TransactionResponse {
    private Long id;
    private String referenceNumber;
    private String sourceAccountNumber;
    private String destinationAccountNumber;
    private TransactionType transactionType;
    private TransactionStatus status;
    private BigDecimal amount;
    private BigDecimal charges;
    private BigDecimal tax;
    private String description;
    private LocalDateTime initiatedAt;
    private LocalDate valueDate;
    private Integer fraudScore;
    private boolean approvalRequired;
    private String failureReason;
}
