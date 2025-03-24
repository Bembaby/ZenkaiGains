package com.zenkaigains.zenkai_gains_server.dto;

import java.time.LocalDateTime;

public class UserPublicProfileDTO {
    private int id; // or Long id, matching your entity
    private String username;
    private String bio;
    private String profilePictureUrl;
    private LocalDateTime joinedDate;
    private int powerLevel; // adjust type as needed
    private int completedWorkouts; // adjust type as needed

    // Getters and setters

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getBio() {
        return bio;
    }
    public void setBio(String bio) {
        this.bio = bio;
    }
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
    public LocalDateTime getJoinedDate() {
        return joinedDate;
    }
    public void setJoinedDate(LocalDateTime joinedDate) {
        this.joinedDate = joinedDate;
    }
    public int getPowerLevel() {
        return powerLevel;
    }
    public void setPowerLevel(int powerLevel) {
        this.powerLevel = powerLevel;
    }
    public int getCompletedWorkouts() {
        return completedWorkouts;
    }
    public void setCompletedWorkouts(int completedWorkouts) {
        this.completedWorkouts = completedWorkouts;
    }
}
