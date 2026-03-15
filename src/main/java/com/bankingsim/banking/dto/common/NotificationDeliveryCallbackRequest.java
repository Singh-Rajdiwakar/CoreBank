package com.bankingsim.banking.dto.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationDeliveryCallbackRequest {

    @NotNull(message = "notificationId is required")
    private Long notificationId;

    @NotBlank(message = "providerMessageId is required")
    private String providerMessageId;

    @NotBlank(message = "status is required")
    private String status;

    private String error;
}
