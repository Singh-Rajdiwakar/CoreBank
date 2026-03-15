package com.bankingsim.banking.dto.account;

import com.bankingsim.banking.entity.enums.EmiStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmiScheduleResponse {
    private Long id;
    private Integer installmentNumber;
    private LocalDate dueDate;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private BigDecimal penaltyComponent;
    private BigDecimal totalDue;
    private EmiStatus status;
}
