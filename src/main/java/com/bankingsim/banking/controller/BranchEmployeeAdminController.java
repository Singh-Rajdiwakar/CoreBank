package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.admin.BranchResponse;
import com.bankingsim.banking.dto.admin.CreateBranchRequest;
import com.bankingsim.banking.dto.admin.CreateEmployeeRequest;
import com.bankingsim.banking.dto.admin.EmployeeResponse;
import com.bankingsim.banking.dto.admin.UpdateBranchRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.entity.enums.BranchStatus;
import com.bankingsim.banking.entity.enums.EmployeeStatus;
import com.bankingsim.banking.service.BranchService;
import com.bankingsim.banking.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class BranchEmployeeAdminController {

    private final BranchService branchService;
    private final EmployeeService employeeService;

    @PostMapping("/branches")
    public ApiResponse<BranchResponse> createBranch(@Valid @RequestBody CreateBranchRequest request) {
        return ApiResponse.ok(branchService.create(request), "Branch created");
    }

    @PutMapping("/branches/{id}")
    public ApiResponse<BranchResponse> updateBranch(@PathVariable Long id, @Valid @RequestBody UpdateBranchRequest request) {
        return ApiResponse.ok(branchService.update(id, request), "Branch updated");
    }

    @GetMapping("/branches/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','EMPLOYEE','AUDITOR')")
    public ApiResponse<BranchResponse> getBranch(@PathVariable Long id) {
        return ApiResponse.ok(branchService.get(id));
    }

    @GetMapping("/branches")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','EMPLOYEE','AUDITOR')")
    public ApiResponse<PageResponse<BranchResponse>> listBranches(
            @RequestParam(required = false) BranchStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(branchService.list(status, page, size));
    }

    @PostMapping("/employees")
    public ApiResponse<EmployeeResponse> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return ApiResponse.ok(employeeService.create(request), "Employee created");
    }

    @PatchMapping("/employees/{id}/status")
    public ApiResponse<EmployeeResponse> updateEmployeeStatus(@PathVariable Long id, @RequestParam EmployeeStatus status) {
        return ApiResponse.ok(employeeService.updateStatus(id, status), "Employee status updated");
    }

    @GetMapping("/branches/{branchId}/employees")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','EMPLOYEE','AUDITOR')")
    public ApiResponse<PageResponse<EmployeeResponse>> employeesByBranch(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(employeeService.byBranch(branchId, page, size));
    }
}
