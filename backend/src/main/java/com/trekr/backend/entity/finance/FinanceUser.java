package com.trekr.backend.entity.finance;

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
@Table(name = "FINANCE_USERS", schema = "trekr")
public class FinanceUser {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "spending_budget")
    private BigDecimal spendingBudget;

    @Column(name = "saving_budget")
    private BigDecimal savingBudget;

    @Column(name = "investing_budget")
    private BigDecimal investingBudget;

    @Column(name = "donation_budget")
    private BigDecimal donationBudget;

    @Column(name = "credit")
    private BigDecimal credit;

    public FinanceUser() {
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

    public BigDecimal getSpendingBudget() {
        return spendingBudget;
    }

    public void setSpendingBudget(BigDecimal spendingBudget) {
        this.spendingBudget = spendingBudget;
    }

    public BigDecimal getSavingBudget() {
        return savingBudget;
    }

    public void setSavingBudget(BigDecimal savingBudget) {
        this.savingBudget = savingBudget;
    }

    public BigDecimal getInvestingBudget() {
        return investingBudget;
    }

    public void setInvestingBudget(BigDecimal investingBudget) {
        this.investingBudget = investingBudget;
    }

    public BigDecimal getDonationBudget() {
        return donationBudget;
    }

    public void setDonationBudget(BigDecimal donationBudget) {
        this.donationBudget = donationBudget;
    }

    public BigDecimal getCredit() {
        return credit;
    }

    public void setCredit(BigDecimal credit) {
        this.credit = credit;
    }
}
