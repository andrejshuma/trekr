package com.trekr.backend.service;

import com.trekr.backend.dto.discipline.CreateCustomTrackingCategoryRequest;
import com.trekr.backend.dto.discipline.CreateTaskRequest;
import com.trekr.backend.dto.discipline.CustomTrackingCategoriesResponse;
import com.trekr.backend.dto.discipline.CustomTrackingCategoryDto;
import com.trekr.backend.dto.discipline.TaskDto;
import com.trekr.backend.dto.discipline.TasksResponse;
import com.trekr.backend.dto.discipline.UpdateTaskFinishedRequest;
import com.trekr.backend.dto.discipline.UpdateTaskRequest;
import com.trekr.backend.entity.User;
import com.trekr.backend.entity.discipline.CustomTrackingCategory;
import com.trekr.backend.entity.discipline.Task;
import com.trekr.backend.repository.CustomTrackingCategoryRepository;
import com.trekr.backend.repository.TaskRepository;
import com.trekr.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomTrackingService {

    private final CustomTrackingCategoryRepository customTrackingCategoryRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public CustomTrackingService(
            CustomTrackingCategoryRepository customTrackingCategoryRepository,
            TaskRepository taskRepository,
            UserRepository userRepository) {
        this.customTrackingCategoryRepository = customTrackingCategoryRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public CustomTrackingCategoriesResponse getCustomTrackingCategories(Long userId) {
        List<CustomTrackingCategoryDto> items = customTrackingCategoryRepository
                .findByUser_UserIdOrderByCustomTrackingIdDesc(userId)
                .stream()
                .map(c -> new CustomTrackingCategoryDto(c.getCustomTrackingId(), c.getName()))
                .toList();

        return new CustomTrackingCategoriesResponse(items);
    }

    @Transactional
    public CustomTrackingCategoryDto createCustomTrackingCategory(Long userId, CreateCustomTrackingCategoryRequest request) {
        String name = request.getName();
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Name is required");
        }
        String trimmed = name.trim();
        if (trimmed.length() > 100) {
            throw new RuntimeException("Name is too long");
        }

        if (customTrackingCategoryRepository.existsByUser_UserIdAndNameIgnoreCase(userId, trimmed)) {
            throw new RuntimeException("Custom category with that name already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CustomTrackingCategory category = new CustomTrackingCategory();
        category.setUser(user);
        category.setName(trimmed);
        CustomTrackingCategory saved = customTrackingCategoryRepository.save(category);

        return new CustomTrackingCategoryDto(saved.getCustomTrackingId(), saved.getName());
    }

    public TasksResponse getCustomCategoryTasks(Long userId, Long customTrackingId) {
        requireOwnership(userId, customTrackingId);

        List<TaskDto> tasks = taskRepository
                .findByCustomTrackingCategory_CustomTrackingIdAndCustomTrackingCategory_User_UserIdOrderByTaskIdDesc(
                        customTrackingId, userId)
                .stream()
                .map(t -> new TaskDto(t.getTaskId(), t.getName(), t.isFinished()))
                .toList();

        return new TasksResponse(tasks, false);
    }

    @Transactional
    public TaskDto createCustomCategoryTask(Long userId, Long customTrackingId, CreateTaskRequest request) {
        CustomTrackingCategory category = requireOwnership(userId, customTrackingId);

        String name = request.getName();
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Task name is required");
        }
        if (name.length() > 200) {
            throw new RuntimeException("Task name is too long");
        }

        Task task = new Task();
        task.setName(name.trim());
        task.setFinished(false);
        task.setDisciplineUser(null);
        task.setCustomTrackingCategory(category);

        Task saved = taskRepository.save(task);
        return new TaskDto(saved.getTaskId(), saved.getName(), saved.isFinished());
    }

    @Transactional
    public TaskDto updateCustomCategoryTask(Long userId, Long customTrackingId, Long taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getCustomTrackingCategory() == null
                || !customTrackingId.equals(task.getCustomTrackingCategory().getCustomTrackingId())
                || task.getCustomTrackingCategory().getUser() == null
                || !userId.equals(task.getCustomTrackingCategory().getUser().getUserId())) {
            throw new RuntimeException("Task not found");
        }

        String name = request.getName();
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Task name is required");
        }

        task.setName(name.trim());
        Task saved = taskRepository.save(task);
        return new TaskDto(saved.getTaskId(), saved.getName(), saved.isFinished());
    }

    @Transactional
    public TaskDto updateCustomCategoryTaskFinished(Long userId, Long customTrackingId, Long taskId,
                                                    UpdateTaskFinishedRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getCustomTrackingCategory() == null
                || !customTrackingId.equals(task.getCustomTrackingCategory().getCustomTrackingId())
                || task.getCustomTrackingCategory().getUser() == null
                || !userId.equals(task.getCustomTrackingCategory().getUser().getUserId())) {
            throw new RuntimeException("Task not found");
        }

        Boolean finished = request.getIsFinished();
        if (finished == null) {
            throw new RuntimeException("isFinished is required");
        }

        task.setFinished(finished);
        Task saved = taskRepository.save(task);
        return new TaskDto(saved.getTaskId(), saved.getName(), saved.isFinished());
    }

    @Transactional
    public void deleteCustomCategoryTask(Long userId, Long customTrackingId, Long taskId) {
        if (taskId == null || customTrackingId == null) {
            throw new RuntimeException("Task not found");
        }

        int deleted = taskRepository
                .deleteByTaskIdAndCustomTrackingCategory_CustomTrackingIdAndCustomTrackingCategory_User_UserId(
                        taskId, customTrackingId, userId);
        if (deleted == 0) {
            throw new RuntimeException("Task not found");
        }
    }

    private CustomTrackingCategory requireOwnership(Long userId, Long customTrackingId) {
        if (customTrackingId == null) {
            throw new RuntimeException("Custom tracking category not found");
        }

        CustomTrackingCategory category = customTrackingCategoryRepository.findById(customTrackingId)
                .orElseThrow(() -> new RuntimeException("Custom tracking category not found"));

        if (category.getUser() == null || !userId.equals(category.getUser().getUserId())) {
            throw new RuntimeException("Custom tracking category not found");
        }

        return category;
    }
}

