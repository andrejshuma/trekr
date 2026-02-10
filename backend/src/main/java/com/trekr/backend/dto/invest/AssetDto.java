package com.trekr.backend.dto.invest;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AssetDto {

    private Long assetId;
    private String tickerSymbol;
    private BigDecimal buyPrice;
    private LocalDate buyDate;
    private BigDecimal quantity;

    public AssetDto() {
    }

    public AssetDto(Long assetId, String tickerSymbol, BigDecimal buyPrice, LocalDate buyDate, BigDecimal quantity) {
        this.assetId = assetId;
        this.tickerSymbol = tickerSymbol;
        this.buyPrice = buyPrice;
        this.buyDate = buyDate;
        this.quantity = quantity;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public void setTickerSymbol(String tickerSymbol) {
        this.tickerSymbol = tickerSymbol;
    }

    public BigDecimal getBuyPrice() {
        return buyPrice;
    }

    public void setBuyPrice(BigDecimal buyPrice) {
        this.buyPrice = buyPrice;
    }

    public LocalDate getBuyDate() {
        return buyDate;
    }

    public void setBuyDate(LocalDate buyDate) {
        this.buyDate = buyDate;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }
}
