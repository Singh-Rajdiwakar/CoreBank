package com.bankingsim.banking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notification_preferences")
public class NotificationPreference extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "transaction_in_app_enabled", nullable = false)
    private boolean transactionInAppEnabled = true;

    @Column(name = "transaction_email_enabled", nullable = false)
    private boolean transactionEmailEnabled = true;

    @Column(name = "transaction_sms_enabled", nullable = false)
    private boolean transactionSmsEnabled = true;

    @Column(name = "security_in_app_enabled", nullable = false)
    private boolean securityInAppEnabled = true;

    @Column(name = "security_email_enabled", nullable = false)
    private boolean securityEmailEnabled = true;

    @Column(name = "security_sms_enabled", nullable = false)
    private boolean securitySmsEnabled = true;

    @Column(name = "language_code", nullable = false, length = 5)
    private String languageCode = "EN";
}
