package com.bankingsim.banking.mapper;

import com.bankingsim.banking.dto.account.BeneficiaryResponse;
import com.bankingsim.banking.entity.Beneficiary;

public final class BeneficiaryMapper {

    private BeneficiaryMapper() {
    }

    public static BeneficiaryResponse toResponse(Beneficiary beneficiary) {
        return BeneficiaryResponse.builder()
                .id(beneficiary.getId())
                .beneficiaryType(beneficiary.getBeneficiaryType())
                .nickname(beneficiary.getNickname())
                .name(beneficiary.getName())
                .accountNumber(beneficiary.getAccountNumber())
                .ifscCode(beneficiary.getIfscCode())
                .bankName(beneficiary.getBankName())
                .dailyLimit(beneficiary.getDailyLimit())
                .status(beneficiary.getStatus())
                .coolingUntil(beneficiary.getCoolingUntil())
                .build();
    }
}
