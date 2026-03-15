package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.AuditLog;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByActionAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<AuditLog> findByTargetEntityAndTargetIdOrderByActionAtDesc(String targetEntity, String targetId, Pageable pageable);
}
