package com.rmdiagram.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.ai")
public class AiConfig {

    private String provider;
    private String ollamaUrl;
    private String model;
}