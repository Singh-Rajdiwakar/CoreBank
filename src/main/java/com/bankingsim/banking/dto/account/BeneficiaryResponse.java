package com.bankingsim.banking.dto.account;

import com.bankingsim.banking.entity.enums.BeneficiaryStatus;
import com.bankingsim.banking.entity.enums.BeneficiaryType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BeneficiaryResponse {
    private Long id;
    private BeneficiaryType beneficiaryType;
    private String nickname;
    private String name;
    private String accountNumber;
    private String ifscCode;
    private String bankName;
    private BigDecimal dailyLimit;
    private BeneficiaryStatus status;
    private LocalDateTime coolingUntil;
}
