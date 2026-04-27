package com.trekr.backend.repository;

import com.trekr.backend.entity.weight.WeightUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeightUserRepository extends JpaRepository<WeightUser, Long> {
}

