package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.account.CardPinRequest;
import com.bankingsim.banking.dto.account.CardResponse;
import com.bankingsim.banking.dto.account.CardSettingsRequest;
import com.bankingsim.banking.dto.account.CardStatusActionRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.service.CardService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
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
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<CardResponse> requestCard(@RequestParam String accountNumber) {
        return ApiResponse.ok(cardService.requestCard(accountNumber), "Card requested");
    }

    @PatchMapping("/activate")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<CardResponse> activate(@Valid @RequestBody CardStatusActionRequest request) {
        return ApiResponse.ok(cardService.activate(request.getCardNumber()), "Card activated");
    }

    @PatchMapping("/block")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<CardResponse> block(@Valid @RequestBody CardStatusActionRequest request) {
        return ApiResponse.ok(cardService.block(request.getCardNumber()), "Card blocked");
    }

    @PatchMapping("/unblock")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiResponse<CardResponse> unblock(@Valid @RequestBody CardStatusActionRequest request) {
        return ApiResponse.ok(cardService.unblock(request.getCardNumber()), "Card unblocked");
    }

    @PatchMapping("/hotlist")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<CardResponse> hotlist(@Valid @RequestBody CardStatusActionRequest request) {
        return ApiResponse.ok(cardService.hotlist(request.getCardNumber()), "Card hotlisted");
    }

    @PatchMapping("/pin")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<CardResponse> setPin(@Valid @RequestBody CardPinRequest request) {
        return ApiResponse.ok(cardService.setPin(request), "Card PIN updated");
    }

    @PatchMapping("/settings")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<CardResponse> settings(@RequestParam String cardNumber, @RequestBody CardSettingsRequest request) {
        return ApiResponse.ok(cardService.updateSettings(cardNumber, request), "Card settings updated");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<List<CardResponse>> listByAccount(@RequestParam String accountNumber) {
        return ApiResponse.ok(cardService.listByAccount(accountNumber));
    }

    @GetMapping("/{cardNumber}/transactions")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN','AUDITOR')")
    public ApiResponse<List<TransactionResponse>> cardTransactions(
            @PathVariable String cardNumber,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.ok(cardService.cardTransactions(cardNumber, limit));
    }

    @PostMapping("/atm-withdraw")
    @PreAuthorize("hasAnyRole('CUSTOMER','EMPLOYEE','MANAGER','ADMIN')")
    public ApiResponse<TransactionResponse> atmWithdraw(
            @RequestParam String cardNumber,
            @RequestParam String pin,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String remarks) {
        return ApiResponse.ok(cardService.atmWithdraw(cardNumber, pin, amount, remarks), "ATM withdrawal successful");
    }
}
