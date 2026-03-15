package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.account.CreateFdRequest;
import com.bankingsim.banking.dto.account.CreateRdRequest;
import com.bankingsim.banking.dto.account.FixedDepositResponse;
import com.bankingsim.banking.dto.account.RecurringDepositResponse;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.service.DepositProductService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deposit-products")
@RequiredArgsConstructor
public class DepositProductController {

    private final DepositProductService depositProductService;

    @PostMapping("/fd")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<FixedDepositResponse> createFd(@Valid @RequestBody CreateFdRequest request) {
        return ApiResponse.ok(depositProductService.createFd(request), "FD created");
    }

    @PatchMapping("/fd/{fdNumber}/premature-withdraw")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<FixedDepositResponse> prematureWithdraw(@PathVariable String fdNumber) {
        return ApiResponse.ok(depositProductService.prematureWithdraw(fdNumber), "FD prematurely withdrawn");
    }

    @GetMapping("/fd/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<FixedDepositResponse>> myFds() {
        return ApiResponse.ok(depositProductService.myFds());
    }

    @PostMapping("/rd")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<RecurringDepositResponse> createRd(@Valid @RequestBody CreateRdRequest request) {
        return ApiResponse.ok(depositProductService.createRd(request), "RD created");
    }

    @PatchMapping("/rd/{rdNumber}/installment")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<RecurringDepositResponse> payInstallment(@PathVariable String rdNumber) {
        return ApiResponse.ok(depositProductService.payRdInstallment(rdNumber), "RD installment processed");
    }

    @GetMapping("/rd/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<RecurringDepositResponse>> myRds() {
        return ApiResponse.ok(depositProductService.myRds());
    }
}
