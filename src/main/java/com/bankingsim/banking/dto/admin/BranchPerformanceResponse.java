package com.bankingsim.banking.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BranchPerformanceResponse {
    private Long branchId;
    private String branchCode;
    private long customers;
    private long accounts;
    private String transferVolume;
}
