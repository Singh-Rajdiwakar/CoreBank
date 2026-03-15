package com.bankingsim.banking.fraud;

import java.util.List;

public record FraudEvaluationResult(int score, List<String> reasons, boolean block, boolean reviewRequired) {
}
