package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.auth.AuthResponse;
import com.bankingsim.banking.dto.auth.ChangePasswordRequest;
import com.bankingsim.banking.dto.auth.ForgotPasswordRequest;
import com.bankingsim.banking.dto.auth.GenerateOtpRequest;
import com.bankingsim.banking.dto.auth.LoginRequest;
import com.bankingsim.banking.dto.auth.RefreshTokenRequest;
import com.bankingsim.banking.dto.auth.RegisterRequest;
import com.bankingsim.banking.dto.auth.ResetPasswordRequest;
import com.bankingsim.banking.dto.auth.VerifyOtpRequest;
import com.bankingsim.banking.entity.LoginAttempt;
import com.bankingsim.banking.entity.OtpRequest;
import com.bankingsim.banking.entity.PasswordResetToken;
import com.bankingsim.banking.entity.RefreshToken;
import com.bankingsim.banking.entity.Role;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.entity.enums.OtpPurpose;
import com.bankingsim.banking.entity.enums.RoleType;
import com.bankingsim.banking.exception.AuthenticationException;
import com.bankingsim.banking.exception.DuplicateResourceException;
import com.bankingsim.banking.exception.OtpValidationException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.repository.LoginAttemptRepository;
import com.bankingsim.banking.repository.OtpRequestRepository;
import com.bankingsim.banking.repository.PasswordResetTokenRepository;
import com.bankingsim.banking.repository.RefreshTokenRepository;
import com.bankingsim.banking.repository.RoleRepository;
import com.bankingsim.banking.repository.UserRepository;
import com.bankingsim.banking.security.TokenBlacklistService;
import com.bankingsim.banking.security.jwt.JwtTokenProvider;
import com.bankingsim.banking.util.ReferenceGenerator;
import com.bankingsim.banking.util.RequestMetadataUtil;
import com.bankingsim.banking.util.SecurityUtils;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final OtpRequestRepository otpRequestRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final TokenBlacklistService tokenBlacklistService;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final AppProperties appProperties;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone already exists");
        }

        Role role = roleRepository.findByName(RoleType.ROLE_CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Default role not configured"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setPasswordExpiryDate(LocalDate.now().plusDays(appProperties.getSecurity().getPassword().getExpiryDays()));
        user.getRoles().add(role);

        User saved = userRepository.save(user);

        auditService.log(saved.getId(), "REGISTER", "USER", saved.getId().toString(), null,
                "username=" + saved.getUsername(), true, "User registration successful");

        return issueTokens(saved, false);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> {
                    saveLoginAttempt(request.getUsernameOrEmail(), false, "User not found");
                    return new AuthenticationException("Invalid credentials");
                });

        if (!user.isEnabled()) {
            saveLoginAttempt(request.getUsernameOrEmail(), false, "Account disabled");
            throw new AuthenticationException("Account disabled");
        }

        if (!user.isAccountNonLocked()) {
            saveLoginAttempt(request.getUsernameOrEmail(), false, "Account locked");
            throw new AuthenticationException("Account locked. Contact admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= appProperties.getSecurity().getPassword().getMaxFailedAttempts()) {
                user.setAccountNonLocked(false);
            }
            userRepository.save(user);
            saveLoginAttempt(request.getUsernameOrEmail(), false, "Invalid password");
            auditService.log(user.getId(), "FAILED_LOGIN", "USER", user.getId().toString(), null, null, false,
                    "Invalid credentials");
            throw new AuthenticationException("Invalid credentials");
        }

        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(RequestMetadataUtil.currentIp());
        userRepository.save(user);

        boolean passwordExpired = user.getPasswordExpiryDate() != null && user.getPasswordExpiryDate().isBefore(LocalDate.now());

        saveLoginAttempt(request.getUsernameOrEmail(), true, "Login successful");
        auditService.log(user.getId(), "LOGIN", "USER", user.getId().toString(), null, null, true,
                "User login successful");

        notificationService.publish(user.getId(), NotificationType.LOGIN_ALERT,
                "New Login",
                "A login was detected from IP " + RequestMetadataUtil.currentIp());

        return issueTokens(user, passwordExpired);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AuthenticationException("Refresh token invalid"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AuthenticationException("Refresh token expired or revoked");
        }

        User user = refreshToken.getUser();
        if (!user.isEnabled() || !user.isAccountNonLocked()) {
            throw new AuthenticationException("User account is disabled or locked");
        }

        return issueTokens(user,
                user.getPasswordExpiryDate() != null && user.getPasswordExpiryDate().isBefore(LocalDate.now()));
    }

    @Transactional
    public void logout(String refreshTokenValue, String accessToken) {
        if (refreshTokenValue != null && !refreshTokenValue.isBlank()) {
            refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
                token.setRevoked(true);
                token.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(token);
            });
        }

        if (accessToken != null && !accessToken.isBlank()) {
            try {
                tokenBlacklistService.blacklist(accessToken, jwtTokenProvider.extractExpiry(accessToken));
            } catch (Exception ignored) {
                // Ignore malformed/expired access token on logout path.
            }
        }

        Long userId = null;
        try {
            userId = SecurityUtils.currentUserId();
        } catch (Exception ignored) {
        }
        auditService.log(userId, "LOGOUT", "USER", userId == null ? null : userId.toString(), null, null, true,
                "User logout completed");
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Old password mismatch");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setPasswordExpiryDate(LocalDate.now().plusDays(appProperties.getSecurity().getPassword().getExpiryDays()));
        userRepository.save(user);

        auditService.log(user.getId(), "PASSWORD_CHANGE", "USER", user.getId().toString(), null, null, true,
                "Password changed");
        notificationService.publish(user.getId(), NotificationType.PASSWORD,
                "Password Changed",
                "Your password was changed successfully.");
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No user with this email"));

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(ReferenceGenerator.randomToken());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        token.setUsed(false);
        passwordResetTokenRepository.save(token);

        auditService.log(user.getId(), "FORGOT_PASSWORD", "USER", user.getId().toString(), null, null, true,
                "Password reset requested");
        notificationService.publish(user.getId(), NotificationType.PASSWORD,
                "Password Reset Requested",
                "Use reset token: " + token.getToken());

        return token.getToken();
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new AuthenticationException("Invalid reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AuthenticationException("Reset token expired or already used");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setPasswordExpiryDate(LocalDate.now().plusDays(appProperties.getSecurity().getPassword().getExpiryDays()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        auditService.log(user.getId(), "RESET_PASSWORD", "USER", user.getId().toString(), null, null, true,
                "Password reset completed");
    }

    @Transactional
    public String generateOtp(GenerateOtpRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String otp = ReferenceGenerator.otp();
        OtpRequest otpRequest = new OtpRequest();
        otpRequest.setUser(user);
        otpRequest.setPurpose(request.getPurpose());
        otpRequest.setOtpHash(passwordEncoder.encode(otp));
        otpRequest.setExpiresAt(LocalDateTime.now().plusMinutes(appProperties.getSecurity().getOtp().getExpiryMinutes()));
        otpRequest.setConsumed(false);
        otpRequest.setChannel(request.getChannel());
        otpRequest.setRemarks("OTP generated");
        otpRequestRepository.save(otpRequest);

        notificationService.publish(user.getId(), NotificationType.GENERAL,
                "OTP Generated",
                "Your OTP for " + request.getPurpose() + " is: " + otp);

        auditService.log(user.getId(), "OTP_GENERATE", "OTP_REQUEST", otpRequest.getId().toString(), null, null,
                true, "OTP generated for purpose " + request.getPurpose());

        return otp;
    }

    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        OtpRequest otpRequest = otpRequestRepository
                .findTopByUserAndPurposeAndConsumedIsFalseOrderByCreatedAtDesc(user, request.getPurpose())
                .orElseThrow(() -> new OtpValidationException("No pending OTP found"));

        validateOtp(otpRequest, request.getOtp());
    }

    @Transactional
    public void validateOtp(User user, OtpPurpose purpose, String otp) {
        OtpRequest otpRequest = otpRequestRepository
                .findTopByUserAndPurposeAndConsumedIsFalseOrderByCreatedAtDesc(user, purpose)
                .orElseThrow(() -> new OtpValidationException("No pending OTP found"));
        validateOtp(otpRequest, otp);
    }

    private void validateOtp(OtpRequest otpRequest, String otp) {
        if (otpRequest.isConsumed()) {
            throw new OtpValidationException("OTP already consumed");
        }
        if (otpRequest.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new OtpValidationException("OTP expired");
        }
        if (!passwordEncoder.matches(otp, otpRequest.getOtpHash())) {
            throw new OtpValidationException("OTP invalid");
        }

        otpRequest.setConsumed(true);
        otpRequest.setConsumedAt(LocalDateTime.now());
        otpRequestRepository.save(otpRequest);
    }

    @Transactional
    public void unlockUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        auditService.log(SecurityUtils.currentUserId(), "UNLOCK_ACCOUNT", "USER", userId.toString(), null, null,
                true, "Account unlocked by admin");
    }

    private AuthResponse issueTokens(User user, boolean passwordExpired) {
        Set<String> roles = user.getRoles().stream().map(role -> role.getName().name()).collect(java.util.stream.Collectors.toSet());
        String access = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername(), roles);
        String refresh = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refresh);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(appProperties.getSecurity().getJwt().getRefreshTokenExpiryDays()));
        refreshToken.setRevoked(false);
        refreshToken.setIpAddress(RequestMetadataUtil.currentIp());
        refreshToken.setDeviceInfo(RequestMetadataUtil.currentDevice());
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .roles(roles)
                .passwordExpired(passwordExpired)
                .build();
    }

    private void saveLoginAttempt(String username, boolean success, String remarks) {
        LoginAttempt attempt = new LoginAttempt();
        attempt.setUsername(username);
        attempt.setSuccess(success);
        attempt.setAttemptedAt(LocalDateTime.now());
        attempt.setIpAddress(RequestMetadataUtil.currentIp());
        attempt.setDeviceInfo(RequestMetadataUtil.currentDevice());
        attempt.setRemarks(remarks);
        loginAttemptRepository.save(attempt);
    }
}
