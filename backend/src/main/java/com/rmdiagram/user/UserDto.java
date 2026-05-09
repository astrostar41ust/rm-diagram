package com.rmdiagram.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class UserDto {

    private UserDto() {}

    public record UserResponse(
            Long id,
            String email,
            String username,
            String firstname,
            String lastname,
            Role role
    ) {
        public static UserResponse from(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getDisplayUsername(),
                    user.getFirstname(),
                    user.getLastname(),
                    user.getRole()
            );
        }
    }

    public record UpdateProfileRequest(
            @Size(min = 1, max = 100) String firstname,
            @Size(min = 1, max = 100) String lastname,
            @Size(min = 3, max = 50) String username,
            @Email @Size(max = 255) String email
    ) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 100) String newPassword
    ) {}
}
