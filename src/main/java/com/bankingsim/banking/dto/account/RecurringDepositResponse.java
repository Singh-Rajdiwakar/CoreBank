package com.bankingsim.banking.dto.account;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecurringDepositResponse {
    private Long id;
    private String rdNumber;
    private BigDecimal monthlyInstallment;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private LocalDate openedOn;
    private LocalDate maturityDate;
    private BigDecimal totalPaid;
    private Integer missedInstallments;
    private String status;
}
