package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.account.AccountActionRequest;
import com.bankingsim.banking.dto.account.AccountResponse;
import com.bankingsim.banking.dto.account.OpenAccountRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.service.AccountService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<AccountResponse> open(@Valid @RequestBody OpenAccountRequest request) {
        return ApiResponse.ok(accountService.open(request), "Account opening request created");
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<AccountResponse> approve(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean approved,
            @Valid @RequestBody AccountActionRequest request) {
        return ApiResponse.ok(accountService.approve(id, approved, request.getRemarks()),
                approved ? "Account approved" : "Account rejected");
    }

    @PatchMapping("/{id}/freeze")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<AccountResponse> freeze(@PathVariable Long id, @Valid @RequestBody AccountActionRequest request) {
        return ApiResponse.ok(accountService.updateStatus(id, AccountStatus.FREEZED, request.getRemarks()), "Account frozen");
    }

    @PatchMapping("/{id}/unfreeze")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<AccountResponse> unfreeze(@PathVariable Long id, @Valid @RequestBody AccountActionRequest request) {
        return ApiResponse.ok(accountService.updateStatus(id, AccountStatus.ACTIVE, request.getRemarks()), "Account unfrozen");
    }

    @PatchMapping("/{id}/block")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<AccountResponse> block(@PathVariable Long id, @Valid @RequestBody AccountActionRequest request) {
        return ApiResponse.ok(accountService.updateStatus(id, AccountStatus.BLOCKED, request.getRemarks()), "Account blocked");
    }

    @PatchMapping("/{id}/unblock")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<AccountResponse> unblock(@PathVariable Long id, @Valid @RequestBody AccountActionRequest request) {
        return ApiResponse.ok(accountService.updateStatus(id, AccountStatus.ACTIVE, request.getRemarks()), "Account unblocked");
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<AccountResponse> close(@PathVariable Long id, @Valid @RequestBody AccountActionRequest request) {
        return ApiResponse.ok(accountService.updateStatus(id, AccountStatus.CLOSED, request.getRemarks()), "Account closed");
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<AccountResponse> reactivate(@PathVariable Long id, @Valid @RequestBody AccountActionRequest request) {
        return ApiResponse.ok(accountService.updateStatus(id, AccountStatus.ACTIVE, request.getRemarks()), "Account reactivated");
    }

    @GetMapping("/{accountNumber}")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<AccountResponse> get(@PathVariable String accountNumber) {
        return ApiResponse.ok(accountService.getByAccountNumber(accountNumber));
    }

    @GetMapping("/{accountNumber}/balance")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<java.util.Map<String, String>> balance(@PathVariable String accountNumber) {
        AccountResponse account = accountService.getByAccountNumber(accountNumber);
        java.util.Map<String, String> map = new java.util.HashMap<>();
        map.put("accountNumber", account.getAccountNumber());
        map.put("balance", account.getBalance().toPlainString());
        map.put("availableBalance", account.getAvailableBalance().toPlainString());
        map.put("holdAmount", account.getHoldAmount().toPlainString());
        return ApiResponse.ok(map);
    }

    @GetMapping("/{accountNumber}/statement")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<PageResponse<TransactionResponse>> statement(
            @PathVariable String accountNumber,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(accountService.statement(accountNumber, from, to, page, size));
    }

    @GetMapping("/{accountNumber}/mini-statement")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<List<TransactionResponse>> miniStatement(@PathVariable String accountNumber) {
        return ApiResponse.ok(accountService.miniStatement(accountNumber));
    }

    @GetMapping("/{accountNumber}/passbook")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<PageResponse<TransactionResponse>> passbook(
            @PathVariable String accountNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.ok(accountService.statement(accountNumber, null, null, page, size));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<PageResponse<AccountResponse>> listByCustomer(
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(accountService.listByCustomer(customerId, page, size));
    }
}
