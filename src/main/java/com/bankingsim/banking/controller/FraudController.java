package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.admin.FraudCaseResponse;
import com.bankingsim.banking.dto.admin.FraudReviewRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.fraud.FraudDetectionService;
import com.bankingsim.banking.util.SecurityUtils;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fraud/cases")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
public class FraudController {

    private final FraudDetectionService fraudDetectionService;

    @GetMapping
    public ApiResponse<List<FraudCaseResponse>> list() {
        return ApiResponse.ok(fraudDetectionService.listCases());
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<FraudCaseResponse> review(@PathVariable Long id, @Valid @RequestBody FraudReviewRequest request) {
        return ApiResponse.ok(fraudDetectionService.reviewCase(id, request.getStatus(), request.getNotes(), SecurityUtils.currentUserId()),
                "Fraud case reviewed");
    }
}
