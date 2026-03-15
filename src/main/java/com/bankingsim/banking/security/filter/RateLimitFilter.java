package com.bankingsim.banking.security.filter;

import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.exception.RateLimitExceededException;
import com.bankingsim.banking.security.RateLimiterService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;
    private final AppProperties appProperties;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }

        try {
            if (path.startsWith("/api/auth/login")) {
                rateLimiterService.validate("LOGIN:" + ip, appProperties.getLimits().getLoginRequestsPerMinute());
            }

            if (path.startsWith("/api/transfers") || path.startsWith("/api/withdrawals")) {
                rateLimiterService.validate("TRANSFER:" + ip, appProperties.getLimits().getTransferRequestsPerMinute());
            }
        } catch (RateLimitExceededException ex) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Rate limit exceeded\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
