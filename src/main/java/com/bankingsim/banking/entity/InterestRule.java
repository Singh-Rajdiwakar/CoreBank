package com.bankingsim.banking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "interest_rules")
public class InterestRule extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_type", nullable = false, unique = true, length = 80)
    private String productType;

    @Column(name = "annual_rate", nullable = false, precision = 8, scale = 4)
    private BigDecimal annualRate;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
