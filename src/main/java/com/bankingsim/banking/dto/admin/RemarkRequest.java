package com.bankingsim.banking.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RemarkRequest {
    @NotBlank
    private String remarks;
}
