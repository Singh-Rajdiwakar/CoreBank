package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.account.EmiPaymentRequest;
import com.bankingsim.banking.dto.account.EmiScheduleResponse;
import com.bankingsim.banking.dto.account.LoanApplyRequest;
import com.bankingsim.banking.dto.account.LoanDecisionRequest;
import com.bankingsim.banking.dto.account.LoanResponse;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.service.LoanService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<LoanResponse> apply(@Valid @RequestBody LoanApplyRequest request) {
        return ApiResponse.ok(loanService.apply(request), "Loan application submitted");
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<LoanResponse> review(@PathVariable Long id, @Valid @RequestBody LoanDecisionRequest request) {
        return ApiResponse.ok(loanService.review(id, request), "Loan review completed");
    }

    @PatchMapping("/{id}/disburse")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<LoanResponse> disburse(@PathVariable Long id) {
        return ApiResponse.ok(loanService.disburse(id), "Loan disbursed");
    }

    @PostMapping("/emi/pay")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<LoanResponse> payEmi(@Valid @RequestBody EmiPaymentRequest request) {
        return ApiResponse.ok(loanService.payEmi(request), "EMI payment processed");
    }

    @PatchMapping("/{id}/foreclose")
    @PreAuthorize("hasAnyRole('CUSTOMER','MANAGER','ADMIN')")
    public ApiResponse<LoanResponse> foreclose(@PathVariable Long id) {
        return ApiResponse.ok(loanService.foreclose(id), "Loan foreclosed");
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<LoanResponse>> myLoans() {
        return ApiResponse.ok(loanService.myLoans());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<List<LoanResponse>> getAllLoans(@RequestParam(required = false) com.bankingsim.banking.entity.enums.LoanStatus status) {
        return ApiResponse.ok(loanService.getAllLoans(status));
    }

    @GetMapping("/{id}/emi-schedule")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<List<EmiScheduleResponse>> schedule(@PathVariable Long id) {
        return ApiResponse.ok(loanService.emiSchedule(id));
    }
}
