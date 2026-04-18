package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Employee;
import com.bankingsim.banking.entity.enums.EmployeeStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserId(Long userId);
    Page<Employee> findByBranchId(Long branchId, Pageable pageable);
    Page<Employee> findByBranchIdAndStatus(Long branchId, EmployeeStatus status, Pageable pageable);
}
