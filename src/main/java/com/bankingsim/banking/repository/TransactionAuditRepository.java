package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.TransactionAudit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionAuditRepository extends JpaRepository<TransactionAudit, Long> {
}
