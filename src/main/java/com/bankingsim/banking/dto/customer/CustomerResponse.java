package com.bankingsim.banking.dto.customer;

import com.bankingsim.banking.entity.enums.CustomerStatus;
import com.bankingsim.banking.entity.enums.KycStatus;
import com.bankingsim.banking.entity.enums.RiskProfile;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CustomerResponse {
    private Long id;
    private String customerCode;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dob;
    private Long branchId;
    private String branchCode;
    private KycStatus kycStatus;
    private RiskProfile riskProfile;
    private CustomerStatus status;
    private String address;
}
