package com.trekr.backend.service;

import com.trekr.backend.dto.invest.AssetDto;
import com.trekr.backend.dto.invest.CreateAssetRequest;
import com.trekr.backend.dto.invest.InvestingAssetsResponse;
import com.trekr.backend.entity.User;
import com.trekr.backend.entity.invest.Asset;
import com.trekr.backend.entity.invest.InvestorUser;
import com.trekr.backend.repository.AssetRepository;
import com.trekr.backend.repository.InvestorUserRepository;
import com.trekr.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class InvestingService {

    private final InvestorUserRepository investorUserRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    public InvestingService(
            InvestorUserRepository investorUserRepository,
            AssetRepository assetRepository,
            UserRepository userRepository) {
        this.investorUserRepository = investorUserRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
    }

    public boolean isTracking(Long userId) {
        return investorUserRepository.existsById(userId);
    }

    @Transactional
    public void startTracking(Long userId) {
        if (investorUserRepository.existsById(userId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InvestorUser investorUser = new InvestorUser();
        investorUser.setUser(user);
        investorUserRepository.save(investorUser);
    }

    public InvestingAssetsResponse getAssets(Long userId, int page, int size) {
        if (!investorUserRepository.existsById(userId)) {
            return new InvestingAssetsResponse(List.of(), false);
        }

        Page<Asset> result = assetRepository
                .findByInvestorUser_UserIdOrderByAssetIdDesc(userId, PageRequest.of(page, size));

        List<AssetDto> assets = result.getContent().stream()
                .map(a -> new AssetDto(
                        a.getAssetId(),
                        a.getTickerSymbol(),
                        a.getBuyPrice(),
                        a.getBuyDate(),
                        a.getQuantity()))
                .toList();

        return new InvestingAssetsResponse(assets, result.hasNext());
    }

    @Transactional
    public AssetDto createAsset(Long userId, CreateAssetRequest request) {
        InvestorUser investorUser = investorUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Investing tracking is not enabled for this user"));

        String ticker = normalizeTicker(request.getTickerSymbol());
        if (ticker == null || ticker.isBlank()) {
            throw new RuntimeException("Ticker symbol is required");
        }

        if (ticker.length() > 30) {
            throw new RuntimeException("Ticker symbol is too long");
        }

        // Allow equities (AAPL), crypto pairs (BTC/USD), indices (^GSPC), FX pairs
        // (EURUSD=X), etc.
        if (!ticker.matches("^[A-Z0-9.^=\\-/]{1,30}$")) {
            throw new RuntimeException("Ticker symbol contains invalid characters");
        }

        LocalDate buyDate = request.getBuyDate();
        if (buyDate != null && buyDate.isAfter(LocalDate.now())) {
            throw new RuntimeException("Buy date cannot be in the future");
        }

        Asset asset = new Asset();
        asset.setInvestorUser(investorUser);
        asset.setTickerSymbol(ticker);
        asset.setQuantity(request.getQuantity());
        asset.setBuyPrice(request.getBuyPrice());
        asset.setBuyDate(buyDate);

        Asset saved = assetRepository.save(asset);

        return new AssetDto(
                saved.getAssetId(),
                saved.getTickerSymbol(),
                saved.getBuyPrice(),
                saved.getBuyDate(),
                saved.getQuantity());
    }

    @Transactional
    public void deleteAsset(Long userId, Long assetId) {
        if (assetId == null) {
            throw new RuntimeException("Asset not found");
        }

        int deleted = assetRepository.deleteByAssetIdAndInvestorUser_UserId(assetId, userId);
        if (deleted == 0) {
            throw new RuntimeException("Asset not found");
        }
    }

    private static String normalizeTicker(String tickerSymbol) {
        if (tickerSymbol == null) {
            return null;
        }
        return tickerSymbol.trim().toUpperCase(Locale.ROOT);
    }
}
