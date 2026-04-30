package com.trekr.backend.repository;

import com.trekr.backend.entity.finance.FinanceUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinanceUserRepository extends JpaRepository<FinanceUser, Long> {
}

