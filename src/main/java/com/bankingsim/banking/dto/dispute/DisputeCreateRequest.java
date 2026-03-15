package com.bankingsim.banking.dto.dispute;

import com.bankingsim.banking.entity.enums.DisputeCategory;
import com.bankingsim.banking.entity.enums.DisputePriority;
import com.bankingsim.banking.entity.enums.DisputeReportedChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DisputeCreateRequest {

    @NotNull(message = "transactionId is required")
    private Long transactionId;

    @NotNull(message = "category is required")
    private DisputeCategory category;

    @NotNull(message = "reportedChannel is required")
    private DisputeReportedChannel reportedChannel;

    private DisputePriority priority;

    @NotBlank(message = "description is required")
    @Size(max = 500, message = "description can be at most 500 characters")
    private String description;

    @Size(max = 255, message = "evidenceReference can be at most 255 characters")
    private String evidenceReference;
}
