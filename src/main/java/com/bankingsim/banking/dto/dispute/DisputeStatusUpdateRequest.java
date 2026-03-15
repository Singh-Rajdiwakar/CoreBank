package com.bankingsim.banking.dto.dispute;

import com.bankingsim.banking.entity.enums.DisputeStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DisputeStatusUpdateRequest {

    @NotNull(message = "status is required")
    private DisputeStatus status;

    @Size(max = 500, message = "resolutionSummary can be at most 500 characters")
    private String resolutionSummary;

    private Boolean provisionalCreditRecommended;
}
