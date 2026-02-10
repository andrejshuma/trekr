package com.trekr.backend.controller;

import com.trekr.backend.dto.invest.AssetDto;
import com.trekr.backend.dto.invest.CreateAssetRequest;
import com.trekr.backend.dto.invest.InvestingAssetsResponse;
import com.trekr.backend.dto.invest.TrackingStatusResponse;
import com.trekr.backend.security.UserPrincipal;
import com.trekr.backend.service.InvestingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investing")
public class InvestingController {

    private final InvestingService investingService;

    public InvestingController(InvestingService investingService) {
        this.investingService = investingService;
    }

    @GetMapping("/status")
    public TrackingStatusResponse status(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean tracking = investingService.isTracking(principal.getUserId());
        return new TrackingStatusResponse(tracking);
    }

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public TrackingStatusResponse start(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        investingService.startTracking(principal.getUserId());
        return new TrackingStatusResponse(true);
    }

    @GetMapping("/assets")
    public InvestingAssetsResponse assets(
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
        return investingService.getAssets(principal.getUserId(), page, size);
    }

    @PostMapping("/assets")
    @ResponseStatus(HttpStatus.CREATED)
    public AssetDto createAsset(
            @Valid @RequestBody CreateAssetRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return investingService.createAsset(principal.getUserId(), request);
    }

    @DeleteMapping("/assets/{assetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAsset(
            @PathVariable Long assetId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        investingService.deleteAsset(principal.getUserId(), assetId);
    }
}
