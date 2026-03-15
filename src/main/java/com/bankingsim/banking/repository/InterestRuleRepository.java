package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.InterestRule;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterestRuleRepository extends JpaRepository<InterestRule, Long> {
    Optional<InterestRule> findByProductTypeAndActiveTrue(String productType);
}
