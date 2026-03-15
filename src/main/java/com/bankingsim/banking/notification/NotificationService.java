package com.bankingsim.banking.notification;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.common.NotificationDeliveryCallbackRequest;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.common.NotificationPreferenceResponse;
import com.bankingsim.banking.dto.common.NotificationPreferenceUpdateRequest;
import com.bankingsim.banking.dto.common.NotificationQueueSummaryResponse;
import com.bankingsim.banking.dto.common.NotificationResponse;
import com.bankingsim.banking.entity.Notification;
import com.bankingsim.banking.entity.NotificationPreference;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.NotificationChannel;
import com.bankingsim.banking.entity.enums.NotificationStatus;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.repository.NotificationPreferenceRepository;
import com.bankingsim.banking.repository.NotificationRepository;
import com.bankingsim.banking.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final NotificationChannelDispatcher channelDispatcher;
    private final NotificationTemplateService templateService;
    private final AppProperties appProperties;
    private final ApplicationEventPublisher eventPublisher;

    public void publish(Long userId, NotificationType type, String title, String message) {
        eventPublisher.publishEvent(new NotificationEvent(userId, type, title, message));
    }

    public void publishTemplate(Long userId,
                                NotificationType type,
                                NotificationTemplateKey templateKey,
                                Map<String, String> variables) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for notification"));
        NotificationPreference preference = resolvePreference(user);
        NotificationTemplateContent content = templateService.render(templateKey, preference.getLanguageCode(), variables);
        publish(userId, type, content.title(), content.message());
    }

    public void send(Long userId, NotificationType type, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for notification"));
        NotificationPreference preference = resolvePreference(user);

        if (shouldSend(type, NotificationChannel.IN_APP, preference)) {
            saveNotification(user, type, title, message, NotificationChannel.IN_APP);
        }
        if (shouldSend(type, NotificationChannel.EMAIL, preference)) {
            saveNotification(user, type, title, message, NotificationChannel.EMAIL);
        }
        if (shouldSend(type, NotificationChannel.SMS, preference)) {
            saveNotification(user, type, title, message, NotificationChannel.SMS);
        }

        log.info("Notification simulated userId={} title={}", userId, title);
    }

    public PageResponse<NotificationResponse> listMyNotifications(Long userId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 200));
        Page<Notification> result = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId,
                PageRequest.of(safePage, safeSize)
        );
        return PageResponse.<NotificationResponse>builder()
                .content(result.map(this::toResponse).getContent())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.isReadFlag()) {
            notification.setReadFlag(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFlagFalse(userId);
    }

    public PageResponse<NotificationResponse> listByStatus(NotificationStatus status, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 200));
        Page<Notification> result = notificationRepository.findByStatusOrderByCreatedAtDesc(
                status,
                PageRequest.of(safePage, safeSize)
        );
        return PageResponse.<NotificationResponse>builder()
                .content(result.map(this::toResponse).getContent())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    public NotificationQueueSummaryResponse queueSummary() {
        long pending = notificationRepository.countByStatus(NotificationStatus.PENDING);
        long failed = notificationRepository.countByStatus(NotificationStatus.FAILED);
        long sent = notificationRepository.countByStatus(NotificationStatus.SENT);
        long due = notificationRepository.countByStatusAndNextRetryAtLessThanEqual(NotificationStatus.PENDING, LocalDateTime.now());
        return NotificationQueueSummaryResponse.builder()
                .pendingCount(pending)
                .failedCount(failed)
                .sentCount(sent)
                .dueRetryCount(due)
                .build();
    }

    public NotificationPreferenceResponse getPreferences(Long userId) {
        NotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> resolvePreference(userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"))));
        return toPreferenceResponse(preference);
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(Long userId, NotificationPreferenceUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        NotificationPreference preference = resolvePreference(user);

        if (request.getTransactionInAppEnabled() != null) {
            preference.setTransactionInAppEnabled(request.getTransactionInAppEnabled());
        }
        if (request.getTransactionEmailEnabled() != null) {
            preference.setTransactionEmailEnabled(request.getTransactionEmailEnabled());
        }
        if (request.getTransactionSmsEnabled() != null) {
            preference.setTransactionSmsEnabled(request.getTransactionSmsEnabled());
        }
        if (request.getSecurityInAppEnabled() != null) {
            preference.setSecurityInAppEnabled(request.getSecurityInAppEnabled());
        }
        if (request.getSecurityEmailEnabled() != null) {
            preference.setSecurityEmailEnabled(request.getSecurityEmailEnabled());
        }
        if (request.getSecuritySmsEnabled() != null) {
            preference.setSecuritySmsEnabled(request.getSecuritySmsEnabled());
        }
        if (request.getLanguageCode() != null && !request.getLanguageCode().isBlank()) {
            preference.setLanguageCode(templateService.normalizeLanguage(request.getLanguageCode()));
        }

        return toPreferenceResponse(preferenceRepository.save(preference));
    }

    @Transactional
    public int retryPendingNotifications() {
        return retryPendingNotifications(null);
    }

    @Transactional
    public int retryPendingNotifications(NotificationChannel channel) {
        if (channel == NotificationChannel.IN_APP) {
            throw new ForbiddenOperationException("Retry by channel supports only EMAIL or SMS");
        }
        int batchSize = Math.max(1, Math.min(appProperties.getNotifications().getRetryBatchSize(), 500));
        List<Notification> due;
        if (channel == null) {
            due = notificationRepository.findByStatusAndNextRetryAtLessThanEqualOrderByCreatedAtAsc(
                    NotificationStatus.PENDING,
                    LocalDateTime.now(),
                    PageRequest.of(0, batchSize)
            );
        } else {
            due = notificationRepository.findByStatusAndChannelAndNextRetryAtLessThanEqualOrderByCreatedAtAsc(
                    NotificationStatus.PENDING,
                    channel,
                    LocalDateTime.now(),
                    PageRequest.of(0, batchSize)
            );
        }
        for (Notification notification : due) {
            retrySingleNotification(notification);
        }
        notificationRepository.saveAll(due);
        return due.size();
    }

    @Transactional(readOnly = true)
    public String exportDeadLetterCsv(NotificationChannel channel, int limit) {
        if (channel == NotificationChannel.IN_APP) {
            throw new ForbiddenOperationException("Dead-letter export is supported only for EMAIL or SMS channels");
        }

        int safeLimit = Math.max(1, Math.min(limit, 5000));
        PageRequest pageRequest = PageRequest.of(0, safeLimit);
        Page<Notification> page = channel == null
                ? notificationRepository.findByStatusAndChannelInOrderByCreatedAtDesc(
                        NotificationStatus.FAILED,
                        List.of(NotificationChannel.EMAIL, NotificationChannel.SMS),
                        pageRequest
                )
                : notificationRepository.findByStatusAndChannelOrderByCreatedAtDesc(
                        NotificationStatus.FAILED,
                        channel,
                        pageRequest
                );

        StringBuilder csv = new StringBuilder();
        csv.append("notificationId,userId,channel,type,status,attemptCount,lastError,nextRetryAt,providerMessageId,createdAt")
                .append('\n');

        for (Notification n : page.getContent()) {
            csv.append(csvValue(n.getId()))
                    .append(',').append(csvValue(n.getUser() == null ? null : n.getUser().getId()))
                    .append(',').append(csvValue(n.getChannel()))
                    .append(',').append(csvValue(n.getType()))
                    .append(',').append(csvValue(n.getStatus()))
                    .append(',').append(csvValue(n.getAttemptCount()))
                    .append(',').append(csvValue(n.getLastError()))
                    .append(',').append(csvValue(n.getNextRetryAt()))
                    .append(',').append(csvValue(n.getProviderMessageId()))
                    .append(',').append(csvValue(n.getCreatedAt()))
                    .append('\n');
        }
        return csv.toString();
    }

    @Transactional
    public long cleanupOldSentNotifications() {
        int retentionDays = Math.max(30, appProperties.getNotifications().getRetentionDays());
        LocalDateTime threshold = LocalDateTime.now().minusDays(retentionDays);
        return notificationRepository.deleteByStatusAndCreatedAtBefore(NotificationStatus.SENT, threshold);
    }

    @Transactional
    public NotificationResponse processDeliveryCallback(NotificationDeliveryCallbackRequest request) {
        Notification notification = notificationRepository.findById(request.getNotificationId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (notification.getProviderMessageId() != null
                && !notification.getProviderMessageId().equals(request.getProviderMessageId())) {
            throw new ForbiddenOperationException("Provider message id mismatch");
        }

        String status = request.getStatus().trim().toUpperCase(Locale.ROOT);
        if ("SENT".equals(status) || "DELIVERED".equals(status)) {
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(notification.getSentAt() == null ? LocalDateTime.now() : notification.getSentAt());
            notification.setDeliveredAt(LocalDateTime.now());
            notification.setNextRetryAt(null);
            notification.setLastError(null);
            notification.setProviderMessageId(request.getProviderMessageId());
        } else if ("FAILED".equals(status)) {
            notification.setLastError(request.getError() == null ? "PROVIDER_CALLBACK_FAILURE" : request.getError());
            if (notification.getAttemptCount() < maxAttempts()) {
                notification.setStatus(NotificationStatus.PENDING);
                notification.setNextRetryAt(nextRetryTime(notification.getAttemptCount()));
            } else {
                notification.setStatus(NotificationStatus.FAILED);
                notification.setNextRetryAt(null);
            }
        } else {
            throw new ForbiddenOperationException("Unsupported callback status: " + request.getStatus());
        }

        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    private void saveNotification(User user, NotificationType type, String title, String message, NotificationChannel channel) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setChannel(channel);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setAttemptCount(1);
        NotificationDispatchResult result = channelDispatcher.dispatch(user, channel, title, message);
        applyDispatchResult(notification, result);
        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .channel(notification.getChannel())
                .status(notification.getStatus())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .sentAt(notification.getSentAt())
                .deliveredAt(notification.getDeliveredAt())
                .providerMessageId(notification.getProviderMessageId())
                .attemptCount(notification.getAttemptCount())
                .nextRetryAt(notification.getNextRetryAt())
                .lastError(notification.getLastError())
                .readFlag(notification.isReadFlag())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private NotificationPreference resolvePreference(User user) {
        return preferenceRepository.findByUserId(user.getId()).orElseGet(() -> {
            NotificationPreference preference = new NotificationPreference();
            preference.setUser(user);
            preference.setLanguageCode(templateService.normalizeLanguage(
                    appProperties.getNotifications().getTemplateDefaultLanguage()));
            return preferenceRepository.save(preference);
        });
    }

    private NotificationPreferenceResponse toPreferenceResponse(NotificationPreference preference) {
        return NotificationPreferenceResponse.builder()
                .transactionInAppEnabled(preference.isTransactionInAppEnabled())
                .transactionEmailEnabled(preference.isTransactionEmailEnabled())
                .transactionSmsEnabled(preference.isTransactionSmsEnabled())
                .securityInAppEnabled(preference.isSecurityInAppEnabled())
                .securityEmailEnabled(preference.isSecurityEmailEnabled())
                .securitySmsEnabled(preference.isSecuritySmsEnabled())
                .languageCode(templateService.normalizeLanguage(preference.getLanguageCode()))
                .build();
    }

    private boolean shouldSend(NotificationType type, NotificationChannel channel, NotificationPreference preference) {
        if (isTransactionType(type)) {
            return switch (channel) {
                case IN_APP -> preference.isTransactionInAppEnabled();
                case EMAIL -> preference.isTransactionEmailEnabled();
                case SMS -> preference.isTransactionSmsEnabled();
            };
        }
        if (isSecurityType(type)) {
            return switch (channel) {
                case IN_APP -> preference.isSecurityInAppEnabled();
                case EMAIL -> preference.isSecurityEmailEnabled();
                case SMS -> preference.isSecuritySmsEnabled();
            };
        }
        return true;
    }

    private boolean isTransactionType(NotificationType type) {
        return EnumSet.of(
                NotificationType.TRANSACTION,
                NotificationType.TRANSFER,
                NotificationType.LOW_BALANCE,
                NotificationType.EMI,
                NotificationType.FD_MATURITY,
                NotificationType.DISPUTE,
                NotificationType.STATEMENT
        ).contains(type);
    }

    private boolean isSecurityType(NotificationType type) {
        return EnumSet.of(
                NotificationType.LOGIN_ALERT,
                NotificationType.PASSWORD,
                NotificationType.FRAUD
        ).contains(type);
    }

    private void retrySingleNotification(Notification notification) {
        if (notification.getUser() == null || notification.getChannel() == NotificationChannel.IN_APP) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setNextRetryAt(null);
            notification.setLastError("RETRY_NOT_SUPPORTED");
            return;
        }
        notification.setAttemptCount(notification.getAttemptCount() + 1);
        NotificationDispatchResult result = channelDispatcher.dispatch(
                notification.getUser(),
                notification.getChannel(),
                notification.getTitle(),
                notification.getMessage()
        );
        applyDispatchResult(notification, result);
    }

    private void applyDispatchResult(Notification notification, NotificationDispatchResult result) {
        if (result.status() == NotificationStatus.SENT) {
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(notification.getSentAt() == null ? LocalDateTime.now() : notification.getSentAt());
            notification.setDeliveredAt(LocalDateTime.now());
            notification.setProviderMessageId(result.providerMessageId());
            notification.setNextRetryAt(null);
            notification.setLastError(null);
            return;
        }

        notification.setProviderMessageId(result.providerMessageId());
        notification.setLastError(result.error());
        notification.setDeliveredAt(null);
        if (result.retryable() && notification.getAttemptCount() < maxAttempts()) {
            notification.setStatus(NotificationStatus.PENDING);
            notification.setNextRetryAt(nextRetryTime(notification.getAttemptCount()));
        } else {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setNextRetryAt(null);
        }
    }

    private LocalDateTime nextRetryTime(int attemptCount) {
        int baseSeconds = Math.max(5, appProperties.getNotifications().getRetryDelaySeconds());
        int exponent = Math.max(0, attemptCount - 1);
        long multiplier = 1L << Math.min(exponent, 5);
        return LocalDateTime.now().plusSeconds(baseSeconds * multiplier);
    }

    private int maxAttempts() {
        return 1 + Math.max(0, appProperties.getNotifications().getMaxRetries());
    }

    private String csvValue(Object raw) {
        if (raw == null) {
            return "\"\"";
        }
        String value = raw.toString();
        if (!value.isEmpty()) {
            char first = value.charAt(0);
            if (first == '=' || first == '+' || first == '-' || first == '@') {
                value = "'" + value;
            }
        }
        String escaped = value.replace("\"", "\"\"").replace('\n', ' ').replace('\r', ' ');
        return "\"" + escaped + "\"";
    }
}
