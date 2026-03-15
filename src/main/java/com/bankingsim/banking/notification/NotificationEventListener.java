package com.bankingsim.banking.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @EventListener
    @Async("notificationExecutor")
    public void onNotification(NotificationEvent event) {
        notificationService.send(event.userId(), event.type(), event.title(), event.message());
    }
}
