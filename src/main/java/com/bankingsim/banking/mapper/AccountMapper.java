package com.bankingsim.banking.mapper;

import com.bankingsim.banking.dto.account.AccountResponse;
import com.bankingsim.banking.entity.Account;

public final class AccountMapper {

    private AccountMapper() {
    }

    public static AccountResponse toResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .status(account.getStatus())
                .currency(account.getCurrency())
                .balance(account.getBalance())
                .availableBalance(account.getAvailableBalance())
                .holdAmount(account.getHoldAmount())
                .minimumBalance(account.getMinimumBalance())
                .overdraftLimit(account.getOverdraftLimit())
                .openedOn(account.getOpenedOn())
                .branchId(account.getBranch().getId())
                .build();
    }
}
