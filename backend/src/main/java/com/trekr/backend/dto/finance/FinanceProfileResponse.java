package com.trekr.backend.dto.finance;

import java.math.BigDecimal;

public record FinanceProfileResponse(
        BigDecimal spendingBudget,
        BigDecimal savingBudget,
        BigDecimal investingBudget,
        BigDecimal donationBudget,
        BigDecimal credit) {
}

