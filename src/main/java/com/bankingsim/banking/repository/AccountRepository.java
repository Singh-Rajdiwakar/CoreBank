package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.AccountType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNumber(String accountNumber);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Account> findWithLockByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);
    Page<Account> findByBranchId(Long branchId, Pageable pageable);
    Page<Account> findByStatus(AccountStatus status, Pageable pageable);
    long countByStatus(AccountStatus status);
    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a WHERE a.status = :status")
    java.math.BigDecimal sumBalancesByStatus(@Param("status") AccountStatus status);
    long countByBranchId(Long branchId);
    List<Account> findByStatusAndLastTransactionAtBefore(AccountStatus status, LocalDateTime lastTransactionAt);
    List<Account> findByAccountType(AccountType accountType);

    @Query("""
            select a from Account a
            join AccountHolder ah on ah.account.id = a.id
            where ah.customer.id = :customerId
            """)
    Page<Account> findByCustomerId(@Param("customerId") Long customerId, Pageable pageable);
}

