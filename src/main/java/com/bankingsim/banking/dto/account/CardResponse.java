package com.bankingsim.banking.dto.account;

import com.bankingsim.banking.entity.enums.CardStatus;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CardResponse {
    private Long id;
    private String maskedNumber;
    private String cardHolderName;
    private CardStatus status;
    private LocalDate expiryDate;
    private boolean domesticEnabled;
    private boolean internationalEnabled;
    private boolean contactlessEnabled;
}
