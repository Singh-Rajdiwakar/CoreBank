package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.CustomerStatus;
import com.bankingsim.banking.entity.enums.KycStatus;
import com.bankingsim.banking.entity.enums.RiskProfile;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUserId(Long userId);
    Optional<Customer> findByCustomerCode(String customerCode);
    boolean existsByCustomerCode(String customerCode);
    Page<Customer> findByBranchId(Long branchId, Pageable pageable);
    long countByBranchId(Long branchId);
    Page<Customer> findByBranchIdAndKycStatusAndStatusAndRiskProfile(
            Long branchId,
            KycStatus kycStatus,
            CustomerStatus status,
            RiskProfile riskProfile,
            Pageable pageable
    );

    @Query("""
            select distinct c from Customer c
            left join AccountHolder ah on ah.customer.id = c.id
            left join Account a on a.id = ah.account.id
            where (:branchId is null or c.branch.id = :branchId)
              and (:kycStatus is null or c.kycStatus = :kycStatus)
              and (:status is null or c.status = :status)
              and (:riskProfile is null or c.riskProfile = :riskProfile)
              and (:accountStatus is null or a.status = :accountStatus)
            """)
    Page<Customer> search(
            @Param("branchId") Long branchId,
            @Param("kycStatus") KycStatus kycStatus,
            @Param("status") CustomerStatus status,
            @Param("riskProfile") RiskProfile riskProfile,
            @Param("accountStatus") AccountStatus accountStatus,
            Pageable pageable
    );
}
