package com.bankingsim.banking.dto.customer;

import com.bankingsim.banking.entity.enums.CustomerStatus;
import com.bankingsim.banking.entity.enums.EmploymentType;
import com.bankingsim.banking.entity.enums.IncomeRange;
import com.bankingsim.banking.entity.enums.KycStatus;
import com.bankingsim.banking.entity.enums.RiskProfile;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CustomerUpdateRequest {

    private String firstName;
    private String lastName;

    @Past
    private LocalDate dob;

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    private String nomineeName;
    private String nomineeRelationship;
    private String nomineeContact;

    private EmploymentType employmentType;
    private String employerName;
    private IncomeRange incomeRange;
    private RiskProfile riskProfile;
    private KycStatus kycStatus;
    private CustomerStatus status;
}
