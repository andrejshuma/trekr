package com.trekr.backend.dto.discipline;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class CreateTaskRequest {

    @NotBlank
    private String name;

    private String description;
    private LocalDate dueDate;
    private String priority;

    public CreateTaskRequest() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
