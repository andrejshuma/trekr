package com.trekr.backend.repository;

import com.trekr.backend.entity.discipline.DailyCompletion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyCompletionRepository extends JpaRepository<DailyCompletion, Long> {

    Optional<DailyCompletion> findByUser_UserIdAndDate(Long userId, LocalDate date);

    Page<DailyCompletion> findByUser_UserIdOrderByDateDescDailyCompletionIdDesc(Long userId, Pageable pageable);
}

