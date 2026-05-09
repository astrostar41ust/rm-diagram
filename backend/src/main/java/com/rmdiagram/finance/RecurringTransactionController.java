package com.rmdiagram.finance;

import com.rmdiagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recurring-transactions")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService service;

    @GetMapping
    public ResponseEntity<List<RecurringDto.Response>> list(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.list(user.getId()));
    }

    @PostMapping
    public ResponseEntity<RecurringDto.Response> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody RecurringDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(user.getId(), request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RecurringDto.Response> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody RecurringDto.UpdateRequest request) {
        return ResponseEntity.ok(service.update(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        service.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
