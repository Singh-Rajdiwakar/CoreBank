package com.bankingsim.banking.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateEmployeeRequest {
    @NotNull
    private Long userId;
    @NotNull
    private Long branchId;
    @NotBlank
    private String employeeCode;
    private boolean manager;
}
