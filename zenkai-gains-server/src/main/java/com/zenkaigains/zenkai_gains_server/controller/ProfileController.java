package com.zenkaigains.zenkai_gains_server.controller;

import com.zenkaigains.zenkai_gains_server.entity.User;
import com.zenkaigains.zenkai_gains_server.repository.UserRepository;
import com.zenkaigains.zenkai_gains_server.service.StorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api") // everything in this class is prefixed with /api
public class ProfileController {

    @Autowired
    private StorageService storageService;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String email = getPrincipalEmail();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        return ResponseEntity.ok(userOpt.get());
    }

    /**
     * PUT /api/profile
     *  - updates user's username, bio, and/or profilePictureUrl
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        String email = getPrincipalEmail();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        if (updates.containsKey("username")) {
            user.setUsername(updates.get("username"));
        }
        if (updates.containsKey("bio")) {
            user.setBio(updates.get("bio"));
        }
        if (updates.containsKey("profilePictureUrl")) {
            user.setProfilePictureUrl(updates.get("profilePictureUrl"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    /**
     * POST /api/upload-profile-picture
     *  - upload a profile picture & store its public URL
     */
    @PostMapping("/upload-profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("profilePicture") MultipartFile file) {
        try {
            // 1) Upload file
            String publicUrl = storageService.uploadFile(file);

            // 2) Find user by email (principal)
            String email = getPrincipalEmail();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // 3) Update user
            User user = userOpt.get();
            user.setProfilePictureUrl(publicUrl);
            userRepository.save(user);

            // 4) Return public URL
            return ResponseEntity.ok(Collections.singletonMap("publicUrl", publicUrl));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        }
    }

    /**
     * Helper to get the currently-logged-in user's email from SecurityContext
     */
    private String getPrincipalEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            // Usually the user's email is stored in UserDetails.getUsername()
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }
}
