package com.trekr.backend.dto.discipline;

import com.trekr.backend.entity.discipline.TaskStatus;

public class UpdateTaskStatusRequest {
    private TaskStatus status;

    public UpdateTaskStatusRequest() {
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
}

