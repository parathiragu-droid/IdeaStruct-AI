package com.ideastruct.application.service;

import com.ideastruct.exception.BadRequestException;
import com.ideastruct.exception.ConflictException;
import com.ideastruct.exception.ResourceNotFoundException;
import com.ideastruct.domain.model.Project;
import com.ideastruct.domain.model.ValidationIssue;
import com.ideastruct.infrastructure.database.repository.ProjectRepository;
import com.ideastruct.domain.validation.ValidationRuleEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ValidationService {

    private static final Logger log = LoggerFactory.getLogger(ValidationService.class);

    private final ProjectRepository projectRepository;
    private final ValidationRuleEngine validationRuleEngine;

    public ValidationService(ProjectRepository projectRepository, ValidationRuleEngine validationRuleEngine) {
        this.projectRepository = projectRepository;
        this.validationRuleEngine = validationRuleEngine;
    }

    public Project validateProject(String projectId, Long expectedRevision) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (expectedRevision != null && project.getRevision() != expectedRevision) {
            throw new ConflictException(
                    String.format("Revision conflict: current project revision is %d, expected %d.",
                            project.getRevision(), expectedRevision),
                    project.getRevision(), expectedRevision);
        }

        if (project.getBlueprint() == null || project.getBlueprint().isEmpty()) {
            throw new BadRequestException("Cannot validate project: no blueprint has been generated yet.");
        }

        List<ValidationIssue> issues = validationRuleEngine.validate(project.getBlueprint());

        // Concurrency guard: verify project revision has not changed during validation computation
        Project freshProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (freshProject.getRevision() != project.getRevision()) {
            throw new ConflictException(
                    String.format("Concurrent modification detected while validating. Current project revision is %d, expected %d.",
                            freshProject.getRevision(), project.getRevision()),
                    freshProject.getRevision(), project.getRevision());
        }

        freshProject.setValidationIssues(issues);
        freshProject.setValidationCheckedAt(Instant.now());

        log.info("Validated project '{}' ({}) - found {} issues", freshProject.getTitle(), projectId, issues.size());
        return projectRepository.save(freshProject);
    }
}
