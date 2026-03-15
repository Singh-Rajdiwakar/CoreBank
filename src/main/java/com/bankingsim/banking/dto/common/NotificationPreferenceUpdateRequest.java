package com.bankingsim.banking.dto.common;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class NotificationPreferenceUpdateRequest {
    private Boolean transactionInAppEnabled;
    private Boolean transactionEmailEnabled;
    private Boolean transactionSmsEnabled;
    private Boolean securityInAppEnabled;
    private Boolean securityEmailEnabled;
    private Boolean securitySmsEnabled;

    @Pattern(regexp = "^[A-Za-z]{2,5}$", message = "languageCode must be a valid code like EN or HI")
    private String languageCode;
}
