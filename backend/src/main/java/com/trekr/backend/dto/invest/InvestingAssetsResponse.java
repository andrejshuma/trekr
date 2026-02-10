package com.trekr.backend.dto.invest;

import java.util.List;

public class InvestingAssetsResponse {

    private List<AssetDto> assets;
    private boolean hasMore;

    public InvestingAssetsResponse() {
    }

    public InvestingAssetsResponse(List<AssetDto> assets, boolean hasMore) {
        this.assets = assets;
        this.hasMore = hasMore;
    }

    public List<AssetDto> getAssets() {
        return assets;
    }

    public void setAssets(List<AssetDto> assets) {
        this.assets = assets;
    }

    public boolean isHasMore() {
        return hasMore;
    }

    public void setHasMore(boolean hasMore) {
        this.hasMore = hasMore;
    }
}
