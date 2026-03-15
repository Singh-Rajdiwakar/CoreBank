package com.bankingsim.banking.validation;

import com.bankingsim.banking.exception.ForbiddenOperationException;
import java.time.LocalDate;
import java.time.Period;

public final class BusinessValidation {

    private BusinessValidation() {
    }

    public static void validateAdult(LocalDate dob) {
        if (dob == null || Period.between(dob, LocalDate.now()).getYears() < 18) {
            throw new ForbiddenOperationException("Customer must be at least 18 years old");
        }
    }
}
