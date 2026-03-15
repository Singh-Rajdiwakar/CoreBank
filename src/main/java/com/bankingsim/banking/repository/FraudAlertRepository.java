package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.FraudAlert;
import com.bankingsim.banking.entity.enums.FraudCaseStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    List<FraudAlert> findByStatus(FraudCaseStatus status);
}
