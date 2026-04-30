package com.trekr.backend.dto.discipline;

import jakarta.validation.constraints.NotNull;

public class UpdateTaskFinishedRequest {

    @NotNull
    private Boolean isFinished;

    public UpdateTaskFinishedRequest() {
    }

    public Boolean getIsFinished() {
        return isFinished;
    }

    public void setIsFinished(Boolean isFinished) {
        this.isFinished = isFinished;
    }
}

