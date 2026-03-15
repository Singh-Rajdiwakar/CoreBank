package com.bankingsim.banking.dto.dispute;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DisputeAssignRequest {
    @NotNull(message = "assigneeUserId is required")
    private Long assigneeUserId;
}
