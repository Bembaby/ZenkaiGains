package com.zenkaigains.zenkai_gains_server.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.zenkaigains.zenkai_gains_server.dto.GoogleOAuthUser;
import com.zenkaigains.zenkai_gains_server.entity.User;
import com.zenkaigains.zenkai_gains_server.repository.UserRepository;
import com.zenkaigains.zenkai_gains_server.service.JWTService;
import com.zenkaigains.zenkai_gains_server.service.oauth.GoogleOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/oauth/google")
public class GoogleOAuthController {

    @Autowired
    private GoogleOAuthService googleOAuthService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/callback")
    public void handleGoogleCallback(@RequestParam(value = "code", required = false) String code,
                                     @RequestParam(value = "error", required = false) String error,
                                     HttpServletResponse response) throws IOException {
        // If there is an error parameter (e.g., user canceled), redirect to login
        if (error != null) {
            response.sendRedirect("http://localhost:3000/login?oauth=canceled");
            return;
        }
        // If code is missing, redirect with error
        if (code == null) {
            response.sendRedirect("http://localhost:3000/login?oauth=error");
            return;
        }

        try {
            // 1) Exchange the authorization code for tokens
            GoogleTokenResponse tokenResponse = googleOAuthService.exchangeCodeForTokens(code);

            // 2) Verify the ID token and extract user info
            GoogleOAuthUser googleUser = googleOAuthService.getUserFromIdToken(tokenResponse.getIdToken());

            // 3) Check if the user exists in the database; if not, create a new user.
            User user = userRepository.findByEmail(googleUser.getEmail()).orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail(googleUser.getEmail());
                user.setUsername(googleUser.getEmail()); // or your own logic
                user.setFirstName(googleUser.getFirstName() != null ? googleUser.getFirstName() : "");
                user.setLastName(googleUser.getLastName() != null ? googleUser.getLastName() : "");
                user.setIsVerified(true);

                // Generate a random password and hash it.
                String randomPassword = UUID.randomUUID().toString();
                user.setPasswordHash(passwordEncoder.encode(randomPassword));

                userRepository.save(user);
            }

            // 4) Optionally generate a local JWT for your session
            String jwt = jwtService.generateToken(user);

            // 5) Create an HttpOnly cookie with the JWT
            ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                    .httpOnly(true)
                    .secure(false) // set true in production with HTTPS
                    .path("/")
                    .maxAge(24 * 60 * 60) // token valid for 1 day
                    .build();

            // 6) Add the cookie to the response headers
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // 7) Redirect to your front-end home page
            response.sendRedirect("http://localhost:3000/home");
        } catch (Exception e) {
            e.printStackTrace();
            // If there's an error, redirect to login with an error parameter.
            response.sendRedirect("http://localhost:3000/login?oauth=error");
        }
    }
}
