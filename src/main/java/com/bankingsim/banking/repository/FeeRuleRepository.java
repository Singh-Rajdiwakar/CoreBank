package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.FeeRule;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRuleRepository extends JpaRepository<FeeRule, Long> {
    Optional<FeeRule> findByCodeAndActiveTrue(String code);
}
