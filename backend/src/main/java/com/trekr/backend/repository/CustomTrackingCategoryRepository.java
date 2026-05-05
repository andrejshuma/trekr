
package com.trekr.backend.repository;

import com.trekr.backend.entity.discipline.CustomTrackingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomTrackingCategoryRepository extends JpaRepository<CustomTrackingCategory, Long> {

	List<CustomTrackingCategory> findByUser_UserIdOrderByCustomTrackingIdDesc(Long userId);

	boolean existsByUser_UserIdAndNameIgnoreCase(Long userId, String name);
}


