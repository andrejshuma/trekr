package com.trekr.backend.entity.discipline;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "TASKS", schema = "trekr")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "is_finished", nullable = false)
    private boolean finished;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discipline_user_id")
    private DisciplineUser disciplineUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_tracking_id")
    private CustomTrackingCategory customTrackingCategory;

    public Task() {
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isFinished() {
        return finished;
    }

    public void setFinished(boolean finished) {
        this.finished = finished;
    }

    public DisciplineUser getDisciplineUser() {
        return disciplineUser;
    }

    public void setDisciplineUser(DisciplineUser disciplineUser) {
        this.disciplineUser = disciplineUser;
    }

    public CustomTrackingCategory getCustomTrackingCategory() {
        return customTrackingCategory;
    }

    public void setCustomTrackingCategory(CustomTrackingCategory customTrackingCategory) {
        this.customTrackingCategory = customTrackingCategory;
    }
}
