package com.rmdiagram.networth;

import com.rmdiagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/net-worth")
@RequiredArgsConstructor
public class NetWorthController {

    private final NetWorthService service;

    @GetMapping
    public ResponseEntity<NetWorthDto.OverviewResponse> overview(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getOverview(user.getId()));
    }

    @PostMapping("/accounts")
    public ResponseEntity<NetWorthDto.AccountResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NetWorthDto.CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createAccount(user.getId(), request));
    }

    @PatchMapping("/accounts/{id}")
    public ResponseEntity<NetWorthDto.AccountResponse> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody NetWorthDto.UpdateAccountRequest request) {
        return ResponseEntity.ok(service.updateAccount(user.getId(), id, request));
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        service.deleteAccount(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/snapshots")
    public ResponseEntity<NetWorthDto.SnapshotResponse> snapshot(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.snapshotToday(user.getId()));
    }
}
