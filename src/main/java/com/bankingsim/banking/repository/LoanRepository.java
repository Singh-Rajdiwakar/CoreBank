package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Loan;
import com.bankingsim.banking.entity.enums.LoanStatus;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByCustomerId(Long customerId);
    List<Loan> findByStatus(LoanStatus status);
    List<Loan> findByCustomerBranchId(Long branchId);
    List<Loan> findByCustomerBranchIdAndStatus(Long branchId, LoanStatus status);
    long countByStatus(LoanStatus status);

    @Query("select coalesce(sum(l.outstandingPrincipal),0) from Loan l")
    BigDecimal sumOutstandingPrincipal();

    @Query("select coalesce(sum(l.outstandingPrincipal),0) from Loan l where l.status = :status")
    BigDecimal sumOutstandingPrincipalByStatus(@Param("status") LoanStatus status);
}
