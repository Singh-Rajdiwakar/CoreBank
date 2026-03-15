package com.bankingsim.banking.dto.auth;

import com.bankingsim.banking.entity.enums.OtpPurpose;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GenerateOtpRequest {

    @NotNull
    private OtpPurpose purpose;

    private String channel = "SMS";
}
