package com.bankingsim.banking.service;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.entity.FeeRule;
import com.bankingsim.banking.entity.enums.TransferMode;
import com.bankingsim.banking.repository.FeeRuleRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PricingService {

    private static final String CODE_INTERNAL_TRANSFER = "INTERNAL_TRANSFER";
    private static final String CODE_EXTERNAL_TRANSFER = "EXTERNAL_TRANSFER";
    private static final String CODE_ATM_WITHDRAWAL = "ATM_WITHDRAWAL";
    private static final String CODE_MIN_BALANCE_PENALTY = "MIN_BALANCE_PENALTY";
    private static final String CODE_ACCOUNT_MAINTENANCE = "ACCOUNT_MAINTENANCE";
    private static final String CODE_OVERDRAFT_DAILY_INTEREST_PERCENT = "OVERDRAFT_DAILY_INTEREST_PERCENT";

    private final FeeRuleRepository feeRuleRepository;
    private final AppProperties appProperties;

    public BigDecimal transferCharge(TransferMode mode, BigDecimal amount) {
        return switch (mode) {
            case SELF, INTERNAL -> calculateFee(CODE_INTERNAL_TRANSFER, amount, appProperties.getFees().getInternalTransferFee());
            case BENEFICIARY, EXTERNAL, NEFT, IMPS, RTGS, UPI, SCHEDULED, RECURRING, BULK ->
                    calculateFee(CODE_EXTERNAL_TRANSFER, amount, appProperties.getFees().getExternalTransferFee());
        };
    }

    public BigDecimal atmWithdrawalCharge(BigDecimal amount) {
        return calculateFee(CODE_ATM_WITHDRAWAL, amount, appProperties.getFees().getAtmWithdrawalFee());
    }

    public BigDecimal minBalancePenalty() {
        return calculateFee(CODE_MIN_BALANCE_PENALTY, BigDecimal.ZERO, appProperties.getFees().getMinBalancePenalty());
    }

    public BigDecimal accountMaintenanceCharge() {
        return calculateFee(CODE_ACCOUNT_MAINTENANCE, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    public BigDecimal overdraftDailyInterestPercent() {
        FeeRule rule = feeRuleRepository.findByCodeAndActiveTrue(CODE_OVERDRAFT_DAILY_INTEREST_PERCENT).orElse(null);
        if (rule != null) {
            BigDecimal percent = rule.getPercentage() == null ? BigDecimal.ZERO : rule.getPercentage();
            if (percent.compareTo(BigDecimal.ZERO) > 0) {
                return percent;
            }
            if (rule.getAmount() != null && rule.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                return rule.getAmount();
            }
        }
        return BigDecimal.valueOf(0.05);
    }

    private BigDecimal calculateFee(String code, BigDecimal amountBase, BigDecimal fallbackFlat) {
        FeeRule rule = feeRuleRepository.findByCodeAndActiveTrue(code).orElse(null);
        if (rule == null) {
            return fallbackFlat == null ? BigDecimal.ZERO : fallbackFlat.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal flat = rule.getAmount() == null ? BigDecimal.ZERO : rule.getAmount();
        BigDecimal percent = rule.getPercentage() == null ? BigDecimal.ZERO : rule.getPercentage();
        BigDecimal percentageComponent = BigDecimal.ZERO;

        if (amountBase != null && amountBase.compareTo(BigDecimal.ZERO) > 0 && percent.compareTo(BigDecimal.ZERO) > 0) {
            percentageComponent = amountBase.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        return flat.add(percentageComponent).setScale(2, RoundingMode.HALF_UP);
    }
}
