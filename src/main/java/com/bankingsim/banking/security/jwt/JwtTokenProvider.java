package com.bankingsim.banking.security.jwt;

import com.bankingsim.banking.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final AppProperties appProperties;

    public JwtTokenProvider(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String generateAccessToken(Long userId, String username, Set<String> roles) {
        Instant now = Instant.now();
        Instant expiry = now.plus(appProperties.getSecurity().getJwt().getAccessTokenExpiryMinutes(), ChronoUnit.MINUTES);
        return Jwts.builder()
                .subject(username)
                .issuer(appProperties.getSecurity().getJwt().getIssuer())
                .id(UUID.randomUUID().toString())
                .claim("uid", userId)
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(Long userId, String username) {
        Instant now = Instant.now();
        Instant expiry = now.plus(appProperties.getSecurity().getJwt().getRefreshTokenExpiryDays(), ChronoUnit.DAYS);
        return Jwts.builder()
                .subject(username)
                .issuer(appProperties.getSecurity().getJwt().getIssuer())
                .id(UUID.randomUUID().toString())
                .claim("uid", userId)
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValidToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().toInstant().isAfter(Instant.now());
        } catch (Exception ex) {
            return false;
        }
    }

    public Instant extractExpiry(String token) {
        return parseClaims(token).getExpiration().toInstant();
    }

    public Long extractUserId(String token) {
        Object uid = parseClaims(token).get("uid");
        if (uid instanceof Integer val) {
            return val.longValue();
        }
        if (uid instanceof Long val) {
            return val;
        }
        return Long.valueOf(uid.toString());
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    private Key getSigningKey() {
        String secret = appProperties.getSecurity().getJwt().getSecret();
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception ex) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
