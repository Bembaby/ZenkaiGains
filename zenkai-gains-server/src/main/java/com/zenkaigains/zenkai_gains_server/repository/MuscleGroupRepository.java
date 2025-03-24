package com.zenkaigains.zenkai_gains_server.repository;

import com.zenkaigains.zenkai_gains_server.entity.MuscleGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MuscleGroupRepository extends JpaRepository<MuscleGroup, Long> {
    Optional<MuscleGroup> findByName(String name);
    void deleteByName(String name);
}
