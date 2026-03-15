package com.bankingsim.banking.dto.admin;

import com.bankingsim.banking.entity.enums.FraudCaseStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FraudCaseResponse {
    private Long id;
    private Long transactionId;
    private Integer score;
    private String reason;
    private FraudCaseStatus status;
}
