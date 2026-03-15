package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.FixedDeposit;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FixedDepositRepository extends JpaRepository<FixedDeposit, Long> {
    Optional<FixedDeposit> findByFdNumber(String fdNumber);
    List<FixedDeposit> findByMaturityDateLessThanEqualAndStatus(LocalDate date, String status);
}
