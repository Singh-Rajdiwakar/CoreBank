package com.bankingsim.banking.dto.auth;

import com.bankingsim.banking.entity.enums.OtpPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotNull
    private OtpPurpose purpose;

    @NotBlank
    private String otp;
}
