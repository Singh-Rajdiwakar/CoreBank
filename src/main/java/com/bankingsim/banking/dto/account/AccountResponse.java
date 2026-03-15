package com.bankingsim.banking.dto.account;

import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.AccountType;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private AccountType accountType;
    private AccountStatus status;
    private String currency;
    private BigDecimal balance;
    private BigDecimal availableBalance;
    private BigDecimal holdAmount;
    private BigDecimal minimumBalance;
    private BigDecimal overdraftLimit;
    private LocalDate openedOn;
    private Long branchId;
}
