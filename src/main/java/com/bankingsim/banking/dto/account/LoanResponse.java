package com.bankingsim.banking.dto.account;

import com.bankingsim.banking.entity.enums.LoanStatus;
import com.bankingsim.banking.entity.enums.LoanType;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoanResponse {
    private Long id;
    private LoanType loanType;
    private LoanStatus status;
    private BigDecimal principalAmount;
    private BigDecimal annualInterestRate;
    private Integer tenureMonths;
    private BigDecimal emiAmount;
    private BigDecimal outstandingPrincipal;
    private Integer creditScore;
    private Integer riskScore;
}
