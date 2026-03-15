package com.bankingsim.banking.util;

import java.math.BigDecimal;

public final class MoneyUtils {

    private MoneyUtils() {
    }

    public static BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    public static BigDecimal percent(BigDecimal amount, BigDecimal percent) {
        return amount.multiply(percent).divide(BigDecimal.valueOf(100));
    }
}
