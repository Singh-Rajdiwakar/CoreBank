package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.RefreshToken;
import com.bankingsim.banking.entity.User;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    long deleteByUser(User user);
    long deleteByExpiresAtBefore(LocalDateTime cutoff);
}
