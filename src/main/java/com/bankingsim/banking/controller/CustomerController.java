package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.account.SetTransactionPinRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.customer.CustomerCreateRequest;
import com.bankingsim.banking.dto.customer.CustomerResponse;
import com.bankingsim.banking.dto.customer.CustomerUpdateRequest;
import com.bankingsim.banking.dto.customer.DocumentMetadataRequest;
import com.bankingsim.banking.entity.CustomerDocument;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.CustomerStatus;
import com.bankingsim.banking.entity.enums.KycStatus;
import com.bankingsim.banking.entity.enums.RiskProfile;
import com.bankingsim.banking.service.CustomerService;
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
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<CustomerResponse> create(@Valid @RequestBody CustomerCreateRequest request) {
        return ApiResponse.ok(customerService.create(request), "Customer created");
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<CustomerResponse> me() {
        return ApiResponse.ok(customerService.getMyProfile());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<CustomerResponse> byId(@PathVariable Long id) {
        return ApiResponse.ok(customerService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<CustomerResponse> update(@PathVariable Long id, @Valid @RequestBody CustomerUpdateRequest request) {
        return ApiResponse.ok(customerService.update(id, request), "Customer updated");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<PageResponse<CustomerResponse>> search(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) KycStatus kycStatus,
            @RequestParam(required = false) CustomerStatus status,
            @RequestParam(required = false) RiskProfile riskProfile,
            @RequestParam(required = false) AccountStatus accountStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(customerService.search(branchId, kycStatus, status, riskProfile, accountStatus, page, size));
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<Void> uploadDocument(@PathVariable Long id, @Valid @RequestBody DocumentMetadataRequest request) {
        customerService.uploadDocument(id, request);
        return ApiResponse.ok(null, "Document metadata uploaded");
    }

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<java.util.List<CustomerDocument>> documents(@PathVariable Long id) {
        return ApiResponse.ok(customerService.getDocuments(id));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        customerService.archive(id);
        return ApiResponse.ok(null, "Customer archived");
    }
    @PatchMapping("/{id}/unarchive")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<Void> unarchive(@PathVariable Long id) {
        customerService.unarchive(id);
        return ApiResponse.ok(null, "Customer unarchived");
    }
    @PostMapping("/me/transaction-pin")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<Void> setTransactionPin(@Valid @RequestBody SetTransactionPinRequest request) {
        customerService.setTransactionPin(request);
        return ApiResponse.ok(null, "Transaction PIN updated");
    }
}
