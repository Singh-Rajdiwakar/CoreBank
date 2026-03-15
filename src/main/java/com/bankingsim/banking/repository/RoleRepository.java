package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.Role;
import com.bankingsim.banking.entity.enums.RoleType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
