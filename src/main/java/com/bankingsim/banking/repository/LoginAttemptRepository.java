package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.LoginAttempt;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    long countByUsernameAndSuccessIsFalseAndAttemptedAtAfter(String username, LocalDateTime cutoff);
}
