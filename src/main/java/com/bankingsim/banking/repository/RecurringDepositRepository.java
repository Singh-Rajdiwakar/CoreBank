package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.RecurringDeposit;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringDepositRepository extends JpaRepository<RecurringDeposit, Long> {
    Optional<RecurringDeposit> findByRdNumber(String rdNumber);
    List<RecurringDeposit> findByMaturityDateLessThanEqualAndStatus(LocalDate date, String status);
}
