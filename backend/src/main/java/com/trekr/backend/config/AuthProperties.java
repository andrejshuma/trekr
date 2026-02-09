package com.trekr.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter @Setter
@ConfigurationProperties(prefix = "auth")
public class AuthProperties {
    private String secret;
    private int accessTokenMaxAge;
    private int refreshTokenMaxAge;
}
