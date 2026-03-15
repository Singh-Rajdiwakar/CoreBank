package com.bankingsim.banking.security;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class TokenBlacklistService {

    private final Map<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

    public void blacklist(String token, Instant expiry) {
        blacklistedTokens.put(token, expiry);
        cleanup();
    }

    public boolean isBlacklisted(String token) {
        cleanup();
        Instant expiry = blacklistedTokens.get(token);
        return expiry != null && expiry.isAfter(Instant.now());
    }

    private void cleanup() {
        Instant now = Instant.now();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
