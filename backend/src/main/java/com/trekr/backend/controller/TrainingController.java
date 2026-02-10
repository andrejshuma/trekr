package com.trekr.backend.controller;

import com.trekr.backend.dto.training.CreateTrainingSessionRequest;
import com.trekr.backend.dto.training.TrainingSessionDto;
import com.trekr.backend.dto.training.TrainingStartRequest;
import com.trekr.backend.dto.training.TrainingSessionsResponse;
import com.trekr.backend.dto.training.TrainingProfileResponse;
import com.trekr.backend.dto.training.TrackingStatusResponse;
import com.trekr.backend.dto.training.WorkoutTypeDto;
import com.trekr.backend.security.UserPrincipal;
import com.trekr.backend.service.TrainingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @GetMapping("/status")
    public TrackingStatusResponse status(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean tracking = trainingService.isTracking(principal.getUserId());
        return new TrackingStatusResponse(tracking);
    }

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public TrackingStatusResponse start(@Valid @RequestBody TrainingStartRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        trainingService.startTracking(principal.getUserId(), request);
        return new TrackingStatusResponse(true);
    }

    @GetMapping("/sessions")
    public TrainingSessionsResponse sessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            Authentication authentication) {
        if (size < 1)
            size = 5;
        if (size > 50)
            size = 50;
        if (page < 0)
            page = 0;

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return trainingService.getSessions(principal.getUserId(), page, size);
    }

    @GetMapping("/workout-types")
    public List<WorkoutTypeDto> workoutTypes() {
        return trainingService.getWorkoutTypes();
    }

    @GetMapping("/profile")
    public TrainingProfileResponse profile(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return trainingService.getProfile(principal.getUserId());
    }

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public TrainingSessionDto createSession(
            @Valid @RequestBody CreateTrainingSessionRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return trainingService.createSession(principal.getUserId(), request);
    }
}
