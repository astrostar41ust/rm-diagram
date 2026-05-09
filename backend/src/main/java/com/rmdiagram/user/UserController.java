package com.rmdiagram.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto.UserResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.me(user.getId()));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserDto.UserResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserDto.UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(user.getId(), request));
    }

    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserDto.ChangePasswordRequest request) {
        userService.changePassword(user.getId(), request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal User user) {
        userService.deleteAccount(user.getId());
        return ResponseEntity.noContent().build();
    }
}
