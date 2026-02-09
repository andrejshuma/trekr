package com.trekr.backend.entity.discipline;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class TaskDailyCompletionId implements Serializable {

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "daily_completion_id")
    private Long dailyCompletionId;

    public TaskDailyCompletionId() {
    }

    public TaskDailyCompletionId(Long taskId, Long dailyCompletionId) {
        this.taskId = taskId;
        this.dailyCompletionId = dailyCompletionId;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public Long getDailyCompletionId() {
        return dailyCompletionId;
    }

    public void setDailyCompletionId(Long dailyCompletionId) {
        this.dailyCompletionId = dailyCompletionId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        TaskDailyCompletionId that = (TaskDailyCompletionId) o;
        return Objects.equals(taskId, that.taskId) && Objects.equals(dailyCompletionId, that.dailyCompletionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(taskId, dailyCompletionId);
    }
}
