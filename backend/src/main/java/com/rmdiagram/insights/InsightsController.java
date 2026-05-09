package com.rmdiagram.insights;

import com.rmdiagram.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping
    public ResponseEntity<InsightsDto.InsightsResponse> get(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(insightsService.getInsights(user.getId()));
    }
}
