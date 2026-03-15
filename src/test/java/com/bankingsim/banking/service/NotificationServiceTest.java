package com.bankingsim.banking.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.entity.Notification;
import com.bankingsim.banking.entity.NotificationPreference;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.NotificationChannel;
import com.bankingsim.banking.entity.enums.NotificationStatus;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.notification.NotificationChannelDispatcher;
import com.bankingsim.banking.notification.NotificationDispatchResult;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.notification.NotificationTemplateService;
import com.bankingsim.banking.repository.NotificationPreferenceRepository;
import com.bankingsim.banking.repository.NotificationRepository;
import com.bankingsim.banking.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private NotificationPreferenceRepository preferenceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationChannelDispatcher channelDispatcher;
    @Mock
    private NotificationTemplateService templateService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private AppProperties appProperties;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        appProperties = new AppProperties();
        notificationService = new NotificationService(
                notificationRepository,
                preferenceRepository,
                userRepository,
                channelDispatcher,
                templateService,
                appProperties,
                eventPublisher
        );
    }

    @Test
    void sendShouldPersistInAppEmailAndSmsForTransactionNotification() {
        User user = buildUser(10L);
        NotificationPreference preference = new NotificationPreference();
        preference.setUser(user);

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(preferenceRepository.findByUserId(10L)).thenReturn(Optional.of(preference));
        when(channelDispatcher.dispatch(eq(user), any(NotificationChannel.class), any(String.class), any(String.class)))
                .thenReturn(NotificationDispatchResult.sent("MSG-1"));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.send(10L, NotificationType.TRANSACTION, "Debit Alert", "Amount debited");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(3)).save(captor.capture());

        List<Notification> saved = captor.getAllValues();
        assertEquals(3, saved.size());
        assertTrue(saved.stream().anyMatch(n -> n.getChannel() == NotificationChannel.IN_APP));
        assertTrue(saved.stream().anyMatch(n -> n.getChannel() == NotificationChannel.EMAIL));
        assertTrue(saved.stream().anyMatch(n -> n.getChannel() == NotificationChannel.SMS));
        assertTrue(saved.stream().allMatch(n -> n.getStatus() == NotificationStatus.SENT));
    }

    @Test
    void sendShouldRespectChannelPreferenceFlags() {
        User user = buildUser(11L);
        NotificationPreference preference = new NotificationPreference();
        preference.setUser(user);
        preference.setTransactionSmsEnabled(false);
        preference.setTransactionEmailEnabled(true);
        preference.setTransactionInAppEnabled(true);

        when(userRepository.findById(11L)).thenReturn(Optional.of(user));
        when(preferenceRepository.findByUserId(11L)).thenReturn(Optional.of(preference));
        when(channelDispatcher.dispatch(eq(user), any(NotificationChannel.class), any(String.class), any(String.class)))
                .thenReturn(NotificationDispatchResult.sent("MSG-2"));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.send(11L, NotificationType.TRANSACTION, "Credit Alert", "Amount credited");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(captor.capture());

        List<Notification> saved = captor.getAllValues();
        assertEquals(2, saved.size());
        assertTrue(saved.stream().anyMatch(n -> n.getChannel() == NotificationChannel.IN_APP));
        assertTrue(saved.stream().anyMatch(n -> n.getChannel() == NotificationChannel.EMAIL));
        assertTrue(saved.stream().noneMatch(n -> n.getChannel() == NotificationChannel.SMS));
    }

    @Test
    void retryPendingNotificationsShouldMarkAsSentOnSuccessfulRetry() {
        User user = buildUser(12L);
        Notification pending = new Notification();
        pending.setId(120L);
        pending.setUser(user);
        pending.setChannel(NotificationChannel.SMS);
        pending.setStatus(NotificationStatus.PENDING);
        pending.setTitle("Retry");
        pending.setMessage("Retry me");
        pending.setAttemptCount(1);
        pending.setNextRetryAt(LocalDateTime.now().minusMinutes(2));

        when(notificationRepository.findByStatusAndNextRetryAtLessThanEqualOrderByCreatedAtAsc(
                eq(NotificationStatus.PENDING),
                any(LocalDateTime.class),
                any()
        )).thenReturn(List.of(pending));
        when(channelDispatcher.dispatch(eq(user), eq(NotificationChannel.SMS), any(String.class), any(String.class)))
                .thenReturn(NotificationDispatchResult.sent("SMS-ACK-123"));

        int processed = notificationService.retryPendingNotifications();

        assertEquals(1, processed);
        assertEquals(NotificationStatus.SENT, pending.getStatus());
        assertEquals(2, pending.getAttemptCount());
        assertEquals("SMS-ACK-123", pending.getProviderMessageId());
        verify(notificationRepository).saveAll(any());
    }

    @Test
    void markAllAsReadShouldUseBulkUpdateQuery() {
        when(notificationRepository.markAllAsReadByUserId(eq(99L), any(LocalDateTime.class))).thenReturn(7);

        int updated = notificationService.markAllAsRead(99L);

        assertEquals(7, updated);
        verify(notificationRepository).markAllAsReadByUserId(eq(99L), any(LocalDateTime.class));
    }

    @Test
    void queueSummaryShouldReturnStatusCounts() {
        when(notificationRepository.countByStatus(NotificationStatus.PENDING)).thenReturn(4L);
        when(notificationRepository.countByStatus(NotificationStatus.FAILED)).thenReturn(2L);
        when(notificationRepository.countByStatus(NotificationStatus.SENT)).thenReturn(10L);
        when(notificationRepository.countByStatusAndNextRetryAtLessThanEqual(eq(NotificationStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(3L);

        var summary = notificationService.queueSummary();

        assertEquals(4L, summary.getPendingCount());
        assertEquals(2L, summary.getFailedCount());
        assertEquals(10L, summary.getSentCount());
        assertEquals(3L, summary.getDueRetryCount());
    }

    @Test
    void retryPendingNotificationsByChannelShouldProcessOnlyThatChannel() {
        User user = buildUser(13L);
        Notification pending = new Notification();
        pending.setId(130L);
        pending.setUser(user);
        pending.setChannel(NotificationChannel.EMAIL);
        pending.setStatus(NotificationStatus.PENDING);
        pending.setTitle("Retry Email");
        pending.setMessage("Retry only email");
        pending.setAttemptCount(2);
        pending.setNextRetryAt(LocalDateTime.now().minusMinutes(1));

        when(notificationRepository.findByStatusAndChannelAndNextRetryAtLessThanEqualOrderByCreatedAtAsc(
                eq(NotificationStatus.PENDING),
                eq(NotificationChannel.EMAIL),
                any(LocalDateTime.class),
                any()
        )).thenReturn(List.of(pending));
        when(channelDispatcher.dispatch(eq(user), eq(NotificationChannel.EMAIL), any(String.class), any(String.class)))
                .thenReturn(NotificationDispatchResult.sent("EML-ACK-1"));

        int processed = notificationService.retryPendingNotifications(NotificationChannel.EMAIL);

        assertEquals(1, processed);
        assertEquals(NotificationStatus.SENT, pending.getStatus());
        assertEquals(3, pending.getAttemptCount());
    }

    @Test
    void retryPendingNotificationsByInAppChannelShouldFail() {
        assertThrows(ForbiddenOperationException.class,
                () -> notificationService.retryPendingNotifications(NotificationChannel.IN_APP));
    }

    @Test
    void exportDeadLetterCsvShouldReturnCsvForFailedExternalChannels() {
        User user = buildUser(14L);
        Notification failed = new Notification();
        failed.setId(140L);
        failed.setUser(user);
        failed.setChannel(NotificationChannel.SMS);
        failed.setStatus(NotificationStatus.FAILED);
        failed.setAttemptCount(4);
        failed.setLastError("SMS_PROVIDER_TIMEOUT");
        failed.setProviderMessageId("SMS-FAILED-1");
        failed.setCreatedAt(LocalDateTime.of(2026, 3, 10, 20, 0));

        when(notificationRepository.findByStatusAndChannelInOrderByCreatedAtDesc(
                eq(NotificationStatus.FAILED),
                any(),
                any(PageRequest.class)
        )).thenReturn(new PageImpl<>(List.of(failed)));

        String csv = notificationService.exportDeadLetterCsv(null, 1000);

        assertTrue(csv.contains("notificationId,userId,channel,type,status,attemptCount,lastError,nextRetryAt,providerMessageId,createdAt"));
        assertTrue(csv.contains("\"140\""));
        assertTrue(csv.contains("\"SMS\""));
        assertTrue(csv.contains("\"SMS_PROVIDER_TIMEOUT\""));
    }

    private User buildUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@mail.com");
        user.setPhone("99999999" + id);
        return user;
    }
}
