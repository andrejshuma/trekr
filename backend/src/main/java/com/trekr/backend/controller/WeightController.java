package com.trekr.backend.controller;

import com.trekr.backend.dto.weight.CreateDailyIntakeRequest;
import com.trekr.backend.dto.weight.TrackingStatusResponse;
import com.trekr.backend.dto.weight.WeightDailyIntakeDto;
import com.trekr.backend.dto.weight.WeightDailyIntakesResponse;
import com.trekr.backend.dto.weight.WeightProfileResponse;
import com.trekr.backend.dto.weight.WeightStartRequest;
import com.trekr.backend.dto.weight.TodayTrainingInfoDto;
import com.trekr.backend.security.UserPrincipal;
import com.trekr.backend.service.WeightService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weight")
public class WeightController {

    private final WeightService weightService;

    public WeightController(WeightService weightService) {
        this.weightService = weightService;
    }

    @GetMapping("/status")
    public TrackingStatusResponse status(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return new TrackingStatusResponse(weightService.isTracking(principal.getUserId()));
    }

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public TrackingStatusResponse start(
            @Valid @RequestBody WeightStartRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        weightService.startTracking(principal.getUserId(), request);
        return new TrackingStatusResponse(true);
    }

    @GetMapping("/profile")
    public WeightProfileResponse profile(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return weightService.getProfile(principal.getUserId());
    }

    @GetMapping("/intakes")
    public WeightDailyIntakesResponse intakes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            Authentication authentication) {
        if (size < 1) {
            size = 5;
        }
        if (size > 50) {
            size = 50;
        }
        if (page < 0) {
            page = 0;
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return weightService.getDailyIntakes(principal.getUserId(), page, size);
    }

    @PostMapping("/intakes")
    @ResponseStatus(HttpStatus.CREATED)
    public WeightDailyIntakeDto createDailyIntake(
            @Valid @RequestBody CreateDailyIntakeRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return weightService.createDailyIntake(principal.getUserId(), request);
    }

    @PutMapping("/profile")
    public WeightProfileResponse updateProfile(
            @Valid @RequestBody WeightStartRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return weightService.updateProfile(principal.getUserId(), request);
    }

    @GetMapping("/today-training")
    public TodayTrainingInfoDto getTodayTrainingInfo(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return weightService.getTodayTrainingInfo(principal.getUserId());
    }
}
