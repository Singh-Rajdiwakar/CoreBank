package com.bankingsim.banking.util;

import com.bankingsim.banking.security.CustomUserPrincipal;
import com.bankingsim.banking.exception.AuthenticationException;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserPrincipal principal)) {
            throw new AuthenticationException("No authenticated user found");
        }
        return principal.getId();
    }

    public static String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserPrincipal principal)) {
            throw new AuthenticationException("No authenticated user found");
        }
        return principal.getUsername();
    }

    public static Set<String> currentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return Set.of();
        }
        return auth.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.toSet());
    }

    public static boolean hasRole(String role) {
        return currentRoles().contains(role);
    }
}
