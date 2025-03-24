package com.zenkaigains.zenkai_gains_server.dto;

public class PresignedUrlResponse {
    private String uploadUrl;
    private String objectName;

    public PresignedUrlResponse(String uploadUrl, String objectName) {
        this.uploadUrl = uploadUrl;
        this.objectName = objectName;
    }

    public String getUploadUrl() {
        return uploadUrl;
    }

    public String getObjectName() {
        return objectName;
    }
}
