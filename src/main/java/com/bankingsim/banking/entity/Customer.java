package com.bankingsim.banking.entity;

import com.bankingsim.banking.entity.enums.CustomerStatus;
import com.bankingsim.banking.entity.enums.EmploymentType;
import com.bankingsim.banking.entity.enums.Gender;
import com.bankingsim.banking.entity.enums.IncomeRange;
import com.bankingsim.banking.entity.enums.KycStatus;
import com.bankingsim.banking.entity.enums.RiskProfile;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "customers")
public class Customer extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_code", nullable = false, unique = true, length = 50)
    private String customerCode;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Column(name = "nationality", length = 50)
    private String nationality;

    @Column(name = "pan", unique = true, length = 20)
    private String pan;

    @Column(name = "aadhaar", unique = true, length = 20)
    private String aadhaar;

    @Column(name = "passport", unique = true, length = 20)
    private String passport;

    @Column(name = "address_line1", nullable = false, length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "postal_code", nullable = false, length = 20)
    private String postalCode;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "nominee_name", length = 150)
    private String nomineeName;

    @Column(name = "nominee_relationship", length = 100)
    private String nomineeRelationship;

    @Column(name = "nominee_contact", length = 20)
    private String nomineeContact;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 30)
    private EmploymentType employmentType;

    @Column(name = "employer_name", length = 150)
    private String employerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "income_range", length = 30)
    private IncomeRange incomeRange;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_profile", nullable = false, length = 20)
    private RiskProfile riskProfile = RiskProfile.LOW;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", nullable = false, length = 20)
    private KycStatus kycStatus = KycStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CustomerStatus status = CustomerStatus.ACTIVE;

    @Column(name = "transaction_pin_hash", length = 255)
    private String transactionPinHash;

    @Column(name = "archived", nullable = false)
    private boolean archived = false;
}
