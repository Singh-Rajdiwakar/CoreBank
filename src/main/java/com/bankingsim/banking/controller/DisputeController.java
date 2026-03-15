package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.common.AuditLogResponse;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.dispute.DisputeAssignRequest;
import com.bankingsim.banking.dto.dispute.DisputeCreateRequest;
import com.bankingsim.banking.dto.dispute.DisputeEvidenceRequest;
import com.bankingsim.banking.dto.dispute.DisputeEvidenceResponse;
import com.bankingsim.banking.dto.dispute.DisputeResponse;
import com.bankingsim.banking.dto.dispute.DisputeStatusUpdateRequest;
import com.bankingsim.banking.dto.dispute.DisputeSummaryResponse;
import com.bankingsim.banking.entity.enums.DisputeStatus;
import com.bankingsim.banking.service.DisputeService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<DisputeResponse> create(@Valid @RequestBody DisputeCreateRequest request) {
        return ApiResponse.ok(disputeService.create(request), "Dispute case raised");
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PageResponse<DisputeResponse>> myCases(
            @RequestParam(required = false) DisputeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(disputeService.myDisputes(status, page, size));
    }

    @GetMapping("/me/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<DisputeResponse> myCase(@PathVariable Long id) {
        return ApiResponse.ok(disputeService.myDisputeById(id));
    }

    @PostMapping("/{id}/evidence")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<DisputeEvidenceResponse> uploadEvidence(
            @PathVariable Long id,
            @Valid @RequestBody DisputeEvidenceRequest request) {
        return ApiResponse.ok(disputeService.uploadEvidence(id, request), "Evidence uploaded");
    }

    @GetMapping("/{id}/evidence")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<java.util.List<DisputeEvidenceResponse>> evidence(@PathVariable Long id) {
        return ApiResponse.ok(disputeService.listEvidence(id));
    }

    @GetMapping("/{id}/timeline")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<PageResponse<AuditLogResponse>> timeline(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.ok(disputeService.timeline(id, page, size));
    }

    @GetMapping("/ops")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<PageResponse<DisputeResponse>> operationsQueue(
            @RequestParam(required = false) DisputeStatus status,
            @RequestParam(defaultValue = "false") boolean overdueOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.ok(disputeService.operationsQueue(status, overdueOnly, page, size));
    }

    @GetMapping("/ops/summary")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<DisputeSummaryResponse> summary() {
        return ApiResponse.ok(disputeService.summary());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<DisputeResponse> assign(@PathVariable Long id, @Valid @RequestBody DisputeAssignRequest request) {
        return ApiResponse.ok(disputeService.assign(id, request), "Dispute assigned");
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<DisputeResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody DisputeStatusUpdateRequest request) {
        return ApiResponse.ok(disputeService.updateStatus(id, request), "Dispute status updated");
    }
}
