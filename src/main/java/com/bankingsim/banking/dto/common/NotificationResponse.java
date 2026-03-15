package com.bankingsim.banking.dto.common;

import com.bankingsim.banking.entity.enums.NotificationChannel;
import com.bankingsim.banking.entity.enums.NotificationStatus;
import com.bankingsim.banking.entity.enums.NotificationType;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private NotificationChannel channel;
    private NotificationStatus status;
    private String title;
    private String message;
    private LocalDateTime sentAt;
    private LocalDateTime deliveredAt;
    private String providerMessageId;
    private int attemptCount;
    private LocalDateTime nextRetryAt;
    private String lastError;
    private boolean readFlag;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
