package com.trekr.backend.security;

import lombok.Getter;

import java.io.Serializable;

/**
 * Represents the currently logged-in user after we've validated their JWT.
 * Controllers can inject this or get it from SecurityContextHolder.
 */
@Getter
public class UserPrincipal implements Serializable {
    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final String username;
    private final String email;

    public UserPrincipal(Long userId, String username, String email) {
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}
