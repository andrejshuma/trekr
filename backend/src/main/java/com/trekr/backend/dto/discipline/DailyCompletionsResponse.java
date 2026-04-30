package com.trekr.backend.dto.discipline;

import java.util.List;

public record DailyCompletionsResponse(List<DailyCompletionDto> completions, boolean hasMore) {
}

