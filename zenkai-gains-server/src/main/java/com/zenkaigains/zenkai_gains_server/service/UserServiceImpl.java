package com.zenkaigains.zenkai_gains_server.service;

import com.zenkaigains.zenkai_gains_server.entity.User;
import com.zenkaigains.zenkai_gains_server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User getUserByEmail(String email) {
        // Since findByEmail now returns Optional<User>, use orElse(null) or handle it appropriately
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public User updateUserProfile(User updatedUser, String email) {
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            existingUser.setUsername(updatedUser.getUsername());
            existingUser.setBio(updatedUser.getBio());
            existingUser.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
            return userRepository.save(existingUser);
        }
        return null;
    }
}
