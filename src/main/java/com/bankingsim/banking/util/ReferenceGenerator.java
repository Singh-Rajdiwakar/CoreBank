package com.bankingsim.banking.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;

public final class ReferenceGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private ReferenceGenerator() {
    }

    public static String transactionReference() {
        return "TXN" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + randomDigits(6);
    }

    public static String accountNumber() {
        return "42" + randomDigits(12);
    }

    public static String customerCode() {
        return "CUST" + randomDigits(8);
    }

    public static String employeeCode() {
        return "EMP" + randomDigits(7);
    }

    public static String fdNumber() {
        return "FD" + randomDigits(10);
    }

    public static String rdNumber() {
        return "RD" + randomDigits(10);
    }

    public static String disputeCaseNumber() {
        return "DSP" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + randomDigits(5);
    }

    public static String cardMaskedNumber() {
        String first = randomDigits(4);
        String last = randomDigits(4);
        return first + "-XXXX-XXXX-" + last;
    }

    public static String randomToken() {
        return java.util.UUID.randomUUID().toString().replace("-", "") + randomDigits(6);
    }

    public static String otp() {
        return randomDigits(6);
    }

    private static String randomDigits(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            builder.append(RANDOM.nextInt(10));
        }
        return builder.toString();
    }
}
