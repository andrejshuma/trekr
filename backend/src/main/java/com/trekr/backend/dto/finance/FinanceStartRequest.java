package com.trekr.backend.dto.finance;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class FinanceStartRequest {

    @NotNull
    private BigDecimal spendingBudget;

    @NotNull
    private BigDecimal savingBudget;

    @NotNull
    private BigDecimal investingBudget;

    @NotNull
    private BigDecimal donationBudget;

    @NotNull
    private BigDecimal credit;

    public FinanceStartRequest() {
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

