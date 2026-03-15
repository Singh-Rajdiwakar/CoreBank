package com.bankingsim.banking.dto.admin;

import com.bankingsim.banking.entity.enums.BranchStatus;
import lombok.Data;

@Data
public class UpdateBranchRequest {
    private String name;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String contactEmail;
    private String contactPhone;
    private BranchStatus status;
    private Long managerUserId;
}
