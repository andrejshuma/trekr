package com.trekr.backend.dto.weight;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class WeightStartRequest {

    @NotNull(message = "Current weight is required")
    @Positive(message = "Current weight must be greater than 0")
    private BigDecimal weight;

    @NotNull(message = "Height is required")
    @Positive(message = "Height must be greater than 0")
    private BigDecimal height;

    @NotNull(message = "Goal weight is required")
    @Positive(message = "Goal weight must be greater than 0")
    private BigDecimal goalWeight;

    @PositiveOrZero(message = "Goal calories must be 0 or greater")
    private BigDecimal goalCalories;

    private Boolean autoCalculateTargets = Boolean.TRUE;

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

    public Boolean getAutoCalculateTargets() {
        return autoCalculateTargets;
    }

    public void setAutoCalculateTargets(Boolean autoCalculateTargets) {
        this.autoCalculateTargets = autoCalculateTargets;
    }
}

