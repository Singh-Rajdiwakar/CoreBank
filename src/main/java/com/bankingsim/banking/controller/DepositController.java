package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.account.DepositRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deposits")
@RequiredArgsConstructor
public class DepositController {

    private final TransactionService transactionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN','CUSTOMER')")
    public ApiResponse<TransactionResponse> deposit(@Valid @RequestBody DepositRequest request) {
        return ApiResponse.ok(transactionService.deposit(request), "Deposit initiated");
    }

    @PatchMapping("/{reference}/clear")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<TransactionResponse> clearCheque(@PathVariable String reference) {
        return ApiResponse.ok(transactionService.clearChequeDeposit(reference), "Cheque deposit cleared");
    }
}
