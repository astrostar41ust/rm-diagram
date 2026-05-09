package com.rmdiagram.settings;

import com.rmdiagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<SettingsDto.Response> getSettings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(settingsService.getSettings(user.getId()));
    }

    @PatchMapping
    public ResponseEntity<SettingsDto.Response> updateSettings(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SettingsDto.UpdateRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(user.getId(), request));
    }
}
