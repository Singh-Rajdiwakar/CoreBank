package com.bankingsim.banking.dto.common;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationPreferenceResponse {
    private boolean transactionInAppEnabled;
    private boolean transactionEmailEnabled;
    private boolean transactionSmsEnabled;
    private boolean securityInAppEnabled;
    private boolean securityEmailEnabled;
    private boolean securitySmsEnabled;
    private String languageCode;
}
