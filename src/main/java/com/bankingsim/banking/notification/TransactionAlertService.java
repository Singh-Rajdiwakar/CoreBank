package com.bankingsim.banking.notification;

import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.repository.AccountHolderRepository;
import com.bankingsim.banking.repository.UserRepository;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionAlertService {

    private final AccountHolderRepository accountHolderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public void notifyTransaction(BankTransaction transaction) {
        if (transaction == null || transaction.getStatus() == null) {
            return;
        }
        switch (transaction.getStatus()) {
            case SUCCESS -> notifySuccess(transaction);
            case PENDING -> notifyPending(transaction);
            case FAILED, CANCELLED, FLAGGED, REVERSED -> notifyIssue(transaction);
            default -> {
                // INITIATED notification is skipped intentionally.
            }
        }
    }

    private void notifySuccess(BankTransaction transaction) {
        if (transaction.getSourceAccount() != null) {
            BigDecimal totalDebit = transaction.getAmount()
                    .add(transaction.getCharges() == null ? BigDecimal.ZERO : transaction.getCharges())
                    .add(transaction.getTax() == null ? BigDecimal.ZERO : transaction.getTax());
            notifyAccountHoldersTemplate(
                    transaction.getSourceAccount(),
                    NotificationType.TRANSACTION,
                    NotificationTemplateKey.TRANSACTION_DEBIT,
                    baseVariables(transaction, totalDebit.toPlainString(), transaction.getSourceAccount())
            );
            notifyLowBalanceIfNeeded(transaction);
        }
        if (transaction.getDestinationAccount() != null) {
            notifyAccountHoldersTemplate(
                    transaction.getDestinationAccount(),
                    NotificationType.TRANSACTION,
                    NotificationTemplateKey.TRANSACTION_CREDIT,
                    baseVariables(transaction, transaction.getAmount().toPlainString(), transaction.getDestinationAccount())
            );
        }
    }

    private void notifyPending(BankTransaction transaction) {
        notifyActorAndAccounts(
                transaction,
                NotificationType.TRANSACTION,
                NotificationTemplateKey.TRANSACTION_PENDING,
                baseVariables(transaction, transaction.getAmount().toPlainString(), null)
        );
    }

    private void notifyIssue(BankTransaction transaction) {
        String reason = transaction.getFailureReason() == null ? "N/A" : transaction.getFailureReason();
        Map<String, String> variables = baseVariables(transaction, transaction.getAmount().toPlainString(), null);
        variables = new java.util.HashMap<>(variables);
        variables.put("status", transaction.getStatus().name());
        variables.put("reason", reason);
        notifyActorAndAccounts(
                transaction,
                NotificationType.TRANSACTION,
                NotificationTemplateKey.TRANSACTION_ISSUE,
                variables
        );
    }

    private void notifyActorAndAccounts(BankTransaction transaction,
                                        NotificationType type,
                                        NotificationTemplateKey templateKey,
                                        Map<String, String> variables) {
        Set<Long> users = new LinkedHashSet<>();
        if (transaction.getInitiatedBy() != null && userRepository.existsById(transaction.getInitiatedBy())) {
            users.add(transaction.getInitiatedBy());
        }
        users.addAll(resolveAccountHolderUserIds(transaction.getSourceAccount()));
        users.addAll(resolveAccountHolderUserIds(transaction.getDestinationAccount()));
        users.forEach(userId -> notificationService.publishTemplate(userId, type, templateKey, variables));
    }

    private void notifyAccountHoldersTemplate(Account account,
                                              NotificationType type,
                                              NotificationTemplateKey templateKey,
                                              Map<String, String> variables) {
        for (Long userId : resolveAccountHolderUserIds(account)) {
            notificationService.publishTemplate(userId, type, templateKey, variables);
        }
    }

    private void notifyLowBalanceIfNeeded(BankTransaction transaction) {
        if (transaction.getSourceAccount() == null || transaction.getAfterBalance() == null) {
            return;
        }
        BigDecimal minimum = transaction.getSourceAccount().getMinimumBalance() == null
                ? BigDecimal.ZERO
                : transaction.getSourceAccount().getMinimumBalance();
        if (transaction.getAfterBalance().compareTo(minimum) >= 0) {
            return;
        }
        notifyAccountHoldersTemplate(
                transaction.getSourceAccount(),
                NotificationType.LOW_BALANCE,
                NotificationTemplateKey.LOW_BALANCE,
                Map.of(
                        "balance", transaction.getAfterBalance().toPlainString(),
                        "minimumBalance", minimum.toPlainString(),
                        "account", transaction.getSourceAccount().getAccountNumber(),
                        "reference", value(transaction.getReferenceNumber()),
                        "type", value(transaction.getTransactionType() == null ? null : transaction.getTransactionType().name()),
                        "amount", value(transaction.getAmount() == null ? null : transaction.getAmount().toPlainString())
                )
        );
    }

    private Map<String, String> baseVariables(BankTransaction transaction, String amount, Account account) {
        return Map.of(
                "reference", value(transaction.getReferenceNumber()),
                "type", value(transaction.getTransactionType() == null ? null : transaction.getTransactionType().name()),
                "amount", value(amount),
                "account", value(account == null ? null : account.getAccountNumber()),
                "status", value(transaction.getStatus() == null ? null : transaction.getStatus().name()),
                "reason", value(transaction.getFailureReason())
        );
    }

    private String value(String text) {
        return text == null ? "" : text;
    }

    private Set<Long> resolveAccountHolderUserIds(Account account) {
        Set<Long> users = new LinkedHashSet<>();
        if (account == null || account.getId() == null) {
            return users;
        }
        accountHolderRepository.findByAccountId(account.getId()).forEach(holder -> {
            if (holder.getCustomer() != null && holder.getCustomer().getUser() != null) {
                users.add(holder.getCustomer().getUser().getId());
            }
        });
        return users;
    }
}
