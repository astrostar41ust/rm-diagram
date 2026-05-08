package com.rmdiagram.auth;

import com.rmdiagram.exception.ConflictException;
import com.rmdiagram.exception.UnauthorizedException;
import com.rmdiagram.user.Role;
import com.rmdiagram.user.User;
import com.rmdiagram.user.UserDto;
import com.rmdiagram.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered: " + request.email());
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already taken: " + request.username());
        }
        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .username(request.username())
                .firstname(request.firstname())
                .lastname(request.lastname())
                .role(Role.USER)
                .build();
        userRepository.save(user);
        log.info("Registered new user: {}", user.getEmail());
        return issueTokens(user);
    }

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        return issueTokens(user);
    }

    @Transactional
    public AuthDto.AuthResponse refresh(AuthDto.RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));
        if (stored.isRevoked() || stored.isExpired()) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }
        User user = stored.getUser();
        if (!jwtService.isTokenValid(request.refreshToken(), user)) {
            throw new UnauthorizedException("Refresh token signature invalid");
        }
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        return issueTokens(user);
    }

    private AuthDto.AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        RefreshToken stored = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshTokenExpirationMs()))
                .build();
        refreshTokenRepository.save(stored);
        return new AuthDto.AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirationMs() / 1000,
                UserDto.UserResponse.from(user)
        );
    }
}
