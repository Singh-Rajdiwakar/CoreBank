package com.bankingsim.banking.dto.dispute;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DisputeEvidenceRequest {

    @NotBlank(message = "fileName is required")
    @Size(max = 180, message = "fileName can be at most 180 characters")
    private String fileName;

    @NotBlank(message = "fileUrl is required")
    @Size(max = 255, message = "fileUrl can be at most 255 characters")
    private String fileUrl;

    @Size(max = 100, message = "fileType can be at most 100 characters")
    private String fileType;

    @Size(max = 100, message = "checksum can be at most 100 characters")
    private String checksum;

    @Size(max = 255, message = "notes can be at most 255 characters")
    private String notes;
}
