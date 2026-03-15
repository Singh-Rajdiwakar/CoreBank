package com.bankingsim.banking.config;

import java.math.BigDecimal;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Security security = new Security();
    private Limits limits = new Limits();
    private Fees fees = new Fees();
    private Notifications notifications = new Notifications();
    private Disputes disputes = new Disputes();

    @Data
    public static class Security {
        private Jwt jwt = new Jwt();
        private Password password = new Password();
        private Otp otp = new Otp();
        private Cors cors = new Cors();

        @Data
        public static class Jwt {
            private String issuer;
            private int accessTokenExpiryMinutes;
            private int refreshTokenExpiryDays;
            private String secret;
        }

        @Data
        public static class Password {
            private int expiryDays;
            private int maxFailedAttempts;
        }

        @Data
        public static class Otp {
            private int expiryMinutes;
        }

        @Data
        public static class Cors {
            private String allowedOrigins;
        }
    }

    @Data
    public static class Limits {
        private int loginRequestsPerMinute;
        private int transferRequestsPerMinute;
        private BigDecimal transferPerTransactionLimit;
        private BigDecimal transferDailyLimit;
        private BigDecimal transferMonthlyLimit;
        private BigDecimal maxAtmWithdrawalPerDay;
        private int beneficiaryCoolingPeriodHours;
        private BigDecimal highValueTransferThreshold;
        private BigDecimal makerCheckerThreshold;
        private BigDecimal overdraftDefaultLimit;
        private BigDecimal savingsMinimumBalance;
        private int dormancyMonths;
        private int autoBlockFraudScore;
    }

    @Data
    public static class Fees {
        private BigDecimal internalTransferFee;
        private BigDecimal externalTransferFee;
        private BigDecimal atmWithdrawalFee;
        private BigDecimal minBalancePenalty;
        private BigDecimal emiLatePenaltyPercent;
        private BigDecimal fdPrematureWithdrawalPenaltyPercent;
    }

    @Data
    public static class Notifications {
        private boolean emailEnabled = true;
        private boolean smsEnabled = true;
        private int maxRetries = 3;
        private int retryDelaySeconds = 30;
        private int retryBatchSize = 100;
        private int emailFailureRatePercent = 0;
        private int smsFailureRatePercent = 0;
        private String templateDefaultLanguage = "EN";
        private int retentionDays = 180;
    }

    @Data
    public static class Disputes {
        private int raiseWindowDays = 180;
        private int zeroLiabilityDays = 3;
        private int limitedLiabilityDays = 7;
        private int provisionalCreditDays = 10;
        private int resolutionSlaDays = 90;
        private int overdueEscalationBatchSize = 200;
    }
}
