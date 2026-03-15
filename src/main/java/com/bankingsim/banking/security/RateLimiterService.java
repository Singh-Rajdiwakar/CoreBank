package com.bankingsim.banking.security;

import com.bankingsim.banking.exception.RateLimitExceededException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

@Component
public class RateLimiterService {

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    public void validate(String key, int allowedPerMinute) {
        WindowCounter counter = counters.computeIfAbsent(key, v -> new WindowCounter(Instant.now(), new AtomicInteger(0)));
        synchronized (counter) {
            Instant now = Instant.now();
            if (counter.windowStart.plus(1, ChronoUnit.MINUTES).isBefore(now)) {
                counter.windowStart = now;
                counter.counter.set(0);
            }
            int current = counter.counter.incrementAndGet();
            if (current > allowedPerMinute) {
                throw new RateLimitExceededException("Rate limit exceeded for " + key);
            }
        }
    }

    private static class WindowCounter {
        private Instant windowStart;
        private final AtomicInteger counter;

        private WindowCounter(Instant windowStart, AtomicInteger counter) {
            this.windowStart = windowStart;
            this.counter = counter;
        }
    }
}
