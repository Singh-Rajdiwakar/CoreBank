package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.enums.TransactionChannel;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.entity.enums.TransactionType;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    Optional<BankTransaction> findByReferenceNumber(String referenceNumber);
    Optional<BankTransaction> findByIdempotencyKey(String idempotencyKey);
    Page<BankTransaction> findBySourceAccountIdOrDestinationAccountId(Long sourceAccountId, Long destinationAccountId, Pageable pageable);
    Page<BankTransaction> findBySourceAccountIdAndChannelOrderByInitiatedAtDesc(Long sourceAccountId, TransactionChannel channel, Pageable pageable);
    List<BankTransaction> findTop20ByInitiatedByOrderByInitiatedAtDesc(Long initiatedBy);
    Page<BankTransaction> findByStatusInOrderByInitiatedAtDesc(List<TransactionStatus> statuses, Pageable pageable);
    Page<BankTransaction> findByAmountGreaterThanEqualOrderByAmountDesc(BigDecimal threshold, Pageable pageable);
    List<BankTransaction> findByStatusAndScheduledForBefore(TransactionStatus status, LocalDateTime time);
    long countByInitiatedAtAfter(LocalDateTime start);
    long countByInitiatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByInitiatedAtBetweenAndStatus(LocalDateTime start, LocalDateTime end, TransactionStatus status);

    @Query("""
            select t from BankTransaction t
            where (t.sourceAccount.id = :accountId or t.destinationAccount.id = :accountId)
              and (:fromDate is null or t.valueDate >= :fromDate)
              and (:toDate is null or t.valueDate <= :toDate)
            order by t.initiatedAt desc
            """)
    Page<BankTransaction> findStatementForAccount(@Param("accountId") Long accountId,
                                                  @Param("fromDate") LocalDate fromDate,
                                                  @Param("toDate") LocalDate toDate,
                                                  Pageable pageable);

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.initiatedBy = :userId and t.status = 'SUCCESS' and t.initiatedAt >= :from and t.transactionType in ('INTERNAL_TRANSFER','BENEFICIARY_TRANSFER','NEFT','IMPS','RTGS','UPI','INTER_BRANCH_TRANSFER','SCHEDULED_TRANSFER')
            """)
    BigDecimal getTotalSuccessfulTransfers(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    @Query("""
            select count(t) from BankTransaction t
            where t.initiatedBy = :userId and t.initiatedAt >= :from
            """)
    long countTransactionsByInitiatedByAndInitiatedAtAfter(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    @Query("""
            select count(t) from BankTransaction t
            where t.initiatedBy = :userId and t.initiatedAt >= :from and t.status = 'FAILED'
            """)
    long countFailedTransactionsByUserSince(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    @Query("""
            select coalesce(avg(t.amount),0) from BankTransaction t
            where t.initiatedBy = :userId and t.status = 'SUCCESS' and t.initiatedAt >= :from
            """)
    BigDecimal averageSuccessfulAmountByUserSince(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    @Query("""
            select coalesce(sum(t.amount + t.charges + t.tax),0) from BankTransaction t
            where t.sourceAccount.id = :accountId and t.status = 'SUCCESS' and t.transactionType = 'WITHDRAW' and t.initiatedAt >= :from
            """)
    BigDecimal sumWithdrawalsByAccountSince(@Param("accountId") Long accountId, @Param("from") LocalDateTime from);

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.sourceAccount.id = :accountId
              and t.status = 'SUCCESS'
              and t.channel = 'ATM'
              and t.initiatedAt >= :from
              and t.description like concat('%', :cardTag, '%')
            """)
    BigDecimal sumAtmUsageByCardSince(@Param("accountId") Long accountId,
                                      @Param("cardTag") String cardTag,
                                      @Param("from") LocalDateTime from);

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.status = 'SUCCESS' and t.transactionType = :type
            """)
    BigDecimal sumSuccessfulAmountByType(@Param("type") TransactionType type);

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.status = 'SUCCESS'
              and t.transactionType in ('INTERNAL_TRANSFER','INTER_BRANCH_TRANSFER','BENEFICIARY_TRANSFER','EXTERNAL_TRANSFER','WALLET_TRANSFER','SCHEDULED_TRANSFER','BULK_SALARY_CREDIT','NEFT','IMPS','RTGS','UPI')
            """)
    BigDecimal sumSuccessfulTransferAmount();

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.status = 'SUCCESS'
              and t.transactionType in ('INTERNAL_TRANSFER','INTER_BRANCH_TRANSFER','BENEFICIARY_TRANSFER','EXTERNAL_TRANSFER','WALLET_TRANSFER','SCHEDULED_TRANSFER','BULK_SALARY_CREDIT','NEFT','IMPS','RTGS','UPI')
              and t.sourceAccount is not null
              and t.sourceAccount.branch.id = :branchId
            """)
    BigDecimal sumSuccessfulTransferAmountBySourceBranch(@Param("branchId") Long branchId);

    @Query("""
            select coalesce(sum(t.charges + t.tax),0) from BankTransaction t
            where t.status = 'SUCCESS'
            """)
    BigDecimal sumChargesAndTaxRevenue();

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.initiatedAt >= :start and t.initiatedAt < :end
            """)
    BigDecimal sumAmountByInitiatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.status = 'SUCCESS'
              and t.sourceAccount is not null
              and t.sourceAccount.id in :accountIds
              and t.initiatedAt >= :from
            """)
    BigDecimal sumSuccessfulDebitsForAccountsSince(@Param("accountIds") List<Long> accountIds, @Param("from") LocalDateTime from);

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.status = 'SUCCESS'
              and t.destinationAccount is not null
              and t.destinationAccount.id in :accountIds
              and t.initiatedAt >= :from
            """)
    BigDecimal sumSuccessfulCreditsForAccountsSince(@Param("accountIds") List<Long> accountIds, @Param("from") LocalDateTime from);

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.status = 'SUCCESS'
              and t.initiatedAt >= :start and t.initiatedAt < :end
              and t.sourceAccount is not null
            """)
    BigDecimal sumSuccessfulDebitsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
            select coalesce(sum(t.amount),0) from BankTransaction t
            where t.status = 'SUCCESS'
              and t.initiatedAt >= :start and t.initiatedAt < :end
              and t.destinationAccount is not null
            """)
    BigDecimal sumSuccessfulCreditsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
