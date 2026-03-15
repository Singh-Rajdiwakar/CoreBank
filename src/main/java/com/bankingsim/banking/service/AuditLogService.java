package com.bankingsim.banking.service;

import com.bankingsim.banking.dto.common.AuditLogResponse;
import com.bankingsim.banking.entity.AuditLog;
import com.bankingsim.banking.repository.AuditLogRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLogResponse> list(LocalDateTime from, LocalDateTime to, int page, int size) {
        Page<AuditLog> logs;
        if (from == null || to == null) {
            logs = auditLogRepository.findAll(PageRequest.of(page, size));
        } else {
            logs = auditLogRepository.findByActionAtBetween(from, to, PageRequest.of(page, size));
        }
        return logs.map(this::toResponse);
    }

    public Page<AuditLogResponse> byTarget(String targetEntity, String targetId, int page, int size) {
        return auditLogRepository.findByTargetEntityAndTargetIdOrderByActionAtDesc(
                targetEntity,
                targetId,
                PageRequest.of(page, size)
        ).map(this::toResponse);
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .actorUserId(log.getActorUserId())
                .actionType(log.getActionType())
                .targetEntity(log.getTargetEntity())
                .targetId(log.getTargetId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .success(log.isSuccess())
                .remarks(log.getRemarks())
                .ipAddress(log.getIpAddress())
                .deviceInfo(log.getDeviceInfo())
                .actionAt(log.getActionAt())
                .build();
    }
}
