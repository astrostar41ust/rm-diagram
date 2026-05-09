package com.rmdiagram.ai;

import com.rmdiagram.finance.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AiDto {

    private AiDto() {
    }

    public record GenerateRequest(
            @NotBlank String prompt) {
    }

    public record GenerateResponse(
            String response) {
    }

    public record SuggestCategoryRequest(
            @NotBlank @Size(max = 500) String note,
            @NotNull TransactionType type) {
    }

    public record SuggestCategoryResponse(
            Long categoryId,
            String categoryName) {
    }
}
