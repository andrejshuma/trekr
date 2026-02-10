package com.trekr.backend.dto.training;

import java.util.List;

public class TrainingSessionsResponse {

    private List<TrainingSessionDto> sessions;
    private boolean hasMore;

    public TrainingSessionsResponse() {
    }

    public TrainingSessionsResponse(List<TrainingSessionDto> sessions, boolean hasMore) {
        this.sessions = sessions;
        this.hasMore = hasMore;
    }

    public List<TrainingSessionDto> getSessions() {
        return sessions;
    }

    public void setSessions(List<TrainingSessionDto> sessions) {
        this.sessions = sessions;
    }

    public boolean isHasMore() {
        return hasMore;
    }

    public void setHasMore(boolean hasMore) {
        this.hasMore = hasMore;
    }
}
