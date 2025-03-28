package com.zenkaigains.zenkai_gains_server.controller;

import com.zenkaigains.zenkai_gains_server.dto.UserPublicProfileDTO;
import com.zenkaigains.zenkai_gains_server.entity.EmailVerificationToken;
import com.zenkaigains.zenkai_gains_server.entity.User;
import com.zenkaigains.zenkai_gains_server.repository.EmailVerificationTokenRepository;
import com.zenkaigains.zenkai_gains_server.repository.UserRepository;
import com.zenkaigains.zenkai_gains_server.service.JWTService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * ✅ Verify email from token
     */
    @GetMapping("/verify-email")
    public void verifyEmail(@RequestParam("token") String token, HttpServletResponse response) throws IOException {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) {
            response.sendRedirect("http://localhost:3000/login?verification=invalid");
            return;
        }
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            response.sendRedirect("http://localhost:3000/login?verification=expired");
            return;
        }

        User user = verificationToken.getUser();
        user.setIsVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);

        response.sendRedirect("http://localhost:3000/login?verified=true");
    }

    /**
     * ✅ Login and set JWT cookie (token now includes roles)
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(401).body("Invalid Credentials");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid Credentials");
        }

        if (user.getIsVerified() == null || !user.getIsVerified()) {
            return ResponseEntity.status(403).body("Please verify your email before logging in.");
        }

        // Generate a JWT token that now contains a "roles" claim.
        String token = jwtService.generateToken(user);

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Login successful");
    }

    /**
     * ✅ Get authenticated user's email
     */
    /**
     * ✅ Enhanced /auth/me that returns user email + roles in JSON.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null || !jwtService.validateToken(token)) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        // Extract email from JWT
        String email = jwtService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();

        // Gather roles from user.getRoles()
        // Suppose user.getRoles() returns List<Role> and role.getName() returns an Enum like ROLE_ADMIN
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())  // e.g. "ROLE_ADMIN"
                .collect(Collectors.toList());

        // Return JSON with email + roles
        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("roles", roles);

        return ResponseEntity.ok(response);
    }


    /**
     * ✅ Logout by clearing JWT cookie
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie emptyCookie = ResponseCookie.from("jwt", "")
                .path("/")
                .secure(false)
                .sameSite("Lax")
                .maxAge(0)
                .httpOnly(true)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, emptyCookie.toString())
                .body("Logged out");
    }

    /**
     * ✅ Fetch user profile (NEW FIX)
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null || !jwtService.validateToken(token)) {
            System.out.println("❌ Unauthorized - No valid token found.");
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = jwtService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            System.out.println("❌ User not found in database.");
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        UserPublicProfileDTO dto = new UserPublicProfileDTO();
        dto.setUsername(user.getUsername());
        dto.setBio(user.getBio());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setJoinedDate(user.getCreatedAt());
        System.out.println("✅ User profile found: " + user.getUsername());
        return ResponseEntity.ok(dto);
    }

    /**
     * ✅ Public Profile by username
     */
    @GetMapping("/public/profile/{username}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User user = userOpt.get();
        UserPublicProfileDTO dto = new UserPublicProfileDTO();
        dto.setUsername(user.getUsername());
        dto.setBio(user.getBio());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setJoinedDate(user.getCreatedAt());

        return ResponseEntity.ok(dto);
    }

    /**
     * ✅ Update profile (NEW FIX)
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser, HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null || !jwtService.validateToken(token)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = jwtService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User existingUser = userOpt.get();
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setBio(updatedUser.getBio());
        existingUser.setProfilePictureUrl(updatedUser.getProfilePictureUrl());

        userRepository.save(existingUser);
        return ResponseEntity.ok(existingUser);
    }

    /**
     * ✅ Extract JWT token from Cookie OR Authorization Header (NEW FIX)
     */
    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    System.out.println("✅ Extracted JWT from cookie.");
                    return cookie.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            System.out.println("✅ Extracted JWT from Authorization header.");
            return authHeader.substring(7);
        }
        System.out.println("❌ No JWT token found.");
        return null;
    }

    /**
     * ✅ LoginRequest DTO
     */
    private static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
