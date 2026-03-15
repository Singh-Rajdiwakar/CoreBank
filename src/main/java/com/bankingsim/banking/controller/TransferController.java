package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.admin.RemarkRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.transaction.BulkTransferRequest;
import com.bankingsim.banking.dto.transaction.BulkTransferResponse;
import com.bankingsim.banking.dto.transaction.RecurringTransferRequest;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.dto.transaction.TransferRequest;
import com.bankingsim.banking.entity.enums.TransferMode;
import com.bankingsim.banking.service.TransferBatchService;
import com.bankingsim.banking.service.TransactionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransactionService transactionService;
    private final TransferBatchService transferBatchService;

    @PostMapping("/self")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<TransactionResponse> selfTransfer(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.SELF);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/internal")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<TransactionResponse> internalTransfer(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.INTERNAL);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/beneficiary")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<TransactionResponse> beneficiaryTransfer(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.BENEFICIARY);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/external")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<TransactionResponse> externalTransfer(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.EXTERNAL);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/neft")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<TransactionResponse> neft(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.NEFT);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/imps")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<TransactionResponse> imps(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.IMPS);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/rtgs")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<TransactionResponse> rtgs(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.RTGS);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/upi")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<TransactionResponse> upi(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.UPI);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/scheduled")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<TransactionResponse> scheduled(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.SCHEDULED);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/recurring")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<TransactionResponse>> recurring(
            @Valid @RequestBody RecurringTransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        return ApiResponse.ok(transferBatchService.setupRecurring(request, idempotencyKey),
                "Recurring transfers scheduled");
    }

    @PostMapping("/bulk-salary")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<TransactionResponse> bulkSalary(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        request.setTransferMode(TransferMode.BULK);
        return ApiResponse.ok(transactionService.transfer(request, idempotencyKey));
    }

    @PostMapping("/bulk-file")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<BulkTransferResponse> bulkFileSimulation(
            @Valid @RequestBody BulkTransferRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        return ApiResponse.ok(transferBatchService.processBulk(request, idempotencyKey),
                "Bulk transfer file processed");
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER','MANAGER','ADMIN')")
    public ApiResponse<TransactionResponse> cancel(@PathVariable Long id) {
        return ApiResponse.ok(transactionService.cancelScheduled(id), "Transfer cancelled");
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<TransactionResponse> approve(@PathVariable Long id, @Valid @RequestBody RemarkRequest request) {
        return ApiResponse.ok(transactionService.approvePending(id, request.getRemarks()), "Transfer approved");
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<TransactionResponse> reject(@PathVariable Long id, @Valid @RequestBody RemarkRequest request) {
        return ApiResponse.ok(transactionService.rejectPending(id, request.getRemarks()), "Transfer rejected");
    }

    @PatchMapping("/{reference}/reverse")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<TransactionResponse> reverse(@PathVariable String reference, @Valid @RequestBody RemarkRequest request) {
        return ApiResponse.ok(transactionService.reverse(reference, request.getRemarks()), "Transfer reversed");
    }

    @GetMapping("/{id}/receipt")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<TransactionResponse> receipt(@PathVariable Long id) {
        return ApiResponse.ok(transactionService.getById(id));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<List<TransactionResponse>> recent() {
        return ApiResponse.ok(transactionService.myRecentTransactions());
    }
}
