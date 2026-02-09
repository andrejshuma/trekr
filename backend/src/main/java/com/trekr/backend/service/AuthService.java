package com.trekr.backend.service;

import com.trekr.backend.dto.auth.AuthResponse;
import com.trekr.backend.dto.auth.LoginRequest;
import com.trekr.backend.dto.auth.RegisterRequest;
import com.trekr.backend.entity.User;
import com.trekr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getUserId(), user.getUsername(), user.getEmail());
        return new AuthResponse(token, "Bearer", user.getUserId(), user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String usernameOrEmail = request.getUsernameOrEmail().trim();
        String emailLookup = usernameOrEmail.contains("@") ? usernameOrEmail.toLowerCase() : usernameOrEmail;
        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(emailLookup))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getUserId(), user.getUsername(), user.getEmail());
        return new AuthResponse(token, "Bearer", user.getUserId(), user.getUsername(), user.getEmail());
    }
}
