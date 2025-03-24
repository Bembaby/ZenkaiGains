package com.zenkaigains.zenkai_gains_server.controller;

import com.zenkaigains.zenkai_gains_server.entity.MuscleGroup;
import com.zenkaigains.zenkai_gains_server.repository.MuscleGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Import the annotation
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workouts")
@PreAuthorize("hasAuthority('ROLE_ADMIN')") // Restrict all endpoints in this controller to admins only
public class MuscleGroupController {

    @Autowired
    private MuscleGroupRepository muscleGroupRepository;

    // GET /api/workouts - Returns all muscle groups with exercises.
    @GetMapping
    public List<MuscleGroup> getAllMuscleGroups() {
        return muscleGroupRepository.findAll();
    }

    // POST /api/workouts - Create a new muscle group.
    @PostMapping
    public ResponseEntity<MuscleGroup> addMuscleGroup(@RequestBody MuscleGroup muscleGroup) {
        if (muscleGroup.getName() == null || muscleGroup.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (muscleGroupRepository.findByName(muscleGroup.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        MuscleGroup saved = muscleGroupRepository.save(new MuscleGroup(muscleGroup.getName().trim()));
        return ResponseEntity.ok(saved);
    }

    // DELETE /api/workouts/{name} - Delete a muscle group by its name.
    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteMuscleGroup(@PathVariable("name") String name) {
        Optional<MuscleGroup> groupOpt = muscleGroupRepository.findByName(name);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        muscleGroupRepository.delete(groupOpt.get());
        return ResponseEntity.ok().build();
    }

    // PUT /api/workouts/{oldName} - Update a muscle group's name.
    @PutMapping("/{oldName}")
    public ResponseEntity<MuscleGroup> updateMuscleGroup(@PathVariable("oldName") String oldName, @RequestBody Map<String, String> body) {
        String newName = body.get("newName");
        if (newName == null || newName.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Optional<MuscleGroup> groupOpt = muscleGroupRepository.findByName(oldName);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MuscleGroup group = groupOpt.get();
        group.setName(newName.trim());
        MuscleGroup updated = muscleGroupRepository.save(group);
        return ResponseEntity.ok(updated);
    }

    // POST /api/workouts/{name}/exercises - Add an exercise to a muscle group.
    @PostMapping("/{name}/exercises")
    public ResponseEntity<MuscleGroup> addExercise(@PathVariable("name") String name, @RequestBody Map<String, String> body) {
        String exercise = body.get("exercise");
        if (exercise == null || exercise.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Optional<MuscleGroup> groupOpt = muscleGroupRepository.findByName(name);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MuscleGroup group = groupOpt.get();
        group.getExercises().add(exercise.trim());
        MuscleGroup updated = muscleGroupRepository.save(group);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/workouts/{name}/exercises/{exercise} - Delete an exercise from a muscle group.
    @DeleteMapping("/{name}/exercises/{exercise}")
    public ResponseEntity<MuscleGroup> deleteExercise(@PathVariable("name") String name, @PathVariable("exercise") String exercise) {
        Optional<MuscleGroup> groupOpt = muscleGroupRepository.findByName(name);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MuscleGroup group = groupOpt.get();
        boolean removed = group.getExercises().removeIf(e -> e.equalsIgnoreCase(exercise));
        if (!removed) {
            return ResponseEntity.notFound().build();
        }
        MuscleGroup updated = muscleGroupRepository.save(group);
        return ResponseEntity.ok(updated);
    }
}
