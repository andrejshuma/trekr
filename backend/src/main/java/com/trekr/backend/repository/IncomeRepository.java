package com.trekr.backend.repository;

import com.trekr.backend.entity.finance.Income;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    Page<Income> findByFinanceUser_UserIdOrderByDateDescIncomeIdDesc(Long userId, Pageable pageable);
}

