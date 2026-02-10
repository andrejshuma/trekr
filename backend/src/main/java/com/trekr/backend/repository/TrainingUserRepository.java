package com.trekr.backend.repository;

import com.trekr.backend.entity.training.TrainingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingUserRepository extends JpaRepository<TrainingUser, Long> {
}
