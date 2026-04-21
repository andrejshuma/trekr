package com.trekr.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        // Load .env file BEFORE Spring Boot starts
        // This ensures system properties are available for ${} placeholder resolution
        Dotenv dotenv = loadEnvironmentVariables();

        // Create SpringApplication instance
        SpringApplication app = new SpringApplication(BackendApplication.class);

        // Set system properties and default properties from .env file
        if (dotenv != null) {
            java.util.Map<String, Object> defaultProps = new java.util.HashMap<>();

            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                if (value != null && !value.trim().isEmpty()) {
                    // Set as system property (for ${} placeholders in application.properties)
                    System.setProperty(key, value);
                    // Collect for default properties
                    defaultProps.put(key, value);
                }
            });

            // Set all default properties at once
            if (!defaultProps.isEmpty()) {
                app.setDefaultProperties(defaultProps);
            }
        }

        app.run(args);
    }

    private static Dotenv loadEnvironmentVariables() {
        Dotenv dotenv = null;

        // Prefer a standard ".env" file, but also support the existing "env" file.
        // We search multiple locations so it works whether the app is launched from:
        // - backend/ (common in IDE)
        // - repo root (common when running a built JAR)
        String[][] candidates = new String[][] {
                { "./", ".env" },
                { "./", "env" },
                { "./backend", ".env" },
                { "./backend", "env" },
                { "../", ".env" },
                { "../", "env" },
                { "../backend", ".env" },
                { "../backend", "env" },
        };

        for (String[] candidate : candidates) {
            try {
                Path envPath = Paths.get(candidate[0], candidate[1]).normalize();
                if (!Files.isRegularFile(envPath)) {
                    continue;
                }

                Dotenv loaded = Dotenv.configure()
                        .directory(envPath.getParent().toString())
                        .filename(envPath.getFileName().toString())
                        .ignoreIfMissing()
                        .load();
                if (loaded != null) {
                    dotenv = loaded;
                    break;
                }
            } catch (Exception ignored) {
                // keep searching
            }
        }

        return dotenv;
    }

}
