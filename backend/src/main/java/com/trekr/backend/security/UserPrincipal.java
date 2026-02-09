package com.trekr.backend.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.io.Serializable;

/**
 * Represents the currently logged-in user after we've validated their JWT.
 * Controllers can inject this or get it from SecurityContextHolder.
 */
@Getter
@RequiredArgsConstructor
public class UserPrincipal implements Serializable {
    private final Long userId;
    private final String username;
    private final String email;
}
