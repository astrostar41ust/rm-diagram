package com.rmdiagram.finance;

import com.rmdiagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/categories")
    public ResponseEntity<List<FinanceDto.CategoryResponse>> getCategories(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financeService.getCategories(user.getId()));
    }

    @PostMapping("/transactions")
    public ResponseEntity<FinanceDto.TransactionResponse> createTransaction(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody FinanceDto.CreateTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(financeService.createTransaction(user.getId(), request));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<FinanceDto.TransactionResponse>> getTransactions(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(financeService.getTransactions(user.getId(), categoryId, page, size));
    }

    @PatchMapping("/transactions/{id}")
    public ResponseEntity<FinanceDto.TransactionResponse> updateTransaction(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody FinanceDto.UpdateTransactionRequest request) {
        return ResponseEntity.ok(financeService.updateTransaction(user.getId(), id, request));
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        financeService.deleteTransaction(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/transactions/summary")
    public ResponseEntity<List<FinanceDto.MonthlySummary>> getMonthlySummary(
            @AuthenticationPrincipal User user,
            @RequestParam int year) {
        return ResponseEntity.ok(financeService.getMonthlySummary(user.getId(), year));
    }
}
