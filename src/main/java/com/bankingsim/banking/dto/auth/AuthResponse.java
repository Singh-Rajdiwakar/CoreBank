package com.bankingsim.banking.dto.auth;

import java.util.Set;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String username;
    private Set<String> roles;
    private boolean passwordExpired;
}
