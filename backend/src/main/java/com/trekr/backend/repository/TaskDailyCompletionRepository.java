package com.trekr.backend.repository;

import com.trekr.backend.entity.discipline.TaskDailyCompletion;
import com.trekr.backend.entity.discipline.TaskDailyCompletionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskDailyCompletionRepository extends JpaRepository<TaskDailyCompletion, TaskDailyCompletionId> {
}

