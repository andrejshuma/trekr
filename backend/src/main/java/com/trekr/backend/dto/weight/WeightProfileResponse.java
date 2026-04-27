package com.trekr.backend.dto.weight;

import java.math.BigDecimal;

public class WeightProfileResponse {

    private BigDecimal weight;
    private BigDecimal height;
    private BigDecimal goalWeight;
    private BigDecimal goalCalories;

    public WeightProfileResponse() {
    }

    public WeightProfileResponse(BigDecimal weight, BigDecimal height, BigDecimal goalWeight,
            BigDecimal goalCalories) {
        this.weight = weight;
        this.height = height;
        this.goalWeight = goalWeight;
        this.goalCalories = goalCalories;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public BigDecimal getHeight() {
        return height;
    }

    public void setHeight(BigDecimal height) {
        this.height = height;
    }

    public BigDecimal getGoalWeight() {
        return goalWeight;
    }

    public void setGoalWeight(BigDecimal goalWeight) {
        this.goalWeight = goalWeight;
    }


    public BigDecimal getGoalCalories() {
        return goalCalories;
    }

    public void setGoalCalories(BigDecimal goalCalories) {
        this.goalCalories = goalCalories;
    }
}

