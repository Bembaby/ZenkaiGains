package com.zenkaigains.zenkai_gains_server.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "transformations")
public class Transformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // The user who owns this transformation
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String gcsObjectName; // e.g. "transformations/USERID/file.png"

    @Column(nullable = false)
    private LocalDate dateTaken;

    @Column(nullable = false)
    private String pose;

    // Default constructor
    public Transformation() { }

    // Convenience constructor
    public Transformation(User user, String gcsObjectName, LocalDate dateTaken, String pose) {
        this.user = user;
        this.gcsObjectName = gcsObjectName;
        this.dateTaken = dateTaken;
        this.pose = pose;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    // No setter for id if you want to keep it immutable,
    // but you can add it if you prefer:
    public void setId(int id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getGcsObjectName() {
        return gcsObjectName;
    }

    public void setGcsObjectName(String gcsObjectName) {
        this.gcsObjectName = gcsObjectName;
    }

    public LocalDate getDateTaken() {
        return dateTaken;
    }

    public void setDateTaken(LocalDate dateTaken) {
        this.dateTaken = dateTaken;
    }

    public String getPose() {
        return pose;
    }

    public void setPose(String pose) {
        this.pose = pose;
    }
}
