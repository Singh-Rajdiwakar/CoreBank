package com.bankingsim.banking.dto.customer;

import com.bankingsim.banking.entity.enums.EmploymentType;
import com.bankingsim.banking.entity.enums.Gender;
import com.bankingsim.banking.entity.enums.IncomeRange;
import com.bankingsim.banking.entity.enums.RiskProfile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CustomerCreateRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10,15}$")
    private String phone;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotNull
    @Past
    private LocalDate dob;

    private Gender gender;

    @NotNull
    private Long branchId;

    @NotBlank
    private String addressLine1;

    private String addressLine2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String postalCode;

    @NotBlank
    private String country;

    private String pan;
    private String aadhaar;
    private String passport;

    private String nomineeName;
    private String nomineeRelationship;
    private String nomineeContact;

    private EmploymentType employmentType;
    private String employerName;
    private IncomeRange incomeRange;
    private RiskProfile riskProfile;
}
