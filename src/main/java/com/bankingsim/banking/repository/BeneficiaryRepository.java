package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Beneficiary;
import com.bankingsim.banking.entity.enums.BeneficiaryStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByCustomerIdAndStatus(Long customerId, BeneficiaryStatus status);
    Optional<Beneficiary> findByIdAndCustomerId(Long id, Long customerId);
    boolean existsByCustomerIdAndAccountNumber(Long customerId, String accountNumber);
    List<Beneficiary> findByStatusAndCoolingUntilBefore(BeneficiaryStatus status, LocalDateTime time);
}
