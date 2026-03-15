package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.account.BeneficiaryCreateRequest;
import com.bankingsim.banking.dto.account.BeneficiaryResponse;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.service.BeneficiaryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/beneficiaries")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @PostMapping
    public ApiResponse<BeneficiaryResponse> add(@Valid @RequestBody BeneficiaryCreateRequest request) {
        return ApiResponse.ok(beneficiaryService.add(request), "Beneficiary added");
    }

    @PostMapping("/{id}/verify")
    public ApiResponse<BeneficiaryResponse> verify(@PathVariable Long id) {
        return ApiResponse.ok(beneficiaryService.verify(id), "Beneficiary verified and cooling started");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<BeneficiaryResponse> remove(@PathVariable Long id) {
        return ApiResponse.ok(beneficiaryService.remove(id), "Beneficiary removed");
    }

    @GetMapping
    public ApiResponse<List<BeneficiaryResponse>> listActive() {
        return ApiResponse.ok(beneficiaryService.listActive());
    }
}
