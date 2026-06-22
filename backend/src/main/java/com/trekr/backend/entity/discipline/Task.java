package com.trekr.backend.entity.discipline;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "TASKS", schema = "trekr")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status = TaskStatus.NOT_STARTED;

    @Column(name = "description")
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "priority")
    private String priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discipline_user_id")
    private DisciplineUser disciplineUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_tracking_id")
    private CustomTrackingCategory customTrackingCategory;

    public Task() {
    }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public boolean isFinished() { return TaskStatus.FINISHED == status; }
    public void setFinished(boolean finished) {
        this.status = finished ? TaskStatus.FINISHED : TaskStatus.NOT_STARTED;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public DisciplineUser getDisciplineUser() { return disciplineUser; }
    public void setDisciplineUser(DisciplineUser disciplineUser) { this.disciplineUser = disciplineUser; }

    public CustomTrackingCategory getCustomTrackingCategory() { return customTrackingCategory; }
    public void setCustomTrackingCategory(CustomTrackingCategory customTrackingCategory) {
        this.customTrackingCategory = customTrackingCategory;
    }
}
