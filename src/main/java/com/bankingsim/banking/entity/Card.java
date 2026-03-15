package com.bankingsim.banking.entity;

import com.bankingsim.banking.entity.enums.CardStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "cards")
public class Card extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "masked_number", nullable = false, unique = true, length = 25)
    private String maskedNumber;

    @Column(name = "card_holder_name", nullable = false, length = 150)
    private String cardHolderName;

    @Column(name = "pin_hash", length = 255)
    private String pinHash;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CardStatus status = CardStatus.REQUESTED;

    @Column(name = "daily_limit", nullable = false, precision = 19, scale = 2)
    private BigDecimal dailyLimit;

    @Column(name = "domestic_enabled", nullable = false)
    private boolean domesticEnabled = true;

    @Column(name = "international_enabled", nullable = false)
    private boolean internationalEnabled;

    @Column(name = "contactless_enabled", nullable = false)
    private boolean contactlessEnabled = true;
}
