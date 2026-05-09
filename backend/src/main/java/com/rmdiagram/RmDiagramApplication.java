package com.rmdiagram;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RmDiagramApplication {

	public static void main(String[] args) {
		SpringApplication.run(RmDiagramApplication.class, args);
	}

}
