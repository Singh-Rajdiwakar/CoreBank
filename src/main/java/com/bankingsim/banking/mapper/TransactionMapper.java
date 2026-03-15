package com.bankingsim.banking.mapper;

import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.BankTransaction;

public final class TransactionMapper {

    private TransactionMapper() {
    }

    public static TransactionResponse toResponse(BankTransaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .referenceNumber(transaction.getReferenceNumber())
                .sourceAccountNumber(getAccountNumber(transaction.getSourceAccount()))
                .destinationAccountNumber(getAccountNumber(transaction.getDestinationAccount()))
                .transactionType(transaction.getTransactionType())
                .status(transaction.getStatus())
                .amount(transaction.getAmount())
                .charges(transaction.getCharges())
                .tax(transaction.getTax())
                .description(transaction.getDescription())
                .initiatedAt(transaction.getInitiatedAt())
                .valueDate(transaction.getValueDate())
                .fraudScore(transaction.getFraudScore())
                .approvalRequired(transaction.isApprovalRequired())
                .failureReason(transaction.getFailureReason())
                .build();
    }

    private static String getAccountNumber(Account account) {
        return account == null ? null : account.getAccountNumber();
    }
}
