package com.bankingsim.banking.notification;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.NotificationChannel;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationChannelDispatcher {

    private final AppProperties appProperties;

    public NotificationDispatchResult dispatch(User user, NotificationChannel channel, String title, String message) {
        return switch (channel) {
            case IN_APP -> NotificationDispatchResult.sent("INAPP-" + shortId());
            case EMAIL -> dispatchEmail(user, title, message);
            case SMS -> dispatchSms(user, title, message);
        };
    }

    private NotificationDispatchResult dispatchEmail(User user, String title, String message) {
        if (!appProperties.getNotifications().isEmailEnabled()) {
            log.warn("EMAIL notification skipped globally. userId={}", user.getId());
            return NotificationDispatchResult.failed("EMAIL_DISABLED", false);
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            log.warn("EMAIL notification failed due to missing address. userId={}", user.getId());
            return NotificationDispatchResult.failed("EMAIL_MISSING", false);
        }
        if (shouldFailTransiently(appProperties.getNotifications().getEmailFailureRatePercent())) {
            log.warn("EMAIL transient failure simulated. userId={}", user.getId());
            return NotificationDispatchResult.failed("EMAIL_PROVIDER_TIMEOUT", true);
        }
        String providerMessageId = "EML-" + shortId();
        log.info("EMAIL_SIMULATION to={} subject={} providerMessageId={} message={}",
                user.getEmail(), title, providerMessageId, safeMessage(message));
        return NotificationDispatchResult.sent(providerMessageId);
    }

    private NotificationDispatchResult dispatchSms(User user, String title, String message) {
        if (!appProperties.getNotifications().isSmsEnabled()) {
            log.warn("SMS notification skipped globally. userId={}", user.getId());
            return NotificationDispatchResult.failed("SMS_DISABLED", false);
        }
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            log.warn("SMS notification failed due to missing phone. userId={}", user.getId());
            return NotificationDispatchResult.failed("SMS_MISSING", false);
        }
        if (shouldFailTransiently(appProperties.getNotifications().getSmsFailureRatePercent())) {
            log.warn("SMS transient failure simulated. userId={}", user.getId());
            return NotificationDispatchResult.failed("SMS_PROVIDER_TIMEOUT", true);
        }
        String providerMessageId = "SMS-" + shortId();
        log.info("SMS_SIMULATION to={} title={} providerMessageId={} message={}",
                user.getPhone(), title, providerMessageId, safeMessage(message));
        return NotificationDispatchResult.sent(providerMessageId);
    }

    private String safeMessage(String message) {
        if (message == null) {
            return "";
        }
        String sanitized = message.replace('\n', ' ').replace('\r', ' ');
        if (sanitized.length() <= 280) {
            return sanitized;
        }
        return sanitized.substring(0, 280) + "...";
    }

    private boolean shouldFailTransiently(int failureRatePercent) {
        int bounded = Math.max(0, Math.min(100, failureRatePercent));
        if (bounded == 0) {
            return false;
        }
        return ThreadLocalRandom.current().nextInt(100) < bounded;
    }

    private String shortId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}
