package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.SystemConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {
    Optional<SystemConfig> findByConfigKey(String key);
}
