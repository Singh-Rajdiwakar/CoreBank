package com.bankingsim.banking.dto.common;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationQueueSummaryResponse {
    private long pendingCount;
    private long failedCount;
    private long sentCount;
    private long dueRetryCount;
}
