package com.ideastruct.application.service;

import com.ideastruct.api.dto.CreateProjectRequest;
import com.ideastruct.api.dto.ProjectSummaryDTO;
import com.ideastruct.api.dto.UpdateProjectRequest;
import com.ideastruct.exception.BadRequestException;
import com.ideastruct.exception.ConflictException;
import com.ideastruct.exception.ResourceNotFoundException;
import com.ideastruct.domain.model.Project;
import com.ideastruct.infrastructure.database.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Project createProject(CreateProjectRequest request) {
        String trimmedTitle = request.getTitle() != null ? request.getTitle().trim() : "";
        String trimmedIdea = request.getIdea() != null ? request.getIdea().trim() : "";

        if (trimmedTitle.length() < 3 || trimmedTitle.length() > 120) {
            throw new BadRequestException("Project title must be between 3 and 120 characters.");
        }
        if (trimmedIdea.length() < 50 || trimmedIdea.length() > 10000) {
            throw new BadRequestException("Project idea must be between 50 and 10,000 characters.");
        }

        String typeOverride = normalizeTypeOverride(request.getTypeOverride());
        Project project = new Project(trimmedTitle, trimmedIdea, typeOverride);
        project.setRevision(1L);
        project.setCreatedAt(Instant.now());
        project.setUpdatedAt(Instant.now());
        return projectRepository.save(project);
    }

    public Page<ProjectSummaryDTO> getProjects(Pageable pageable) {
        return projectRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(ProjectSummaryDTO::fromProject);
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
    }

    public Project updateProject(String id, UpdateProjectRequest request, Long headerRevision) {
        Project project = getProjectById(id);

        Long expected = headerRevision != null ? headerRevision : request.getExpectedRevision();
        if (expected == null) {
            throw new BadRequestException("Expected revision must be specified via If-Match header or expectedRevision field.");
        }

        if (project.getRevision() != expected) {
            throw new ConflictException(
                    String.format("Project was modified concurrently. Current revision is %d, expected %d.",
                            project.getRevision(), expected),
                    project.getRevision(), expected);
        }

        boolean updated = false;

        if (request.getTitle() != null) {
            String trimmedTitle = request.getTitle().trim();
            if (trimmedTitle.length() < 3 || trimmedTitle.length() > 120) {
                throw new BadRequestException("Project title must be between 3 and 120 characters.");
            }
            project.setTitle(trimmedTitle);
            updated = true;
        }

        if (request.getIdea() != null) {
            String trimmedIdea = request.getIdea().trim();
            if (trimmedIdea.length() < 50 || trimmedIdea.length() > 10000) {
                throw new BadRequestException("Project idea must be between 50 and 10,000 characters.");
            }
            project.setIdea(trimmedIdea);

            // Recompute outdated flag against the idea used for the blueprint
            if (project.getBlueprintBasedOnIdeaHash() != null) {
                String currentHash = computeIdeaHash(trimmedIdea);
                project.setBlueprintOutdated(!currentHash.equals(project.getBlueprintBasedOnIdeaHash()));
            }
            updated = true;
        }

        if (request.getTypeOverride() != null) {
            String newOverride = normalizeTypeOverride(request.getTypeOverride());
            project.setTypeOverride(newOverride);
            updated = true;
        }

        if (updated) {
            project.setRevision(project.getRevision() + 1);
            project.setUpdatedAt(Instant.now());
            return projectRepository.save(project);
        }

        return project;
    }

    public void deleteProject(String id, Long headerRevision) {
        Project project = getProjectById(id);

        if (headerRevision != null && project.getRevision() != headerRevision) {
            throw new ConflictException(
                    String.format("Cannot delete: project revision is %d, expected %d.",
                            project.getRevision(), headerRevision),
                    project.getRevision(), headerRevision);
        }

        projectRepository.delete(project);
    }

    public static String computeIdeaHash(String idea) {
        if (idea == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(idea.trim().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", e);
        }
    }

    public static String normalizeTypeOverride(String override) {
        if (override == null || override.isBlank() || "AUTO".equalsIgnoreCase(override.trim())) {
            return null;
        }
        String upper = override.trim().toUpperCase(java.util.Locale.ROOT);
        if ("SOFTWARE".equals(upper) || "HARDWARE".equals(upper) || "HYBRID".equals(upper)) {
            return upper;
        }
        throw new BadRequestException("Invalid typeOverride: '" + override + "'. Allowed values: AUTO, SOFTWARE, HARDWARE, HYBRID.");
    }
}
