package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.dto.common.NotificationDeliveryCallbackRequest;
import com.bankingsim.banking.dto.common.NotificationPreferenceResponse;
import com.bankingsim.banking.dto.common.NotificationPreferenceUpdateRequest;
import com.bankingsim.banking.dto.common.NotificationQueueSummaryResponse;
import com.bankingsim.banking.dto.common.NotificationResponse;
import com.bankingsim.banking.entity.enums.NotificationChannel;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.entity.enums.NotificationStatus;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.util.SecurityUtils;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    public ApiResponse<PageResponse<NotificationResponse>> mine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.ok(notificationService.listMyNotifications(SecurityUtils.currentUserId(), page, size));
    }

    @GetMapping("/unread-count")
    public ApiResponse<java.util.Map<String, Long>> unreadCount() {
        return ApiResponse.ok(java.util.Map.of("unreadCount", notificationService.unreadCount(SecurityUtils.currentUserId())));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(SecurityUtils.currentUserId(), id);
        return ApiResponse.ok(null, "Notification marked as read");
    }

    @PatchMapping("/me/read-all")
    public ApiResponse<java.util.Map<String, Integer>> markAllRead() {
        int updated = notificationService.markAllAsRead(SecurityUtils.currentUserId());
        return ApiResponse.ok(java.util.Map.of("updatedCount", updated), "All notifications marked as read");
    }

    @GetMapping("/preferences")
    public ApiResponse<NotificationPreferenceResponse> preferences() {
        return ApiResponse.ok(notificationService.getPreferences(SecurityUtils.currentUserId()));
    }

    @PatchMapping("/preferences")
    public ApiResponse<NotificationPreferenceResponse> updatePreferences(
            @Valid @RequestBody NotificationPreferenceUpdateRequest request) {
        return ApiResponse.ok(notificationService.updatePreferences(SecurityUtils.currentUserId(), request),
                "Notification preferences updated");
    }

    @PatchMapping("/callbacks/delivery")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<NotificationResponse> processDeliveryCallback(
            @Valid @RequestBody NotificationDeliveryCallbackRequest request) {
        return ApiResponse.ok(notificationService.processDeliveryCallback(request), "Delivery callback processed");
    }

    @PatchMapping("/admin/retry-dispatch")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<java.util.Map<String, Object>> retryPendingDispatches(
            @RequestParam(required = false) NotificationChannel channel) {
        int processed = channel == null
                ? notificationService.retryPendingNotifications()
                : notificationService.retryPendingNotifications(channel);
        return ApiResponse.ok(
                java.util.Map.of(
                        "processedCount", processed,
                        "channel", channel == null ? "ALL" : channel.name()
                ),
                "Retry dispatch cycle completed");
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<NotificationQueueSummaryResponse> queueSummary() {
        return ApiResponse.ok(notificationService.queueSummary());
    }

    @GetMapping("/admin/queue")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ApiResponse<PageResponse<NotificationResponse>> queueByStatus(
            @RequestParam NotificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.ok(notificationService.listByStatus(status, page, size));
    }

    @DeleteMapping("/admin/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<java.util.Map<String, Long>> cleanupSentNotifications() {
        long deleted = notificationService.cleanupOldSentNotifications();
        return ApiResponse.ok(java.util.Map.of("deletedCount", deleted), "Old sent notifications cleaned");
    }

    @GetMapping(value = "/admin/dead-letter/export", produces = "text/csv")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','AUDITOR')")
    public ResponseEntity<String> exportDeadLetterCsv(
            @RequestParam(required = false) NotificationChannel channel,
            @RequestParam(defaultValue = "1000") int limit) {
        String csv = notificationService.exportDeadLetterCsv(channel, limit);
        String channelPart = channel == null ? "ALL" : channel.name();
        String fileName = "dead-letter-" + channelPart + "-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(new MediaType("text", "csv"))
                .body(csv);
    }
}
