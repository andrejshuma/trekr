package com.trekr.backend.service;

import com.trekr.backend.dto.discipline.CreateTaskRequest;
import com.trekr.backend.dto.discipline.DailyCompletionDto;
import com.trekr.backend.dto.discipline.DailyCompletionsResponse;
import com.trekr.backend.dto.discipline.TaskDto;
import com.trekr.backend.dto.discipline.TasksResponse;
import com.trekr.backend.dto.discipline.ComputeDailyCompletionResponse;
import com.trekr.backend.dto.discipline.UpdateTaskFinishedRequest;
import com.trekr.backend.dto.discipline.UpdateTaskRequest;
import com.trekr.backend.entity.User;
import com.trekr.backend.entity.discipline.DisciplineUser;
import com.trekr.backend.entity.discipline.DailyCompletion;
import com.trekr.backend.entity.discipline.Task;
import com.trekr.backend.entity.discipline.TaskDailyCompletion;
import com.trekr.backend.entity.discipline.TaskStatus;
import com.trekr.backend.entity.discipline.TaskDailyCompletionId;
import com.trekr.backend.repository.DailyCompletionRepository;
import com.trekr.backend.repository.DisciplineUserRepository;
import com.trekr.backend.repository.TaskRepository;
import com.trekr.backend.repository.TaskDailyCompletionRepository;
import com.trekr.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class DisciplineService {

    private final DisciplineUserRepository disciplineUserRepository;
    private final TaskRepository taskRepository;
    private final DailyCompletionRepository dailyCompletionRepository;
    private final TaskDailyCompletionRepository taskDailyCompletionRepository;
    private final UserRepository userRepository;

    public DisciplineService(
            DisciplineUserRepository disciplineUserRepository,
            TaskRepository taskRepository,
            DailyCompletionRepository dailyCompletionRepository,
            TaskDailyCompletionRepository taskDailyCompletionRepository,
            UserRepository userRepository) {
        this.disciplineUserRepository = disciplineUserRepository;
        this.taskRepository = taskRepository;
        this.dailyCompletionRepository = dailyCompletionRepository;
        this.taskDailyCompletionRepository = taskDailyCompletionRepository;
        this.userRepository = userRepository;
    }


    public boolean isTracking(Long userId) {
        return disciplineUserRepository.existsById(userId);
    }

    @Transactional
    public void startTracking(Long userId) {
        if (disciplineUserRepository.existsById(userId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DisciplineUser disciplineUser = new DisciplineUser();
        disciplineUser.setUser(user);
        disciplineUserRepository.save(disciplineUser);
    }

    @Transactional(readOnly = true)
    public TasksResponse getTasks(Long userId, int page, int size) {
        if (!disciplineUserRepository.existsById(userId)) {
            return new TasksResponse(List.of(), false);
        }

        Page<Task> result = taskRepository.findByDisciplineUser_UserIdOrderByTaskIdDesc(
                userId, PageRequest.of(page, size));

        List<TaskDto> tasks = result.getContent().stream()
                .map(t -> new TaskDto(t.getTaskId(), t.getName(), t.isFinished(), t.getStatus(), t.getDescription(), t.getDueDate(), t.getPriority()))
                .toList();

        return new TasksResponse(tasks, result.hasNext());
    }

    @Transactional
    public TaskDto createTask(Long userId, CreateTaskRequest request) {
        DisciplineUser disciplineUser = disciplineUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Discipline tracking is not enabled for this user"));

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
        task.setDisciplineUser(disciplineUser);

        Task saved = taskRepository.save(task);
        return new TaskDto(saved.getTaskId(), saved.getName(), saved.isFinished(), saved.getStatus(), saved.getDescription(), saved.getDueDate(), saved.getPriority());
    }

    @Transactional
    public TaskDto updateTask(Long userId, Long taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getDisciplineUser() == null || !userId.equals(task.getDisciplineUser().getUserId())) {
            throw new RuntimeException("Task not found");
        }

        String name = request.getName();
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Task name is required");
        }

        task.setName(name.trim());
        Task saved = taskRepository.save(task);
        return new TaskDto(saved.getTaskId(), saved.getName(), saved.isFinished(), saved.getStatus(), saved.getDescription(), saved.getDueDate(), saved.getPriority());
    }

    @Transactional
    public TaskDto updateTaskFinished(Long userId, Long taskId, UpdateTaskFinishedRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getDisciplineUser() == null || !userId.equals(task.getDisciplineUser().getUserId())) {
            throw new RuntimeException("Task not found");
        }

        Boolean finished = request.getIsFinished();
        if (finished == null) {
            throw new RuntimeException("isFinished is required");
        }

        task.setFinished(finished);
        Task saved = taskRepository.save(task);
        return new TaskDto(saved.getTaskId(), saved.getName(), saved.isFinished(), saved.getStatus(), saved.getDescription(), saved.getDueDate(), saved.getPriority());
    }

    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        if (taskId == null) {
            throw new RuntimeException("Task not found");
        }

        int deleted = taskRepository.deleteByTaskIdAndDisciplineUser_UserId(taskId, userId);
        if (deleted == 0) {
            throw new RuntimeException("Task not found");
        }
    }

    /**
     * Computes the daily completion percentage for the given date:
     * finished_tasks / total_tasks * 100
     * - Persisted once per user+date. If already computed, it is not re-computed.
     * - After computing, all tasks for that user are reset to unfinished.
     */
    @Transactional
    public ComputeDailyCompletionResponse computeDailyCompletion(Long userId, LocalDate date) {
        if (!disciplineUserRepository.existsById(userId)) {
            throw new RuntimeException("Discipline tracking is not enabled for this user");
        }

        if (date == null) {
            throw new RuntimeException("Date is required");
        }

        if (date.isAfter(LocalDate.now())) {
            throw new RuntimeException("Date cannot be in the future");
        }

        DailyCompletion existing = dailyCompletionRepository.findByUser_UserIdAndDate(userId, date).orElse(null);
        if (existing != null) {
            return new ComputeDailyCompletionResponse(false,
                    new DailyCompletionDto(existing.getDailyCompletionId(), existing.getDate(), existing.getProcent()));
        }

        long total = taskRepository.countByDisciplineUser_UserId(userId);
        long finished = taskRepository.countByDisciplineUser_UserIdAndStatus(userId, TaskStatus.FINISHED);

        BigDecimal percent;
        if (total <= 0) {
            percent = BigDecimal.ZERO;
        } else {
            percent = BigDecimal.valueOf(finished)
                    .multiply(new BigDecimal("100"))
                    .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DailyCompletion completion = new DailyCompletion();
        completion.setUser(user);
        completion.setDate(date);
        completion.setProcent(percent);
        DailyCompletion savedCompletion = dailyCompletionRepository.save(completion);

        // Link all tasks that were finished at calculation time
        // (not strictly required for now, but matches schema and enables future analytics)
        if (finished > 0) {
            List<TaskDailyCompletion> links = taskRepository.findByDisciplineUser_UserIdAndStatus(userId, TaskStatus.FINISHED)
                    .stream()
                    .map(t -> {
                        TaskDailyCompletion link = new TaskDailyCompletion();
                        link.setTask(t);
                        link.setDailyCompletion(savedCompletion);
                        link.setId(new TaskDailyCompletionId(t.getTaskId(), savedCompletion.getDailyCompletionId()));
                        return link;
                    })
                    .toList();
            taskDailyCompletionRepository.saveAll(links);
        }

        // Reset all tasks for next day
        taskRepository.resetStatusForUser(userId, TaskStatus.NOT_STARTED);

        DailyCompletionDto dto = new DailyCompletionDto(savedCompletion.getDailyCompletionId(),
                savedCompletion.getDate(), savedCompletion.getProcent());
        return new ComputeDailyCompletionResponse(true, dto);
    }

    @Transactional(readOnly = true)
    public DailyCompletionsResponse getDailyCompletions(Long userId, int page, int size) {
        if (!disciplineUserRepository.existsById(userId)) {
            return new DailyCompletionsResponse(List.of(), false);
        }

        Page<DailyCompletion> result = dailyCompletionRepository
                .findByUser_UserIdOrderByDateDescDailyCompletionIdDesc(userId, PageRequest.of(page, size));

        List<DailyCompletionDto> items = result.getContent().stream()
                .map(dc -> new DailyCompletionDto(dc.getDailyCompletionId(), dc.getDate(), dc.getProcent()))
                .toList();

        return new DailyCompletionsResponse(items, result.hasNext());
    }
}

