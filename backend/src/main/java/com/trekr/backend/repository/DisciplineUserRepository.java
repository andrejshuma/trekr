package com.trekr.backend.repository;

import com.trekr.backend.entity.discipline.DisciplineUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisciplineUserRepository extends JpaRepository<DisciplineUser, Long> {
}

