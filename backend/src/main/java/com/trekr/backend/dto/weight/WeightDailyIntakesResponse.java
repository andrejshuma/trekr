package com.trekr.backend.dto.weight;

import java.util.List;

public class WeightDailyIntakesResponse {

    private List<WeightDailyIntakeDto> intakes;
    private boolean hasMore;
    private boolean hasTodayIntake;

    public WeightDailyIntakesResponse() {
    }

    public WeightDailyIntakesResponse(List<WeightDailyIntakeDto> intakes, boolean hasMore, boolean hasTodayIntake) {
        this.intakes = intakes;
        this.hasMore = hasMore;
        this.hasTodayIntake = hasTodayIntake;
    }

    public List<WeightDailyIntakeDto> getIntakes() {
        return intakes;
    }

    public void setIntakes(List<WeightDailyIntakeDto> intakes) {
        this.intakes = intakes;
    }

    public boolean isHasMore() {
        return hasMore;
    }

    public void setHasMore(boolean hasMore) {
        this.hasMore = hasMore;
    }

    public boolean isHasTodayIntake() {
        return hasTodayIntake;
    }

    public void setHasTodayIntake(boolean hasTodayIntake) {
        this.hasTodayIntake = hasTodayIntake;
    }
}

