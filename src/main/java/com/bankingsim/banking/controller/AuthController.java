package com.bankingsim.banking.controller;

import com.bankingsim.banking.dto.auth.AuthResponse;
import com.bankingsim.banking.dto.auth.ChangePasswordRequest;
import com.bankingsim.banking.dto.auth.ForgotPasswordRequest;
import com.bankingsim.banking.dto.auth.GenerateOtpRequest;
import com.bankingsim.banking.dto.auth.LoginRequest;
import com.bankingsim.banking.dto.auth.RefreshTokenRequest;
import com.bankingsim.banking.dto.auth.RegisterRequest;
import com.bankingsim.banking.dto.auth.ResetPasswordRequest;
import com.bankingsim.banking.dto.auth.VerifyOtpRequest;
import com.bankingsim.banking.dto.common.ApiResponse;
import com.bankingsim.banking.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request), "Registered successfully");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request), "Login successful");
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.ok(authService.refreshToken(request), "Token refreshed");
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @RequestBody(required = false) RefreshTokenRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String accessToken = extractToken(authHeader);
        String refreshToken = request == null ? null : request.getRefreshToken();
        authService.logout(refreshToken, accessToken);
        return ApiResponse.ok(null, "Logout successful");
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ApiResponse.ok(null, "Password changed");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ApiResponse.ok(authService.forgotPassword(request), "Password reset token generated");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok(null, "Password reset successful");
    }

    @PostMapping("/otp/generate")
    public ApiResponse<String> generateOtp(@Valid @RequestBody GenerateOtpRequest request) {
        return ApiResponse.ok(authService.generateOtp(request), "OTP generated");
    }

    @PostMapping("/otp/verify")
    public ApiResponse<Void> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ApiResponse.ok(null, "OTP verified");
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}
