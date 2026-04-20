package com.trekr.backend.entity.training;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "TRAINING_SESSIONS", schema = "trekr")
public class TrainingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "training_id")
    private Long trainingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_user_id")
    private TrainingUser trainingUser;

    @Column(name = "duration")
    private BigDecimal duration;

    @Column(name = "calories")
    private BigDecimal calories;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "type")
    private String type;

    public TrainingSession() {
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
    }

    public TrainingUser getTrainingUser() {
        return trainingUser;
    }

    public void setTrainingUser(TrainingUser trainingUser) {
        this.trainingUser = trainingUser;
    }


    public BigDecimal getDuration() {
        return duration;
    }

    public void setDuration(BigDecimal duration) {
        this.duration = duration;
    }

    public BigDecimal getCalories() {
        return calories;
    }

    public void setCalories(BigDecimal calories) {
        this.calories = calories;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
