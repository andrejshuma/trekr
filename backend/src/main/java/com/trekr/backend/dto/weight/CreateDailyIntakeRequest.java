package com.trekr.backend.dto.weight;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class CreateDailyIntakeRequest {

    @NotNull(message = "Calories are required")
    @PositiveOrZero(message = "Calories must be 0 or greater")
    private BigDecimal calories;

    public BigDecimal getCalories() {
        return calories;
    }

    public void setCalories(BigDecimal calories) {
        this.calories = calories;
    }
}

