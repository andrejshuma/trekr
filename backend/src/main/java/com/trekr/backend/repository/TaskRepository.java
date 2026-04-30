package com.trekr.backend.repository;

import com.trekr.backend.entity.discipline.Task;
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

    long countByDisciplineUser_UserIdAndFinishedTrue(Long userId);

    List<Task> findByDisciplineUser_UserIdAndFinishedTrue(Long userId);

    @Modifying
    @Query("update Task t set t.finished = false where t.disciplineUser.userId = :userId")
    int resetFinishedForUser(@Param("userId") Long userId);
}

