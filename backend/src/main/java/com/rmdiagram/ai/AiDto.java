package com.rmdiagram.ai;

import jakarta.validation.constraints.NotBlank;

public final class AiDto {

    private AiDto() {
    }

    public record GenerateRequest(
            @NotBlank String prompt) {
    }

    public record GenerateResponse(
            String response) {
    }
}
