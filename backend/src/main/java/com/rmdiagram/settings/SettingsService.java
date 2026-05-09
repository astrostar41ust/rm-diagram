package com.rmdiagram.settings;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettingsService {

    private final SettingsRepository settingsRepository;

    @Transactional
    public SettingsDto.Response getSettings(Long userId) {
        return SettingsDto.Response.from(getOrCreate(userId));
    }

    @Transactional
    public SettingsDto.Response updateSettings(Long userId, SettingsDto.UpdateRequest request) {
        Settings settings = getOrCreate(userId);
        if (request.currency() != null) settings.setCurrency(request.currency());
        if (request.monthlyBudget() != null) settings.setMonthlyBudget(request.monthlyBudget());
        if (request.theme() != null) settings.setTheme(request.theme());
        settings = settingsRepository.save(settings);
        log.debug("Updated settings for user {}", userId);
        return SettingsDto.Response.from(settings);
    }

    private Settings getOrCreate(Long userId) {
        return settingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.debug("Creating default settings for user {}", userId);
                    return settingsRepository.save(Settings.builder().userId(userId).build());
                });
    }
}
