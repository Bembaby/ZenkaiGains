package com.zenkaigains.zenkai_gains_server.controller;

import com.zenkaigains.zenkai_gains_server.dto.UserPublicProfileDTO;
import com.zenkaigains.zenkai_gains_server.entity.User;
import com.zenkaigains.zenkai_gains_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
public class PublicProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "User not found"));
        }
        User user = userOpt.get();

        // Create and populate the DTO with only public data.
        UserPublicProfileDTO dto = new UserPublicProfileDTO();
        dto.setId(user.getId());                         // assuming you have an id field
        dto.setUsername(user.getUsername());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setBio(user.getBio());
       // dto.setPowerLevel(user.getPowerLevel());         // if available Havent implemented yet
        dto.setJoinedDate(user.getCreatedAt());          // assuming createdAt is used as joined date
        //dto.setCompletedWorkouts(user.getCompletedWorkouts()); // if available havent implemented yet,

        return ResponseEntity.ok(dto);
    }
}
