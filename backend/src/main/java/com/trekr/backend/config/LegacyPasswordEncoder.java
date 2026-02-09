package com.trekr.backend.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Supports both BCrypt (for new users) and plain text (for legacy seed data).
 * Use BCrypt for encoding; for matching, tries BCrypt first, then plain.
 */
public class LegacyPasswordEncoder implements PasswordEncoder {

    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        return bcrypt.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null || encodedPassword.isEmpty()) {
            return false;
        }
        if (encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$")) {
            return bcrypt.matches(rawPassword, encodedPassword);
        }
        return rawPassword.toString().equals(encodedPassword);
    }
}
