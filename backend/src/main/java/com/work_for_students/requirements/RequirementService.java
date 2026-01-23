package com.work_for_students.requirements;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RequirementService {
    private final RequirementRepository requirementRepository;

    public RequirementService(RequirementRepository requirementRepository) {
        this.requirementRepository = requirementRepository;
    }

    public List<Requirement> getAllRequirements() {
        return requirementRepository.findAll();
    }

    public Requirement addRequirement(Requirement requirement) {
        if (requirement.getName() == null || requirement.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nazwa wymagania nie może być pusta.");
        }
        return requirementRepository.save(requirement);
    }
}