package com.bankingsim.banking.dto.account;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FixedDepositResponse {
    private Long id;
    private String fdNumber;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private LocalDate openedOn;
    private LocalDate maturityDate;
    private BigDecimal maturityAmount;
    private boolean autoRenew;
    private String payoutMode;
    private String status;
    private String certificateNumber;
}
