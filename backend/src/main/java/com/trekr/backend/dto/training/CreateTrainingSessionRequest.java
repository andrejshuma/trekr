package com.trekr.backend.dto.training;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateTrainingSessionRequest {

    @NotBlank
    private String type;

    @NotNull
    @DecimalMin(value = "1", inclusive = true)
    private BigDecimal durationMinutes;

    @NotNull
    private Boolean autoCalculateCalories;

    @DecimalMin(value = "0", inclusive = true)
    private BigDecimal calories;

    public CreateTrainingSessionRequest() {
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(BigDecimal durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Boolean getAutoCalculateCalories() {
        return autoCalculateCalories;
    }

    public void setAutoCalculateCalories(Boolean autoCalculateCalories) {
        this.autoCalculateCalories = autoCalculateCalories;
    }

    public BigDecimal getCalories() {
        return calories;
    }

    public void setCalories(BigDecimal calories) {
        this.calories = calories;
    }
}
