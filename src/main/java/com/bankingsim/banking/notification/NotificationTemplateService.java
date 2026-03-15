package com.bankingsim.banking.notification;

import com.bankingsim.banking.config.AppProperties;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationTemplateService {

    private final AppProperties appProperties;

    public NotificationTemplateContent render(NotificationTemplateKey key, String languageCode, Map<String, String> variables) {
        String lang = normalizeLanguage(languageCode);
        return "HI".equals(lang) ? renderHindi(key, variables) : renderEnglish(key, variables);
    }

    public String normalizeLanguage(String languageCode) {
        if (languageCode == null || languageCode.isBlank()) {
            return appProperties.getNotifications().getTemplateDefaultLanguage().toUpperCase(Locale.ROOT);
        }
        String normalized = languageCode.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "HI", "HIN", "HINDI" -> "HI";
            default -> "EN";
        };
    }

    private NotificationTemplateContent renderEnglish(NotificationTemplateKey key, Map<String, String> v) {
        return switch (key) {
            case TRANSACTION_DEBIT -> new NotificationTemplateContent(
                    "Debit Alert",
                    "Amount " + value(v, "amount") + " debited. Ref=" + value(v, "reference")
                            + ", Type=" + value(v, "type")
                            + ", Account=" + value(v, "account")
            );
            case TRANSACTION_CREDIT -> new NotificationTemplateContent(
                    "Credit Alert",
                    "Amount " + value(v, "amount") + " credited. Ref=" + value(v, "reference")
                            + ", Type=" + value(v, "type")
                            + ", Account=" + value(v, "account")
            );
            case TRANSACTION_PENDING -> new NotificationTemplateContent(
                    "Transaction Pending",
                    "Transaction pending. Ref=" + value(v, "reference")
                            + ", Type=" + value(v, "type")
                            + ", Amount=" + value(v, "amount")
            );
            case TRANSACTION_ISSUE -> new NotificationTemplateContent(
                    "Transaction Alert",
                    "Transaction status " + value(v, "status")
                            + ". Ref=" + value(v, "reference")
                            + ", Type=" + value(v, "type")
                            + ", Amount=" + value(v, "amount")
                            + ", Reason=" + value(v, "reason")
            );
            case LOW_BALANCE -> new NotificationTemplateContent(
                    "Low Balance Alert",
                    "Available balance " + value(v, "balance")
                            + " is below minimum balance " + value(v, "minimumBalance")
                            + ". Account=" + value(v, "account")
                            + ", Ref=" + value(v, "reference")
            );
        };
    }

    private NotificationTemplateContent renderHindi(NotificationTemplateKey key, Map<String, String> v) {
        return switch (key) {
            case TRANSACTION_DEBIT -> new NotificationTemplateContent(
                    "Debit Alert",
                    value(v, "amount") + " rashi debit hui. Ref=" + value(v, "reference")
                            + ", Type=" + value(v, "type")
                            + ", Account=" + value(v, "account")
            );
            case TRANSACTION_CREDIT -> new NotificationTemplateContent(
                    "Credit Alert",
                    value(v, "amount") + " rashi credit hui. Ref=" + value(v, "reference")
                            + ", Type=" + value(v, "type")
                            + ", Account=" + value(v, "account")
            );
            case TRANSACTION_PENDING -> new NotificationTemplateContent(
                    "Transaction Pending",
                    "Transaction pending hai. Ref=" + value(v, "reference")
                            + ", Type=" + value(v, "type")
                            + ", Amount=" + value(v, "amount")
            );
            case TRANSACTION_ISSUE -> new NotificationTemplateContent(
                    "Transaction Alert",
                    "Transaction status " + value(v, "status")
                            + ". Ref=" + value(v, "reference")
                            + ", Type=" + value(v, "type")
                            + ", Amount=" + value(v, "amount")
                            + ", Reason=" + value(v, "reason")
            );
            case LOW_BALANCE -> new NotificationTemplateContent(
                    "Low Balance Alert",
                    "Available balance " + value(v, "balance")
                            + " minimum balance " + value(v, "minimumBalance")
                            + " se kam hai. Account=" + value(v, "account")
                            + ", Ref=" + value(v, "reference")
            );
        };
    }

    private String value(Map<String, String> variables, String key) {
        if (variables == null) {
            return "";
        }
        return variables.getOrDefault(key, "");
    }
}
