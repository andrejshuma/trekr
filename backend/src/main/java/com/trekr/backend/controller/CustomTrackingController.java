package com.trekr.backend.controller;

import com.trekr.backend.dto.discipline.CreateCustomTrackingCategoryRequest;
import com.trekr.backend.dto.discipline.CreateTaskRequest;
import com.trekr.backend.dto.discipline.CustomTrackingCategoriesResponse;
import com.trekr.backend.dto.discipline.CustomTrackingCategoryDto;
import com.trekr.backend.dto.discipline.TaskDto;
import com.trekr.backend.dto.discipline.TasksResponse;
import com.trekr.backend.dto.discipline.UpdateTaskFinishedRequest;
import com.trekr.backend.dto.discipline.UpdateTaskRequest;
import com.trekr.backend.dto.discipline.UpdateTaskStatusRequest;
import com.trekr.backend.security.UserPrincipal;
import com.trekr.backend.service.CustomTrackingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discipline/custom-tracking-categories")
public class CustomTrackingController {

    private final CustomTrackingService customTrackingService;

    public CustomTrackingController(CustomTrackingService customTrackingService) {
        this.customTrackingService = customTrackingService;
    }

    @GetMapping
    public CustomTrackingCategoriesResponse customTrackingCategories(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return customTrackingService.getCustomTrackingCategories(principal.getUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomTrackingCategoryDto createCustomTrackingCategory(
            @Valid @RequestBody CreateCustomTrackingCategoryRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return customTrackingService.createCustomTrackingCategory(principal.getUserId(), request);
    }

    @GetMapping("/{customTrackingId}/tasks")
    public TasksResponse tasks(
            @PathVariable Long customTrackingId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return customTrackingService.getCustomCategoryTasks(principal.getUserId(), customTrackingId);
    }

    @PostMapping("/{customTrackingId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskDto createTask(
            @PathVariable Long customTrackingId,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return customTrackingService.createCustomCategoryTask(principal.getUserId(), customTrackingId, request);
    }

    @PutMapping("/{customTrackingId}/tasks/{taskId}")
    public TaskDto updateTask(
            @PathVariable Long customTrackingId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return customTrackingService.updateCustomCategoryTask(principal.getUserId(), customTrackingId, taskId, request);
    }

    @PatchMapping("/{customTrackingId}/tasks/{taskId}/finished")
    public TaskDto updateTaskFinished(
            @PathVariable Long customTrackingId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskFinishedRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return customTrackingService.updateCustomCategoryTaskFinished(principal.getUserId(), customTrackingId, taskId, request);
    }

    @PatchMapping("/{customTrackingId}/tasks/{taskId}/status")
    public TaskDto updateTaskStatus(
            @PathVariable Long customTrackingId,
            @PathVariable Long taskId,
            @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return customTrackingService.updateCustomCategoryTaskStatus(principal.getUserId(), customTrackingId, taskId, request);
    }

    @DeleteMapping("/{customTrackingId}/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @PathVariable Long customTrackingId,
            @PathVariable Long taskId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        customTrackingService.deleteCustomCategoryTask(principal.getUserId(), customTrackingId, taskId);
    }
}

