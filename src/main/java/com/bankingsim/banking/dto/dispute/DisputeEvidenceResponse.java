package com.bankingsim.banking.dto.dispute;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DisputeEvidenceResponse {
    private Long id;
    private Long disputeId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private String checksum;
    private String notes;
    private Long uploadedBy;
    private LocalDateTime uploadedAt;
    private LocalDateTime createdAt;
}
