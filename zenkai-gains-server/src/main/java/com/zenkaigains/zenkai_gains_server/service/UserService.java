package com.zenkaigains.zenkai_gains_server.service;

import com.zenkaigains.zenkai_gains_server.entity.User;

public interface UserService {
    User getUserByEmail(String email);
    User updateUserProfile(User updatedUser, String email);
}
