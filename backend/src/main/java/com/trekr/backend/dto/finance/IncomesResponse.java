package com.trekr.backend.dto.finance;

import java.util.List;

public record IncomesResponse(List<IncomeDto> incomes, boolean hasMore) {
}

