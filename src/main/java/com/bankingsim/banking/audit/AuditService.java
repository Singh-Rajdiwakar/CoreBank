package com.bankingsim.banking.audit;

import com.bankingsim.banking.entity.AuditLog;
import com.bankingsim.banking.repository.AuditLogRepository;
import com.bankingsim.banking.util.RequestMetadataUtil;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(Long actorUserId,
                    String actionType,
                    String targetEntity,
                    String targetId,
                    String oldValue,
                    String newValue,
                    boolean success,
                    String remarks) {
        AuditLog log = new AuditLog();
        log.setActorUserId(actorUserId);
        log.setActionType(actionType);
        log.setTargetEntity(targetEntity);
        log.setTargetId(targetId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setSuccess(success);
        log.setRemarks(remarks);
        log.setIpAddress(RequestMetadataUtil.currentIp());
        log.setDeviceInfo(RequestMetadataUtil.currentDevice());
        log.setActionAt(LocalDateTime.now());
        auditLogRepository.save(log);
    }
}
