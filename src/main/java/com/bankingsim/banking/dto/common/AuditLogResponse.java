package com.bankingsim.banking.dto.common;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuditLogResponse {
    private Long id;
    private Long actorUserId;
    private String actionType;
    private String targetEntity;
    private String targetId;
    private String oldValue;
    private String newValue;
    private boolean success;
    private String remarks;
    private String ipAddress;
    private String deviceInfo;
    private LocalDateTime actionAt;
}
