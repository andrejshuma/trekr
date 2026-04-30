package com.trekr.backend.dto.discipline;

import java.util.List;

public record TasksResponse(List<TaskDto> tasks, boolean hasMore) {
}

