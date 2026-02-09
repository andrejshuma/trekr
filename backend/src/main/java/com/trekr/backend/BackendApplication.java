package com.trekr.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

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
        try {
            // Try current directory (backend/)
            dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMissing()
                    .load();
        } catch (Exception e) {
            // Try parent directory if current doesn't work
            try {
                dotenv = Dotenv.configure()
                        .directory("../")
                        .ignoreIfMissing()
                        .load();
            } catch (Exception e2) {
                System.err.println("WARNING: Could not load .env file. Make sure .env exists in backend/ directory.");
                System.err.println("Error: " + e2.getMessage());
                return null;
            }
        }
        
        // Verify critical properties are loaded
        if (dotenv != null) {
            String url = dotenv.get("SPRING_DATASOURCE_URL");
            String username = dotenv.get("SPRING_DATASOURCE_USERNAME");
            String password = dotenv.get("SPRING_DATASOURCE_PASSWORD");
            
            if (url != null && !url.trim().isEmpty()) {
                System.out.println("✓ Database URL loaded from .env");
            } else {
                System.err.println("✗ ERROR: SPRING_DATASOURCE_URL not found in .env file!");
            }
            if (username != null && !username.trim().isEmpty()) {
                System.out.println("✓ Database username loaded from .env");
            } else {
                System.err.println("✗ ERROR: SPRING_DATASOURCE_USERNAME not found in .env file!");
            }
            if (password != null && !password.trim().isEmpty()) {
                System.out.println("✓ Database password loaded from .env");
            } else {
                System.err.println("✗ ERROR: SPRING_DATASOURCE_PASSWORD not found in .env file!");
            }
        }
        
        return dotenv;
    }

}
