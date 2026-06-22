package com.trekr.backend.repository;

import com.trekr.backend.entity.discipline.Task;
import com.trekr.backend.entity.discipline.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByDisciplineUser_UserIdOrderByTaskIdDesc(Long userId, Pageable pageable);

    int deleteByTaskIdAndDisciplineUser_UserId(Long taskId, Long userId);

    long countByDisciplineUser_UserId(Long userId);

    long countByDisciplineUser_UserIdAndStatus(Long userId, TaskStatus status);

    List<Task> findByDisciplineUser_UserIdAndStatus(Long userId, TaskStatus status);

    List<Task> findByCustomTrackingCategory_CustomTrackingIdAndCustomTrackingCategory_User_UserIdOrderByTaskIdDesc(
            Long customTrackingId, Long userId);

    int deleteByTaskIdAndCustomTrackingCategory_CustomTrackingIdAndCustomTrackingCategory_User_UserId(
            Long taskId, Long customTrackingId, Long userId);

    @Modifying
    @Query("update Task t set t.status = :status where t.disciplineUser.userId = :userId")
    int resetStatusForUser(@Param("userId") Long userId, @Param("status") TaskStatus status);
}
