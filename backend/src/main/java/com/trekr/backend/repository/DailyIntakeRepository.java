package com.trekr.backend.repository;

import com.trekr.backend.entity.weight.DailyIntake;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface DailyIntakeRepository extends JpaRepository<DailyIntake, Long> {
    Page<DailyIntake> findByWeightUser_UserIdOrderByDateDesc(Long userId, Pageable pageable);

    boolean existsByWeightUser_UserIdAndDate(Long userId, LocalDate date);
}

