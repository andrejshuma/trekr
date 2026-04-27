package com.trekr.backend.dto.weight;

import java.math.BigDecimal;

public class TodayTrainingInfoDto {

    private boolean trainedToday;
    private BigDecimal totalBurnedCalories;

    public TodayTrainingInfoDto() {
    }

    public TodayTrainingInfoDto(boolean trainedToday, BigDecimal totalBurnedCalories) {
        this.trainedToday = trainedToday;
        this.totalBurnedCalories = totalBurnedCalories;
    }

    public boolean isTrainedToday() {
        return trainedToday;
    }

    public void setTrainedToday(boolean trainedToday) {
        this.trainedToday = trainedToday;
    }

    public BigDecimal getTotalBurnedCalories() {
        return totalBurnedCalories;
    }

    public void setTotalBurnedCalories(BigDecimal totalBurnedCalories) {
        this.totalBurnedCalories = totalBurnedCalories;
    }
}

