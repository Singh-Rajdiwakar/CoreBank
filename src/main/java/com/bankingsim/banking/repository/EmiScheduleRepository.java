package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.EmiSchedule;
import com.bankingsim.banking.entity.enums.EmiStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmiScheduleRepository extends JpaRepository<EmiSchedule, Long> {
    List<EmiSchedule> findByLoanIdOrderByInstallmentNumberAsc(Long loanId);
    List<EmiSchedule> findByStatusAndDueDateBefore(EmiStatus status, LocalDate date);
}
