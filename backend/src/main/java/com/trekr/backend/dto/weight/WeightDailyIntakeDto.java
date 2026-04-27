package com.trekr.backend.dto.weight;

import java.math.BigDecimal;
import java.time.LocalDate;

public class WeightDailyIntakeDto {

    private Long dailyIntakeId;
    private LocalDate date;
    private BigDecimal calories;
    private boolean trainedThatDay;
    private BigDecimal burnedCalories;

    public WeightDailyIntakeDto() {
    }

    public WeightDailyIntakeDto(Long dailyIntakeId, LocalDate date, BigDecimal calories) {
        this.dailyIntakeId = dailyIntakeId;
        this.date = date;
        this.calories = calories;
        this.trainedThatDay = false;
        this.burnedCalories = BigDecimal.ZERO;
    }

    public WeightDailyIntakeDto(Long dailyIntakeId, LocalDate date, BigDecimal calories, boolean trainedThatDay, BigDecimal burnedCalories) {
        this.dailyIntakeId = dailyIntakeId;
        this.date = date;
        this.calories = calories;
        this.trainedThatDay = trainedThatDay;
        this.burnedCalories = burnedCalories;
    }

    public Long getDailyIntakeId() {
        return dailyIntakeId;
    }

    public void setDailyIntakeId(Long dailyIntakeId) {
        this.dailyIntakeId = dailyIntakeId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getCalories() {
        return calories;
    }

    public void setCalories(BigDecimal calories) {
        this.calories = calories;
    }

    public boolean isTrainedThatDay() {
        return trainedThatDay;
    }

    public void setTrainedThatDay(boolean trainedThatDay) {
        this.trainedThatDay = trainedThatDay;
    }

    public BigDecimal getBurnedCalories() {
        return burnedCalories;
    }

    public void setBurnedCalories(BigDecimal burnedCalories) {
        this.burnedCalories = burnedCalories;
    }
}

