package com.zenkaigains.zenkai_gains_server.controller;

import com.zenkaigains.zenkai_gains_server.dto.PresignedUrlRequest;
import com.zenkaigains.zenkai_gains_server.dto.PresignedUrlResponse;
import com.zenkaigains.zenkai_gains_server.dto.TransformationRequest;
import com.zenkaigains.zenkai_gains_server.entity.Transformation;
import com.zenkaigains.zenkai_gains_server.entity.User;
import com.zenkaigains.zenkai_gains_server.repository.TransformationRepository;
import com.zenkaigains.zenkai_gains_server.repository.UserRepository;
import com.zenkaigains.zenkai_gains_server.service.JWTService;
import com.zenkaigains.zenkai_gains_server.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transformation")
public class TransformationController {

    private static final Logger logger = LoggerFactory.getLogger(TransformationController.class);

    @Autowired
    private StorageService storageService;

    @Autowired
    private TransformationRepository transformationRepository;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/transformation/upload-url
     * Generates a signed URL for uploading a transformation image.
     * Consumes and produces JSON.
     */
    @PostMapping(
            value = "/upload-url",
            consumes = "application/json",
            produces = "application/json"
    )
    public ResponseEntity<?> getSignedUrl(@RequestBody PresignedUrlRequest request,
                                          HttpServletRequest httpRequest) {
        logger.debug("Received request to generate signed URL for transformation upload.");

        // 1) Validate token
        String token = extractToken(httpRequest);
        if (token == null || !jwtService.validateToken(token)) {
            logger.warn("Token missing or invalid.");
            return jsonError(HttpStatus.UNAUTHORIZED, "Unauthorized: invalid or missing token");
        }

        // 2) Find the user
        String email = jwtService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            logger.warn("User not found for email: {}", email);
            return jsonError(HttpStatus.NOT_FOUND, "User not found");
        }
        User user = userOpt.get();
        logger.debug("User found: {} (ID: {})", user.getUsername(), user.getId());

        // 3) Construct objectName (no uniqueness check; duplicates allowed)
        String objectName = "transformations/" + user.getId() + "/" + request.getFileName();
        logger.debug("Generated object name: {}", objectName);

        // 4) Generate a PUT-signed URL for uploading
        String uploadUrl = storageService.generateUploadUrl(
                storageService.getTransformationBucketName(),
                objectName,
                request.getContentType()
        );
        logger.debug("Generated signed upload URL: {}", uploadUrl);

        // 5) Return that upload URL
        PresignedUrlResponse resp = new PresignedUrlResponse(uploadUrl, objectName);
        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/transformation
     * Saves a transformation record (duplicates are allowed).
     */
    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> saveTransformation(@RequestBody TransformationRequest req,
                                                HttpServletRequest httpRequest) {
        logger.debug("Received request to save transformation record.");

        // 1) Validate token
        String token = extractToken(httpRequest);
        if (token == null || !jwtService.validateToken(token)) {
            logger.warn("Token missing or invalid while saving transformation.");
            return jsonError(HttpStatus.UNAUTHORIZED, "Unauthorized: invalid or missing token");
        }

        // 2) Find user
        String email = jwtService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            logger.warn("User not found for email: {}", email);
            return jsonError(HttpStatus.NOT_FOUND, "User not found");
        }
        User user = userOpt.get();

        // 3) Parse date
        LocalDate dateTaken;
        try {
            dateTaken = LocalDate.parse(req.getDate());
        } catch (Exception e) {
            logger.error("Invalid date format: {}", req.getDate(), e);
            return jsonError(HttpStatus.BAD_REQUEST, "Invalid date format: " + req.getDate());
        }

        // 4) Save transformation (duplicates allowed)
        Transformation transformation = new Transformation(
                user,
                req.getImageKey(),
                dateTaken,
                req.getPose()
        );
        transformationRepository.save(transformation);
        logger.debug("Saved transformation record for user {}: {}", user.getUsername(), transformation.getGcsObjectName());

        return ResponseEntity.ok(Collections.singletonMap("message", "Transformation saved"));
    }

    /**
     * GET /api/transformation
     * Lists all transformations for the logged-in user.
     */
    @GetMapping(produces = "application/json")
    public ResponseEntity<?> listTransformations(HttpServletRequest httpRequest) {
        logger.debug("Received request to list transformations.");

        // 1) Validate token
        String token = extractToken(httpRequest);
        if (token == null || !jwtService.validateToken(token)) {
            logger.warn("Token missing or invalid while listing transformations.");
            return jsonError(HttpStatus.UNAUTHORIZED, "Unauthorized: invalid or missing token");
        }

        // 2) Find user
        String email = jwtService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            logger.warn("User not found for email: {}", email);
            return jsonError(HttpStatus.NOT_FOUND, "User not found");
        }
        User user = userOpt.get();

        // 3) Return all transformations for that user
        List<Transformation> transformations = transformationRepository.findByUser(user);
        logger.debug("Found {} transformations for user {}", transformations.size(), user.getUsername());
        return ResponseEntity.ok(transformations);
    }

    /**
     * GET /api/transformation/image-url
     * Generates a signed GET URL for the transformation image (valid for 7 days).
     */
    @GetMapping(value = "/image-url", produces = "application/json")
    public ResponseEntity<?> getImageUrl(
            @RequestParam("objectName") String objectName,
            HttpServletRequest httpRequest
    ) {
        logger.debug("Received request for image URL for object: {}", objectName);

        // 1) Validate token
        String token = extractToken(httpRequest);
        if (token == null || !jwtService.validateToken(token)) {
            logger.warn("Token missing or invalid in image URL request.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Unauthorized"));
        }

        // 2) Find user
        String email = jwtService.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            logger.warn("User not found for email: {}", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "User not found"));
        }
        User user = userOpt.get();

        // 3) Find all transformations with that gcsObjectName
        //    (Duplicates are allowed, so we just pick the first one that belongs to this user)
        List<Transformation> transformations = transformationRepository.findByGcsObjectName(objectName);
        if (transformations.isEmpty()) {
            logger.warn("No transformation found for objectName: {}", objectName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Transformation not found"));
        }

        // 4) Check ownership among all duplicates
        //    If none belongs to this user, return 403
        Transformation matching = null;
        for (Transformation t : transformations) {
            if (t.getUser().getId() == user.getId()) {
                matching = t;
                break;
            }
        }
        if (matching == null) {
            logger.warn("User {} attempted to access transformations belonging to someone else.", user.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Access denied"));
        }

        // 5) Generate a GET-signed URL (valid for 7 days)
        String signedUrl = storageService.generateGetUrl(
                storageService.getTransformationBucketName(),
                objectName
        );
        logger.debug("Generated signed GET URL: {}", signedUrl);

        return ResponseEntity.ok(Collections.singletonMap("signedUrl", signedUrl));
    }

    /**
     * Extract JWT from cookie or Authorization header.
     */
    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    logger.debug("Extracted JWT from cookie.");
                    return cookie.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            logger.debug("Extracted JWT from Authorization header.");
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Helper to return JSON error responses.
     */
    private ResponseEntity<?> jsonError(HttpStatus status, String errorMessage) {
        logger.debug("Returning error ({}): {}", status, errorMessage);
        return ResponseEntity.status(status)
                .body(Collections.singletonMap("error", errorMessage));
    }
}
