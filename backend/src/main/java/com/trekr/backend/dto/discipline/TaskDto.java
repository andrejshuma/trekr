package com.trekr.backend.dto.discipline;

import com.trekr.backend.entity.discipline.TaskStatus;

import java.time.LocalDate;

public record TaskDto(
        Long taskId,
        String name,
        boolean isFinished,
        TaskStatus status,
        String description,
        LocalDate dueDate,
        String priority
) {
}
