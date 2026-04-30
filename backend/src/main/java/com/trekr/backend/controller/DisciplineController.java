package com.trekr.backend.controller;

import com.trekr.backend.dto.discipline.CreateTaskRequest;
import com.trekr.backend.dto.discipline.ComputeDailyCompletionResponse;
import com.trekr.backend.dto.discipline.DailyCompletionsResponse;
import com.trekr.backend.dto.discipline.TaskDto;
import com.trekr.backend.dto.discipline.TasksResponse;
import com.trekr.backend.dto.discipline.TrackingStatusResponse;
import com.trekr.backend.dto.discipline.UpdateTaskFinishedRequest;
import com.trekr.backend.dto.discipline.UpdateTaskRequest;
import com.trekr.backend.security.UserPrincipal;
import com.trekr.backend.service.DisciplineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/discipline")
public class DisciplineController {

    private final DisciplineService disciplineService;

    public DisciplineController(DisciplineService disciplineService) {
        this.disciplineService = disciplineService;
    }

    @GetMapping("/status")
    public TrackingStatusResponse status(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean tracking = disciplineService.isTracking(principal.getUserId());
        return new TrackingStatusResponse(tracking);
    }

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public TrackingStatusResponse start(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        disciplineService.startTracking(principal.getUserId());
        return new TrackingStatusResponse(true);
    }

    @GetMapping("/tasks")
    public TasksResponse tasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        if (size < 1)
            size = 20;
        if (size > 200)
            size = 200;
        if (page < 0)
            page = 0;

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return disciplineService.getTasks(principal.getUserId(), page, size);
    }

    @PostMapping("/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskDto createTask(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return disciplineService.createTask(principal.getUserId(), request);
    }

    @PutMapping("/tasks/{taskId}")
    public TaskDto updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return disciplineService.updateTask(principal.getUserId(), taskId, request);
    }

    @PatchMapping("/tasks/{taskId}/finished")
    public TaskDto updateTaskFinished(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskFinishedRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return disciplineService.updateTaskFinished(principal.getUserId(), taskId, request);
    }

    @DeleteMapping("/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @PathVariable Long taskId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        disciplineService.deleteTask(principal.getUserId(), taskId);
    }

    @PostMapping("/daily-completions/compute")
    public ComputeDailyCompletionResponse computeDailyCompletion(
            @RequestParam(required = false) LocalDate date,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        LocalDate target = (date != null) ? date : LocalDate.now();
        return disciplineService.computeDailyCompletion(principal.getUserId(), target);
    }

    @GetMapping("/daily-completions")
    public DailyCompletionsResponse dailyCompletions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "14") int size,
            Authentication authentication) {
        if (size < 1)
            size = 14;
        if (size > 365)
            size = 365;
        if (page < 0)
            page = 0;

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return disciplineService.getDailyCompletions(principal.getUserId(), page, size);
    }
}

