package com.bankingsim.banking.dto.dispute;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DisputeSummaryResponse {
    private long openCount;
    private long underReviewCount;
    private long escalatedCount;
    private long resolvedCount;
    private long rejectedCount;
    private long closedCount;
}
