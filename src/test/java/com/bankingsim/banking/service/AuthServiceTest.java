package com.bankingsim.banking.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.auth.LoginRequest;
import com.bankingsim.banking.entity.Role;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.RoleType;
import com.bankingsim.banking.exception.AuthenticationException;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.repository.LoginAttemptRepository;
import com.bankingsim.banking.repository.OtpRequestRepository;
import com.bankingsim.banking.repository.PasswordResetTokenRepository;
import com.bankingsim.banking.repository.RefreshTokenRepository;
import com.bankingsim.banking.repository.RoleRepository;
import com.bankingsim.banking.repository.UserRepository;
import com.bankingsim.banking.security.TokenBlacklistService;
import com.bankingsim.banking.security.jwt.JwtTokenProvider;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private OtpRequestRepository otpRequestRepository;
    @Mock
    private LoginAttemptRepository loginAttemptRepository;
    @Mock
    private TokenBlacklistService tokenBlacklistService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditService auditService;

    private AppProperties appProperties;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        appProperties = new AppProperties();
        AppProperties.Security security = new AppProperties.Security();
        AppProperties.Security.Password password = new AppProperties.Security.Password();
        password.setExpiryDays(90);
        password.setMaxFailedAttempts(5);
        security.setPassword(password);
        AppProperties.Security.Jwt jwt = new AppProperties.Security.Jwt();
        jwt.setRefreshTokenExpiryDays(7);
        security.setJwt(jwt);
        appProperties.setSecurity(security);

        authService = new AuthService(
                userRepository,
                roleRepository,
                passwordEncoder,
                jwtTokenProvider,
                refreshTokenRepository,
                passwordResetTokenRepository,
                otpRequestRepository,
                loginAttemptRepository,
                tokenBlacklistService,
                notificationService,
                auditService,
                appProperties
        );
    }

    @Test
    void loginShouldFailForLockedUser() {
        User user = new User();
        user.setUsername("u1");
        user.setEmail("u1@test.com");
        user.setPasswordHash("hash");
        user.setEnabled(true);
        user.setAccountNonLocked(false);
        user.setPasswordExpiryDate(LocalDate.now().plusDays(1));
        Role role = new Role();
        role.setName(RoleType.ROLE_CUSTOMER);
        user.setRoles(Set.of(role));

        when(userRepository.findByUsername("u1")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("u1");
        request.setPassword("password");

        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }
}
