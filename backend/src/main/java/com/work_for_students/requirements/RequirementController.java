package com.work_for_students.requirements;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requirements")
public class RequirementController {
    private final RequirementService requirementService;

    public RequirementController(RequirementService requirementService) {
        this.requirementService = requirementService;
    }

    @GetMapping
    public List<Requirement> getAll() {
        return requirementService.getAllRequirements();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addRequirement(@RequestBody Requirement requirement) {
        try {
            Requirement saved = requirementService.addRequirement(requirement);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Wystąpił błąd podczas dodawania wymagania.");
        }
    }
}