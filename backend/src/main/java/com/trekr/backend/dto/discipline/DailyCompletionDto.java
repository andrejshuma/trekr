package com.trekr.backend.dto.discipline;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyCompletionDto(Long dailyCompletionId, LocalDate date, BigDecimal procent) {
}

