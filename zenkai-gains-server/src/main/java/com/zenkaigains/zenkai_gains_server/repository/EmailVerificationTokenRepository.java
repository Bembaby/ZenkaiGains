package com.zenkaigains.zenkai_gains_server.repository;

import com.zenkaigains.zenkai_gains_server.entity.EmailVerificationToken;
import com.zenkaigains.zenkai_gains_server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository  extends JpaRepository<EmailVerificationToken, Integer> {
    EmailVerificationToken findByToken(String token);
    EmailVerificationToken findByUser(User user);
}
