package com.bankingsim.banking.mapper;

import com.bankingsim.banking.dto.account.CardResponse;
import com.bankingsim.banking.entity.Card;

public final class CardMapper {

    private CardMapper() {
    }

    public static CardResponse toResponse(Card card) {
        return CardResponse.builder()
                .id(card.getId())
                .maskedNumber(card.getMaskedNumber())
                .cardHolderName(card.getCardHolderName())
                .status(card.getStatus())
                .expiryDate(card.getExpiryDate())
                .domesticEnabled(card.isDomesticEnabled())
                .internationalEnabled(card.isInternationalEnabled())
                .contactlessEnabled(card.isContactlessEnabled())
                .build();
    }
}
