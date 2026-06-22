package com.trekr.backend.dto.discipline;

import com.trekr.backend.entity.discipline.TaskStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class UpdateTaskRequest {

    @NotBlank
    private String name;

    private String description;
    private LocalDate dueDate;
    private String priority;
    private TaskStatus status;

    public UpdateTaskRequest() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
}
