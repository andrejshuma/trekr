package com.trekr.backend.entity.discipline;

import com.trekr.backend.entity.User;
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
@Table(name = "DAILY_COMPLETION", schema = "trekr")
public class DailyCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "daily_completion_id")
    private Long dailyCompletionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "procent")
    private BigDecimal procent;

    public DailyCompletion() {
    }

    public Long getDailyCompletionId() {
        return dailyCompletionId;
    }

    public void setDailyCompletionId(Long dailyCompletionId) {
        this.dailyCompletionId = dailyCompletionId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getProcent() {
        return procent;
    }

    public void setProcent(BigDecimal procent) {
        this.procent = procent;
    }
}
