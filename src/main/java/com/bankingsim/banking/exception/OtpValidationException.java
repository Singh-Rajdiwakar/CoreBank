package com.bankingsim.banking.exception;

import org.springframework.http.HttpStatus;

public class OtpValidationException extends ApiException {

    public OtpValidationException(String message) {
        super(HttpStatus.BAD_REQUEST, "OTP_INVALID", message);
    }
}
