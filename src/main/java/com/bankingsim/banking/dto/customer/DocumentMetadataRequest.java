package com.bankingsim.banking.dto.customer;

import com.bankingsim.banking.entity.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DocumentMetadataRequest {

    @NotNull
    private DocumentType documentType;

    @NotBlank
    private String documentNumber;

    @NotBlank
    private String fileName;

    @NotBlank
    private String fileUrl;
}
