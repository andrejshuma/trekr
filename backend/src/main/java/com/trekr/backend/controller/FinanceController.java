package com.trekr.backend.controller;

import com.trekr.backend.dto.finance.CreateIncomeRequest;
import com.trekr.backend.dto.finance.FinanceProfileResponse;
import com.trekr.backend.dto.finance.FinanceStartRequest;
import com.trekr.backend.dto.finance.IncomeDto;
import com.trekr.backend.dto.finance.IncomesResponse;
import com.trekr.backend.dto.finance.TrackingStatusResponse;
import com.trekr.backend.security.UserPrincipal;
import com.trekr.backend.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/status")
    public TrackingStatusResponse status(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean tracking = financeService.isTracking(principal.getUserId());
        return new TrackingStatusResponse(tracking);
    }

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public TrackingStatusResponse start(@Valid @RequestBody FinanceStartRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        financeService.startOrUpdateTracking(principal.getUserId(), request);
        return new TrackingStatusResponse(true);
    }

    @GetMapping("/profile")
    public FinanceProfileResponse profile(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return financeService.getProfile(principal.getUserId());
    }

    @GetMapping("/incomes")
    public IncomesResponse incomes(
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
        return financeService.getIncomes(principal.getUserId(), page, size);
    }

    @PostMapping("/incomes")
    @ResponseStatus(HttpStatus.CREATED)
    public IncomeDto createIncome(@Valid @RequestBody CreateIncomeRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return financeService.createIncome(principal.getUserId(), request);
    }
}

