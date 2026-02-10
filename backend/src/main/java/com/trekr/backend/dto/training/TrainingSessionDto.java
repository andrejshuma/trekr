package com.trekr.backend.dto.training;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TrainingSessionDto {

    private Long trainingId;
    private LocalDate date;
    private String type;
    private BigDecimal duration;
    private BigDecimal calories;

    public TrainingSessionDto() {
    }

    public TrainingSessionDto(Long trainingId, LocalDate date, String type, BigDecimal duration, BigDecimal calories) {
        this.trainingId = trainingId;
        this.date = date;
        this.type = type;
        this.duration = duration;
        this.calories = calories;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
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
}
