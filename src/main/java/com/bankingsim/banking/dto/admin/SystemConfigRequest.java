package com.bankingsim.banking.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SystemConfigRequest {
    @NotBlank
    private String key;
    @NotBlank
    private String value;
    private String description;
}
