package com.bankingsim.banking.dto.transaction;

import lombok.Builder;
import lombok.Getter;
import java.util.Map;

@Getter
@Builder
public class SpendingOverviewResponse {
    private String totalDebit;
    private String totalCredit;
    private Map<String, String> byCategory;
}
