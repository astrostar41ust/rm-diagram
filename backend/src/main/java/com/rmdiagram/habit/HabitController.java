package com.rmdiagram.habit;

import com.rmdiagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @PostMapping
    public ResponseEntity<HabitDto.Response> createHabit(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody HabitDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitService.createHabit(user.getId(), request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<HabitDto.Response> updateHabit(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody HabitDto.UpdateRequest request) {
        return ResponseEntity.ok(habitService.updateHabit(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        habitService.deleteHabit(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/grid")
    public ResponseEntity<HabitDto.GridResponse> getGrid(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(habitService.getGrid(user.getId(), from, to));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleCompletion(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean completed = habitService.toggleCompletion(user.getId(), id, date);
        return ResponseEntity.ok(Map.of("completed", completed));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<HabitDto.AnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam(defaultValue = "180") int days) {
        return ResponseEntity.ok(habitService.getAnalytics(user.getId(), id, days));
    }
}
