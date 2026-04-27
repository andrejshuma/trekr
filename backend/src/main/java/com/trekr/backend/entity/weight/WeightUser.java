package com.trekr.backend.entity.weight;

import com.trekr.backend.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "WEIGHT_USERS", schema = "trekr")
public class WeightUser {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "weight")
    private BigDecimal weight;

    @Column(name = "height")
    private BigDecimal height;

    @Column(name = "goal_weight")
    private BigDecimal goalWeight;

    @Column(name = "goal_calories")
    private BigDecimal goalCalories;

    public WeightUser() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
