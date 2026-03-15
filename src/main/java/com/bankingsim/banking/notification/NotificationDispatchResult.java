package com.bankingsim.banking.notification;

import com.bankingsim.banking.entity.enums.NotificationStatus;

public record NotificationDispatchResult(
        NotificationStatus status,
        boolean retryable,
        String error,
        String providerMessageId
) {
    public static NotificationDispatchResult sent(String providerMessageId) {
        return new NotificationDispatchResult(NotificationStatus.SENT, false, null, providerMessageId);
    }

    public static NotificationDispatchResult failed(String error, boolean retryable) {
        return new NotificationDispatchResult(NotificationStatus.FAILED, retryable, error, null);
    }
}
