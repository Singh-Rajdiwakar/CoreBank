package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.transaction.SpendingOverviewResponse;
import com.bankingsim.banking.reporting.ReportingService;
import java.time.LocalDate;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/me/monthly-summary")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<Map<String, Object>> myMonthlySummary() {
        return ApiResponse.ok(reportingService.monthlySummaryForCustomer());
    }

    @GetMapping("/accounts/spending-overview")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<SpendingOverviewResponse> spendingOverview(
            @RequestParam String accountNumber,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ApiResponse.ok(reportingService.spendingOverview(accountNumber, from, to));
    }
}
