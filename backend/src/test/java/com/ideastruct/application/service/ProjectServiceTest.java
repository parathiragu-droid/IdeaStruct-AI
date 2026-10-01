package com.ideastruct.application.service;

import com.ideastruct.api.dto.CreateProjectRequest;
import com.ideastruct.api.dto.UpdateProjectRequest;
import com.ideastruct.exception.BadRequestException;
import com.ideastruct.exception.ConflictException;
import com.ideastruct.exception.ResourceNotFoundException;
import com.ideastruct.domain.model.Project;
import com.ideastruct.infrastructure.database.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProjectServiceTest {

    private ProjectRepository projectRepository;
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectRepository = mock(ProjectRepository.class);
        projectService = new ProjectService(projectRepository);
    }

    @Test
    @DisplayName("Create project succeeds with valid inputs and sets initial revision to 1")
    void shouldCreateProjectSuccessfully() {
        String title = "Campus Food App";
        String idea = "A detailed description of a software system for students to order food on campus between their lecture breaks.";
        CreateProjectRequest req = new CreateProjectRequest(title, idea);

        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setId("proj-123");
            return p;
        });

        Project created = projectService.createProject(req);
        assertNotNull(created);
        assertEquals("proj-123", created.getId());
        assertEquals(title, created.getTitle());
        assertEquals(idea, created.getIdea());
        assertEquals(1L, created.getRevision());
    }

    @Test
    @DisplayName("Create project rejects ideas shorter than 50 characters")
    void shouldRejectShortIdea() {
        CreateProjectRequest req = new CreateProjectRequest("Title Here", "Too short");
        assertThrows(BadRequestException.class, () -> projectService.createProject(req));
    }

    @Test
    @DisplayName("Get project by ID throws 404 when not found")
    void shouldThrowNotFoundForUnknownId() {
        when(projectRepository.findById("unknown")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> projectService.getProjectById("unknown"));
    }

    @Test
    @DisplayName("Update project increments revision when expected revision matches")
    void shouldUpdateProjectAndIncrementRevision() {
        Project existing = new Project("Old Title", "A valid idea description that is long enough to satisfy fifty characters constraint.");
        existing.setId("proj-1");
        existing.setRevision(1L);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(existing));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateProjectRequest req = new UpdateProjectRequest("New Title", null, 1L);
        Project updated = projectService.updateProject("proj-1", req, null);

        assertEquals("New Title", updated.getTitle());
        assertEquals(2L, updated.getRevision());
    }

    @Test
    @DisplayName("Update project throws ConflictException on stale revision")
    void shouldThrowConflictOnStaleRevision() {
        Project existing = new Project("Old Title", "A valid idea description that is long enough to satisfy fifty characters constraint.");
        existing.setId("proj-1");
        existing.setRevision(2L); // Server is at revision 2

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(existing));

        // Client expects revision 1
        UpdateProjectRequest req = new UpdateProjectRequest("New Title", null, 1L);
        ConflictException ex = assertThrows(ConflictException.class,
                () -> projectService.updateProject("proj-1", req, null));

        assertEquals(2L, ex.getCurrentRevision());
        assertEquals(1L, ex.getExpectedRevision());
    }

    @Test
    @DisplayName("Delete project throws ConflictException on revision mismatch")
    void shouldThrowConflictOnDeleteRevisionMismatch() {
        Project existing = new Project("Old Title", "A valid idea description that is long enough to satisfy fifty characters constraint.");
        existing.setId("proj-1");
        existing.setRevision(3L);

        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(existing));

        assertThrows(ConflictException.class, () -> projectService.deleteProject("proj-1", 2L));
        verify(projectRepository, never()).delete(any(Project.class));
    }

    @Test
    @DisplayName("Create project supports all 4 override modes: AUTO, SOFTWARE, HARDWARE, HYBRID")
    void shouldSupportAllFourOverrideModes() {
        String title = "Override Test Project";
        String idea = "A sufficiently detailed description of a test system that meets the fifty character minimum requirement.";

        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        // 1. AUTO mode (or null)
        CreateProjectRequest autoReq = new CreateProjectRequest(title, idea, "AUTO");
        Project autoProj = projectService.createProject(autoReq);
        assertNull(autoProj.getTypeOverride(), "AUTO override must normalize to null (defaulting to auto-detection)");

        // 2. SOFTWARE mode
        CreateProjectRequest swReq = new CreateProjectRequest(title, idea, "SOFTWARE");
        Project swProj = projectService.createProject(swReq);
        assertEquals("SOFTWARE", swProj.getTypeOverride());

        // 3. HARDWARE mode
        CreateProjectRequest hwReq = new CreateProjectRequest(title, idea, "HARDWARE");
        Project hwProj = projectService.createProject(hwReq);
        assertEquals("HARDWARE", hwProj.getTypeOverride());

        // 4. HYBRID mode
        CreateProjectRequest hyReq = new CreateProjectRequest(title, idea, "HYBRID");
        Project hyProj = projectService.createProject(hyReq);
        assertEquals("HYBRID", hyProj.getTypeOverride());
    }

    @Test
    @DisplayName("Create project rejects invalid typeOverride")
    void shouldRejectInvalidTypeOverride() {
        String title = "Invalid Override Project";
        String idea = "A sufficiently detailed description of a test system that meets the fifty character minimum requirement.";

        CreateProjectRequest req = new CreateProjectRequest(title, idea, "INVALID_TYPE");
        BadRequestException ex = assertThrows(BadRequestException.class, () -> projectService.createProject(req));
        assertTrue(ex.getMessage().contains("Invalid typeOverride"));
    }
}
