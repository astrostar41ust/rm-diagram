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
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDto.Response>> getBudgets(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(budgetService.getBudgets(user.getId()));
    }

    @PostMapping
    public ResponseEntity<BudgetDto.Response> createBudget(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BudgetDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.createBudget(user.getId(), request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BudgetDto.Response> updateBudget(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody BudgetDto.UpdateRequest request) {
        return ResponseEntity.ok(budgetService.updateBudget(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        budgetService.deleteBudget(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
