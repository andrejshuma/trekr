package com.trekr.backend.dto.training;

import java.math.BigDecimal;

public class TrainingProfileResponse {

    private String gender;
    private Integer age;
    private BigDecimal weight;

    public TrainingProfileResponse() {
    }

    public TrainingProfileResponse(String gender, Integer age, BigDecimal weight) {
        this.gender = gender;
        this.age = age;
        this.weight = weight;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
}
