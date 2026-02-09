package com.trekr.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private static final long TOKEN_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 hours

    public JwtService(@Value("${jwt.secret}") String secret) {
        String key = secret != null && !secret.isBlank() ? secret : "dev-fallback-secret-min-32-chars-required";
        if (key.length() < 32) {
            key = key + "0".repeat(Math.max(0, 32 - key.length()));
        }
        this.signingKey = Keys.hmacShaKeyFor(key.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String username, String email) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY_MS))
                .signWith(signingKey)
                .compact();
    }
}
