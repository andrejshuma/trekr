package com.trekr.backend.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IncomeDto(
        Long incomeId,
        LocalDate date,
        BigDecimal amount) {
}

