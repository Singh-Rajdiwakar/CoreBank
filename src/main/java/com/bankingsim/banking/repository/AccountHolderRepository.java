package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.AccountHolder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountHolderRepository extends JpaRepository<AccountHolder, Long> {
    List<AccountHolder> findByAccountId(Long accountId);
    List<AccountHolder> findByCustomerId(Long customerId);
    Optional<AccountHolder> findByAccountIdAndCustomerId(Long accountId, Long customerId);
    boolean existsByAccountIdAndCustomerId(Long accountId, Long customerId);
}
