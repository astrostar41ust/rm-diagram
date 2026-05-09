package com.rmdiagram.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
public class OllamaClient {

    private final AiConfig aiConfig;
    private final RestClient restClient;

    public OllamaClient(AiConfig aiConfig) {
        this.aiConfig = aiConfig;
        this.restClient = RestClient.builder()
                .baseUrl(aiConfig.getOllamaUrl())
                .build();
    }

    private record OllamaRequest(String model, String prompt, boolean stream) {
    }

    private record OllamaResponse(String model, String response, boolean done) {
    }

    public String generate(String prompt) {
        log.debug("Generating with model: {}", aiConfig.getModel());

        OllamaRequest request = new OllamaRequest(aiConfig.getModel(), prompt, false);

        try {
            OllamaResponse response = restClient.post()
                    .uri("/api/generate")
                    .body(request)
                    .retrieve()
                    .body(OllamaResponse.class);

            return response.response();
        } catch (Exception e) {
            log.error("Ollama call failed: {}", e.getMessage());
            return "AI service is currently unavailable";
        }
    }

}
