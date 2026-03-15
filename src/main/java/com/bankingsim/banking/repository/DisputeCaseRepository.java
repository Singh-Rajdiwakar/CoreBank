package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.DisputeCase;
import com.bankingsim.banking.entity.enums.DisputeStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DisputeCaseRepository extends JpaRepository<DisputeCase, Long> {

    Optional<DisputeCase> findByCaseNumber(String caseNumber);
    Page<DisputeCase> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);
    Page<DisputeCase> findByCustomerIdAndStatusOrderByCreatedAtDesc(Long customerId, DisputeStatus status, Pageable pageable);
    Page<DisputeCase> findByStatusOrderByCreatedAtDesc(DisputeStatus status, Pageable pageable);
    long countByStatus(DisputeStatus status);

    @Query("""
            select count(d) > 0 from DisputeCase d
            where d.customer.id = :customerId
              and d.transaction.id = :transactionId
              and d.status in :statuses
            """)
    boolean existsActiveByCustomerAndTransaction(@Param("customerId") Long customerId,
                                                 @Param("transactionId") Long transactionId,
                                                 @Param("statuses") List<DisputeStatus> statuses);

    @Query("""
            select d from DisputeCase d
            where d.status in :statuses and d.resolutionDueAt < :cutoff
            order by d.resolutionDueAt asc
            """)
    List<DisputeCase> findOverdue(@Param("statuses") List<DisputeStatus> statuses,
                                  @Param("cutoff") LocalDateTime cutoff,
                                  Pageable pageable);
}
