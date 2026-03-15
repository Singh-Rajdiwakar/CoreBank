package com.bankingsim.banking.notification;

import com.bankingsim.banking.entity.enums.NotificationType;

public record NotificationEvent(Long userId, NotificationType type, String title, String message) {
}
