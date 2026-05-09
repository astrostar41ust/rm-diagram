package com.rmdiagram.user;

import com.rmdiagram.exception.BadRequestException;
import com.rmdiagram.exception.ConflictException;
import com.rmdiagram.exception.NotFoundException;
import com.rmdiagram.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDto.UserResponse me(Long userId) {
        return UserDto.UserResponse.from(load(userId));
    }

    @Transactional
    public UserDto.UserResponse updateProfile(Long userId, UserDto.UpdateProfileRequest request) {
        User user = load(userId);

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new ConflictException("Email already in use: " + request.email());
            }
            user.setEmail(request.email());
        }
        if (request.username() != null
                && !request.username().equals(user.getDisplayUsername())) {
            if (userRepository.existsByUsername(request.username())) {
                throw new ConflictException("Username already taken: " + request.username());
            }
            user.setUsername(request.username());
        }
        if (request.firstname() != null) user.setFirstname(request.firstname());
        if (request.lastname() != null) user.setLastname(request.lastname());

        userRepository.save(user);
        log.debug("Updated profile for user {}", userId);
        return UserDto.UserResponse.from(user);
    }

    @Transactional
    public void changePassword(Long userId, UserDto.ChangePasswordRequest request) {
        User user = load(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BadRequestException("New password must differ from current password");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        log.info("Password changed for user {}", userId);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = load(userId);
        userRepository.delete(user);
        log.warn("Account deleted for user {} ({})", userId, user.getEmail());
    }

    private User load(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
