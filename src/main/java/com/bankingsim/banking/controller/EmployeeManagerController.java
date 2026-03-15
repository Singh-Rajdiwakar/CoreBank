package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.admin.FraudCaseResponse;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.customer.CustomerResponse;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.fraud.FraudDetectionService;
import com.bankingsim.banking.service.EmployeeService;
import com.bankingsim.banking.service.TransactionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EmployeeManagerController {

    private final EmployeeService employeeService;
    private final FraudDetectionService fraudDetectionService;
    private final TransactionService transactionService;

    @GetMapping("/api/employee/customers/assigned")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<PageResponse<CustomerResponse>> assignedCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(employeeService.assignedBranchCustomers(page, size));
    }

    @GetMapping("/api/employee/fraud/cases")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<List<FraudCaseResponse>> fraudCases() {
        return ApiResponse.ok(fraudDetectionService.listCases());
    }

    @GetMapping("/api/manager/transfers/pending")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<List<TransactionResponse>> pendingTransfers() {
        return ApiResponse.ok(transactionService.pendingApprovals());
    }
}
