package com.zenkaigains.zenkai_gains_server.controller;


import com.zenkaigains.zenkai_gains_server.dto.RegistrationRequest;
import com.zenkaigains.zenkai_gains_server.entity.User;
import com.zenkaigains.zenkai_gains_server.repository.UserRepository;
import com.zenkaigains.zenkai_gains_server.service.EmailVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class RegistrationController {

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest request) {
        // Basic validation...
        if (request.getFirstName() == null || request.getFirstName().isEmpty() ||
                request.getLastName() == null  || request.getLastName().isEmpty()  ||
                request.getEmail() == null     || request.getEmail().isEmpty()     ||
                request.getPassword() == null  || request.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }

        // Check if email is in use
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use.");
        }

        // Create the user...
        User user = new User();
        user.setUsername(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsVerified(false);

        userRepository.save(user);

        // Send verification email...
        try {
            emailVerificationService.createVerificationTokenForUser(user);
        } catch (Exception e) {
            System.err.println("Error sending verification email: " + e.getMessage());
        }

        return ResponseEntity.ok("User registered successfully! Please check your email to verify your account.");
    }


}
