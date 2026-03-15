package com.bankingsim.banking.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBranchRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String branchCode;
    @NotBlank
    private String ifscCode;
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
    private String contactEmail;
    @NotBlank
    private String contactPhone;
    private Long managerUserId;
}
