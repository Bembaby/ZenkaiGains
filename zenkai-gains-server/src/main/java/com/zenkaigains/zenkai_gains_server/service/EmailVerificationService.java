package com.zenkaigains.zenkai_gains_server.service;

import com.zenkaigains.zenkai_gains_server.entity.EmailVerificationToken;
import com.zenkaigains.zenkai_gains_server.entity.User;
import com.zenkaigains.zenkai_gains_server.repository.EmailVerificationTokenRepository;
import com.zenkaigains.zenkai_gains_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired MailService mailservice;

    public String generateToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    public EmailVerificationToken createVerificationTokenForUser(User user){
        // Delete a token if it exists
        EmailVerificationToken existing = tokenRepository.findByUser(user);
        if(existing != null){
            tokenRepository.delete(existing);
        }
        // Generate a new token
        String token = generateToken();
        // Create and save Entity
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);

        //Seding verification email
        String verifylink = "http://localhost:8080/auth/verify-email?token=" + token;
        mailservice.sendVerificationEmail(user.getEmail(),verifylink);

        return verificationToken;
    }
}
