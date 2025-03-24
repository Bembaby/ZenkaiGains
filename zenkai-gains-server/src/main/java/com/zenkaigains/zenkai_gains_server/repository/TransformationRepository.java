package com.zenkaigains.zenkai_gains_server.repository;

import com.zenkaigains.zenkai_gains_server.entity.Transformation;
import com.zenkaigains.zenkai_gains_server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransformationRepository extends JpaRepository<Transformation, Long> {
    List<Transformation> findByUser(User user);
    List<Transformation> findByGcsObjectName(String gcsObjectName);
}