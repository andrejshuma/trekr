package com.trekr.backend.entity.discipline;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "TASK_DAILY_COMPLETION", schema = "trekr")
public class TaskDailyCompletion {

    @EmbeddedId
    private TaskDailyCompletionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("taskId")
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dailyCompletionId")
    @JoinColumn(name = "daily_completion_id")
    private DailyCompletion dailyCompletion;

    public TaskDailyCompletion() {
    }

    public TaskDailyCompletionId getId() {
        return id;
    }

    public void setId(TaskDailyCompletionId id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public DailyCompletion getDailyCompletion() {
        return dailyCompletion;
    }

    public void setDailyCompletion(DailyCompletion dailyCompletion) {
        this.dailyCompletion = dailyCompletion;
    }
}
