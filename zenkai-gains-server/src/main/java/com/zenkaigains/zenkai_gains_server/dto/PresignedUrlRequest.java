package com.zenkaigains.zenkai_gains_server.dto;

public class PresignedUrlRequest {

    private String fileName;
    private String contentType;

    public PresignedUrlRequest() {
    }

    public PresignedUrlRequest(String fileName, String contentType) {
        this.fileName = fileName;
        this.contentType = contentType;
    }

    // GETTERS
    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    // SETTERS (optional if you need to set them externally)
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
}
