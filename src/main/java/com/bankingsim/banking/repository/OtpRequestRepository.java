package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.OtpRequest;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.OtpPurpose;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpRequestRepository extends JpaRepository<OtpRequest, Long> {
    Optional<OtpRequest> findTopByUserAndPurposeAndConsumedIsFalseOrderByCreatedAtDesc(User user, OtpPurpose purpose);
    long deleteByExpiresAtBefore(LocalDateTime cutoff);
}
