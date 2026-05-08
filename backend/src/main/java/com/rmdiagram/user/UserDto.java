package com.rmdiagram.user;

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
}
