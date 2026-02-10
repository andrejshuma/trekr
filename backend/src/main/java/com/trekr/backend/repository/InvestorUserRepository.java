package com.trekr.backend.repository;

import com.trekr.backend.entity.invest.InvestorUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvestorUserRepository extends JpaRepository<InvestorUser, Long> {
}
