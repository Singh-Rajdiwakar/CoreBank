package com.bankingsim.banking.dto.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardSummaryResponse {
    private long totalCustomers;
    private long totalActiveAccounts;
    private String totalDeposits;
    private String totalWithdrawals;
    private String totalTransfers;
    private long fraudFlaggedTransactions;
    private long dormantAccounts;
    private long closedAccounts;
}
