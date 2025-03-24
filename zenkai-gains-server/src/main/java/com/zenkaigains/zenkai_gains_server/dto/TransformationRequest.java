package com.zenkaigains.zenkai_gains_server.dto;

public class TransformationRequest {

    private String imageKey;
    private String date;
    private String pose;

    public TransformationRequest() {
    }

    public TransformationRequest(String imageKey, String date, String pose) {
        this.imageKey = imageKey;
        this.date = date;
        this.pose = pose;
    }

    // GETTERS
    public String getImageKey() {
        return imageKey;
    }

    public String getDate() {
        return date;
    }

    public String getPose() {
        return pose;
    }

    // SETTERS (again, only if needed)
    public void setImageKey(String imageKey) {
        this.imageKey = imageKey;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setPose(String pose) {
        this.pose = pose;
    }
}
