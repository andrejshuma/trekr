package com.trekr.backend.dto.discipline;

import jakarta.validation.constraints.NotBlank;

public class UpdateTaskRequest {

    @NotBlank
    private String name;

    public UpdateTaskRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

