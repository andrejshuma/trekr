package com.trekr.backend.repository;

import com.trekr.backend.entity.invest.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    Page<Asset> findByInvestorUser_UserIdOrderByAssetIdDesc(Long userId, Pageable pageable);

    int deleteByAssetIdAndInvestorUser_UserId(Long assetId, Long userId);
}
