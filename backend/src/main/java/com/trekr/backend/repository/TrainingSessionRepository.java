package com.trekr.backend.repository;

import com.trekr.backend.entity.training.TrainingSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {
    Page<TrainingSession> findByTrainingUser_UserIdOrderByDateDesc(Long userId, Pageable pageable);
    java.util.List<TrainingSession> findByTrainingUser_UserIdAndDate(Long userId, java.time.LocalDate date);
}
