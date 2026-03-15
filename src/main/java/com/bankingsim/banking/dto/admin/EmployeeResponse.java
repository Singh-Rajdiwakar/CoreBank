package com.bankingsim.banking.dto.admin;

import com.bankingsim.banking.entity.enums.EmployeeStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmployeeResponse {
    private Long id;
    private Long userId;
    private String username;
    private Long branchId;
    private String employeeCode;
    private EmployeeStatus status;
    private boolean manager;
}
