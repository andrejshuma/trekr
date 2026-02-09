package com.trekr.backend.entity.weight;

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
@Table(name = "DAILY_INTAKES", schema = "trekr")
public class DailyIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "daily_intake_id")
    private Long dailyIntakeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private WeightUser weightUser;

    @Column(name = "calories")
    private BigDecimal calories;

    @Column(name = "date")
    private LocalDate date;

    public DailyIntake() {
    }

    public Long getDailyIntakeId() {
        return dailyIntakeId;
    }

    public void setDailyIntakeId(Long dailyIntakeId) {
        this.dailyIntakeId = dailyIntakeId;
    }

    public WeightUser getWeightUser() {
        return weightUser;
    }

    public void setWeightUser(WeightUser weightUser) {
        this.weightUser = weightUser;
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
}
