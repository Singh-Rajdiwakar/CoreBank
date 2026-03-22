package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.dto.account.CardPinRequest;
import com.bankingsim.banking.dto.account.CardResponse;
import com.bankingsim.banking.dto.account.CardSettingsRequest;
import com.bankingsim.banking.dto.account.WithdrawalRequest;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.Card;
import com.bankingsim.banking.entity.enums.CardStatus;
import com.bankingsim.banking.entity.enums.TransactionChannel;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.mapper.CardMapper;
import com.bankingsim.banking.mapper.TransactionMapper;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.repository.CardRepository;
import com.bankingsim.banking.util.ReferenceGenerator;
import com.bankingsim.banking.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final BankTransactionRepository transactionRepository;
    private final AccountService accountService;
    private final CustomerService customerService;
    private final TransactionService transactionService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public CardResponse requestCard(String accountNumber) {
        Account account = accountService.getEntityByNumber(accountNumber);
        enforceAccountAccess(account);

        Card card = new Card();
        card.setAccount(account);
        card.setMaskedNumber(ReferenceGenerator.cardMaskedNumber());
        card.setCardHolderName("ACCOUNT HOLDER " + account.getAccountNumber().substring(account.getAccountNumber().length() - 4));
        card.setExpiryDate(LocalDate.now().plusYears(5));
        card.setStatus(CardStatus.REQUESTED);
        card.setDailyLimit(BigDecimal.valueOf(50000));

        Card saved = cardRepository.save(card);

        auditService.log(SecurityUtils.currentUserId(), "CARD_REQUEST", "CARD", saved.getId().toString(), null,
                saved.getMaskedNumber(), true, "Card requested");

        return CardMapper.toResponse(saved);
    }

    @Transactional
    public CardResponse activate(String cardNumber) {
        Card card = findByCardNumber(cardNumber);
        enforceCardAccess(card);
        if (card.getStatus() != CardStatus.REQUESTED && card.getStatus() != CardStatus.BLOCKED) {
            throw new ForbiddenOperationException("Card cannot be activated in current status");
        }
        card.setStatus(CardStatus.ACTIVE);
        Card saved = cardRepository.save(card);
        auditService.log(SecurityUtils.currentUserId(), "CARD_ACTIVATE", "CARD", saved.getId().toString(), null,
                saved.getStatus().name(), true, "Card activated");
        return CardMapper.toResponse(saved);
    }

    @Transactional
    public CardResponse block(String cardNumber) {
        Card card = findByCardNumber(cardNumber);
        enforceCardAccess(card);
        card.setStatus(CardStatus.BLOCKED);
        Card saved = cardRepository.save(card);
        auditService.log(SecurityUtils.currentUserId(), "CARD_BLOCK", "CARD", saved.getId().toString(), null,
                saved.getStatus().name(), true, "Card blocked");
        return CardMapper.toResponse(saved);
    }

    @Transactional
    public CardResponse unblock(String cardNumber) {
        Card card = findByCardNumber(cardNumber);
        enforceCardAccess(card);
        if (card.getStatus() != CardStatus.BLOCKED) {
            throw new ForbiddenOperationException("Only blocked cards can be unblocked");
        }
        card.setStatus(CardStatus.ACTIVE);
        Card saved = cardRepository.save(card);
        auditService.log(SecurityUtils.currentUserId(), "CARD_UNBLOCK", "CARD", saved.getId().toString(), null,
                saved.getStatus().name(), true, "Card unblocked");
        return CardMapper.toResponse(saved);
    }

    @Transactional
    public CardResponse hotlist(String cardNumber) {
        Card card = findByCardNumber(cardNumber);
        enforceCardAccess(card);
        card.setStatus(CardStatus.HOTLISTED);
        Card saved = cardRepository.save(card);
        auditService.log(SecurityUtils.currentUserId(), "CARD_HOTLIST", "CARD", saved.getId().toString(), null,
                saved.getStatus().name(), true, "Card hotlisted");
        return CardMapper.toResponse(saved);
    }

    @Transactional
    public CardResponse setPin(CardPinRequest request) {
        Card card = findByCardNumber(request.getCardNumber());
        enforceCardAccess(card);
        card.setPinHash(passwordEncoder.encode(request.getPin()));
        Card saved = cardRepository.save(card);
        auditService.log(SecurityUtils.currentUserId(), "CARD_SET_PIN", "CARD", saved.getId().toString(), null,
                "pinUpdated", true, "Card PIN set/changed");
        return CardMapper.toResponse(saved);
    }

    @Transactional
    public CardResponse updateSettings(String cardNumber, CardSettingsRequest request) {
        Card card = findByCardNumber(cardNumber);
        enforceCardAccess(card);
        if (request.getDomesticEnabled() != null) {
            card.setDomesticEnabled(request.getDomesticEnabled());
        }
        if (request.getInternationalEnabled() != null) {
            card.setInternationalEnabled(request.getInternationalEnabled());
        }
        if (request.getContactlessEnabled() != null) {
            card.setContactlessEnabled(request.getContactlessEnabled());
        }
        Card saved = cardRepository.save(card);
        auditService.log(SecurityUtils.currentUserId(), "CARD_SETTINGS_UPDATE", "CARD", saved.getId().toString(), null,
                "settingsUpdated", true, "Card settings updated");
        return CardMapper.toResponse(saved);
    }

    public List<CardResponse> listByAccount(String accountNumber) {
        Account account = accountService.findByAccountNumberOrNull(accountNumber);
        if (account == null) {
            return java.util.Collections.emptyList();
        }
        enforceAccountAccess(account);
        return cardRepository.findByAccountId(account.getId()).stream().map(CardMapper::toResponse).toList();
    }

    public List<TransactionResponse> cardTransactions(String cardNumber, int limit) {
        Card card = findByCardNumber(cardNumber);
        enforceCardAccess(card);

        int size = Math.max(1, Math.min(limit, 200));
        return transactionRepository.findBySourceAccountIdAndChannelOrderByInitiatedAtDesc(
                        card.getAccount().getId(),
                        TransactionChannel.ATM,
                        PageRequest.of(0, size)
                )
                .stream()
                .filter(tx -> tx.getDescription() != null && tx.getDescription().contains("CARD=" + cardNumber))
                .map(TransactionMapper::toResponse)
                .toList();
    }

    @Transactional
    public TransactionResponse atmWithdraw(String cardNumber, String pin, BigDecimal amount, String remarks) {
        Card card = findByCardNumber(cardNumber);
        enforceCardAccess(card);
        if (card.getStatus() != CardStatus.ACTIVE) {
            throw new ForbiddenOperationException("Card not active");
        }
        if (card.getPinHash() == null || !passwordEncoder.matches(pin, card.getPinHash())) {
            throw new ForbiddenOperationException("Invalid card PIN");
        }
        BigDecimal usedToday = transactionRepository.sumAtmUsageByCardSince(
                card.getAccount().getId(),
                "CARD=" + cardNumber,
                LocalDate.now().atStartOfDay()
        );
        if (usedToday.add(amount).compareTo(card.getDailyLimit()) > 0) {
            throw new ForbiddenOperationException("Card daily usage limit exceeded");
        }

        WithdrawalRequest request = new WithdrawalRequest();
        request.setAccountNumber(card.getAccount().getAccountNumber());
        request.setAmount(amount);
        request.setMode("ATM");
        request.setCardNumber(cardNumber);
        request.setRemarks(buildCardRemark(cardNumber, remarks));

        return transactionService.withdraw(request);
    }

    private Card findByCardNumber(String cardNumber) {
        return cardRepository.findByMaskedNumber(cardNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
    }

    private String buildCardRemark(String cardNumber, String remarks) {
        if (remarks == null || remarks.isBlank()) {
            return "CARD=" + cardNumber;
        }
        return "CARD=" + cardNumber + " | " + remarks;
    }

    private void enforceCardAccess(Card card) {
        enforceAccountAccess(card.getAccount());
    }

    private void enforceAccountAccess(Account account) {
        if (SecurityUtils.hasRole("ROLE_ADMIN")
                || SecurityUtils.hasRole("ROLE_MANAGER")
                || SecurityUtils.hasRole("ROLE_EMPLOYEE")
                || SecurityUtils.hasRole("ROLE_AUDITOR")) {
            return;
        }
        if (!SecurityUtils.hasRole("ROLE_CUSTOMER")) {
            throw new ForbiddenOperationException("Unauthorized card access");
        }

        Long customerId = customerService.getCustomerByUserId(SecurityUtils.currentUserId()).getId();
        boolean owned = accountService.isOwnedByCustomer(account, customerId);
        if (!owned) {
            throw new ForbiddenOperationException("Card does not belong to customer");
        }
    }
}
