package com.bankingsim.banking.dto.account;

import lombok.Data;

@Data
public class CardSettingsRequest {
    private Boolean domesticEnabled;
    private Boolean internationalEnabled;
    private Boolean contactlessEnabled;
}
