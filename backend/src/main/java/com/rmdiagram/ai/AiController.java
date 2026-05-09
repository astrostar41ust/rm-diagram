package com.rmdiagram.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rmdiagram.user.User;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/week-summary")
    public ResponseEntity<AiDto.GenerateResponse> generateWeekSummary(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.generateWeekSummary(user.getId()));
    }

    @PostMapping("/prompt")
    public ResponseEntity<AiDto.GenerateResponse> generatePrompt(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AiDto.GenerateRequest request) {
        return ResponseEntity.ok(aiService.generatePrompt(user.getId(), request.prompt()));
    }

}
