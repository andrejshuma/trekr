package com.trekr.backend.dto.training;

import java.math.BigDecimal;

public class WorkoutTypeDto {

    private String type;
    private String label;
    private BigDecimal met;

    public WorkoutTypeDto() {
    }

    public WorkoutTypeDto(String type, String label, BigDecimal met) {
        this.type = type;
        this.label = label;
        this.met = met;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public BigDecimal getMet() {
        return met;
    }

    public void setMet(BigDecimal met) {
        this.met = met;
    }
}
