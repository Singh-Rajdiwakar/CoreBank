package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Branch;
import com.bankingsim.banking.entity.enums.BranchStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    Optional<Branch> findByBranchCode(String branchCode);
    Optional<Branch> findByIfscCode(String ifscCode);
    Page<Branch> findByStatus(BranchStatus status, Pageable pageable);
}
