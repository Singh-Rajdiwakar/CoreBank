package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.admin.BranchPerformanceResponse;
import com.bankingsim.banking.dto.admin.DashboardSummaryResponse;
import com.bankingsim.banking.dto.admin.FeeRuleRequest;
import com.bankingsim.banking.dto.admin.InterestRuleRequest;
import com.bankingsim.banking.dto.admin.RemarkRequest;
import com.bankingsim.banking.dto.admin.SystemConfigRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.entity.FeeRule;
import com.bankingsim.banking.entity.InterestRule;
import com.bankingsim.banking.entity.SystemConfig;
import com.bankingsim.banking.reporting.ReportingService;
import com.bankingsim.banking.service.AdminService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReportingService reportingService;

    @PostMapping("/config/fees")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FeeRule> saveFeeRule(@Valid @RequestBody FeeRuleRequest request) {
        return ApiResponse.ok(adminService.saveFeeRule(request), "Fee rule saved");
    }

    @PostMapping("/config/interests")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InterestRule> saveInterestRule(@Valid @RequestBody InterestRuleRequest request) {
        return ApiResponse.ok(adminService.saveInterestRule(request), "Interest rule saved");
    }

    @GetMapping("/config/fees")
    @PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
    public ApiResponse<List<FeeRule>> listFeeRules() {
        return ApiResponse.ok(adminService.listFeeRules());
    }

    @GetMapping("/config/interests")
    @PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
    public ApiResponse<List<InterestRule>> listInterestRules() {
        return ApiResponse.ok(adminService.listInterestRules());
    }

    @PostMapping("/config/system")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SystemConfig> upsertConfig(@Valid @RequestBody SystemConfigRequest request) {
        return ApiResponse.ok(adminService.upsertConfig(request.getKey(), request.getValue(), request.getDescription()),
                "System config updated");
    }

    @GetMapping("/config/system")
    @PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
    public ApiResponse<Map<String, String>> allConfigs() {
        return ApiResponse.ok(adminService.allConfigs());
    }

    @PatchMapping("/customers/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> blockCustomer(@PathVariable Long id, @Valid @RequestBody RemarkRequest request) {
        adminService.blockCustomer(id, request.getRemarks());
        return ApiResponse.ok(null, "Customer blocked");
    }

    @PatchMapping("/customers/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> unblockCustomer(@PathVariable Long id, @Valid @RequestBody RemarkRequest request) {
        adminService.unblockCustomer(id, request.getRemarks());
        return ApiResponse.ok(null, "Customer unblocked");
    }

    @PatchMapping("/users/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> unlockUser(@PathVariable Long id) {
        adminService.unlockUser(id);
        return ApiResponse.ok(null, "User unlocked");
    }

    @GetMapping("/monitoring")
    @PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
    public ApiResponse<Map<String, Object>> monitoring() {
        return ApiResponse.ok(adminService.monitoring());
    }

    @GetMapping("/reports/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<DashboardSummaryResponse> dashboard() {
        return ApiResponse.ok(reportingService.dashboardSummary());
    }

    @GetMapping("/reports/branch-performance")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<List<BranchPerformanceResponse>> branchPerformance() {
        return ApiResponse.ok(reportingService.branchPerformance());
    }

    @GetMapping("/reports/high-value-transactions")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<List<TransactionResponse>> highValue(
            @RequestParam(defaultValue = "100000") BigDecimal threshold,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.ok(reportingService.highValueTransactions(threshold, limit));
    }

    @GetMapping("/reports/loan-portfolio")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<Map<String, Object>> loanPortfolio() {
        return ApiResponse.ok(reportingService.loanPortfolioSummary());
    }

    @GetMapping("/reports/revenue")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<Map<String, String>> revenue() {
        return ApiResponse.ok(reportingService.revenueFromCharges());
    }

    @GetMapping("/reports/daily-volume")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<Map<String, Object>> dailyVolume(@RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        return ApiResponse.ok(reportingService.dailyTransactionVolume(date));
    }

    @GetMapping("/reports/npa-summary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<Map<String, Object>> npaSummary() {
        return ApiResponse.ok(reportingService.npaStyleSummary());
    }

    @GetMapping("/reports/reconciliation")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<Map<String, Object>> reconciliation(
            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
            java.time.LocalDate date) {
        return ApiResponse.ok(reportingService.reconciliationSummary(date));
    }
}
