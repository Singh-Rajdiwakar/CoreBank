package com.bankingsim.banking.exception;

import org.springframework.http.HttpStatus;

public class FraudSuspectedException extends ApiException {

    public FraudSuspectedException(String message) {
        super(HttpStatus.LOCKED, "FRAUD_SUSPECTED", message);
    }
}
