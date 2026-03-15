package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.account.WithdrawalRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/withdrawals")
@RequiredArgsConstructor
public class WithdrawalController {

    private final TransactionService transactionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN','CUSTOMER')")
    public ApiResponse<TransactionResponse> withdraw(@Valid @RequestBody WithdrawalRequest request) {
        return ApiResponse.ok(transactionService.withdraw(request), "Withdrawal initiated");
    }
}
