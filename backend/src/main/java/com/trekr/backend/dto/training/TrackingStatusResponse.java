package com.trekr.backend.dto.training;

public class TrackingStatusResponse {

    private boolean tracking;

    public TrackingStatusResponse() {
    }

    public TrackingStatusResponse(boolean tracking) {
        this.tracking = tracking;
    }

    public boolean isTracking() {
        return tracking;
    }

    public void setTracking(boolean tracking) {
        this.tracking = tracking;
    }
}
