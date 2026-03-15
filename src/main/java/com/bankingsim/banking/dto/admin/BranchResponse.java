package com.bankingsim.banking.dto.admin;

import com.bankingsim.banking.entity.enums.BranchStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BranchResponse {
    private Long id;
    private String name;
    private String branchCode;
    private String ifscCode;
    private String city;
    private String state;
    private String contactEmail;
    private String contactPhone;
    private BranchStatus status;
    private Long managerUserId;
}
