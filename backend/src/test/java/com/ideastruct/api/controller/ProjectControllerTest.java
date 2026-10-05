package com.ideastruct.api.controller;

import com.ideastruct.application.service.ProjectService;
import com.ideastruct.domain.model.Project;
import com.ideastruct.exception.GlobalExceptionHandler;
import com.ideastruct.infrastructure.database.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SuppressWarnings("null")
class ProjectControllerTest {

    private ProjectRepository projectRepository;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        projectRepository = mock(ProjectRepository.class);
        ProjectService projectService = new ProjectService(projectRepository);

        ProjectController controller = new ProjectController(projectService, null, null);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("DELETE /api/projects/{id} without revision returns 400 Bad Request")
    void deleteWithoutRevisionReturns400() throws Exception {
        Project existing = new Project("Test Project", "A sufficiently long idea description to satisfy validation minimums.");
        existing.setId("proj-1");
        existing.setRevision(3L);
        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(existing));

        mockMvc.perform(delete("/api/projects/proj-1"))
                .andExpect(status().isBadRequest());

        verify(projectRepository, never()).delete(any(Project.class));
    }

    @Test
    @DisplayName("DELETE /api/projects/{id} with stale/wrong revision returns 409 Conflict")
    void deleteWithStaleRevisionReturns409() throws Exception {
        Project existing = new Project("Test Project", "A sufficiently long idea description to satisfy validation minimums.");
        existing.setId("proj-1");
        existing.setRevision(3L);
        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(existing));

        mockMvc.perform(delete("/api/projects/proj-1")
                        .header("If-Match", "1"))
                .andExpect(status().isConflict());

        verify(projectRepository, never()).delete(any(Project.class));
    }

    @Test
    @DisplayName("DELETE /api/projects/{id} with correct revision returns 204 No Content")
    void deleteWithCorrectRevisionReturns204() throws Exception {
        Project existing = new Project("Test Project", "A sufficiently long idea description to satisfy validation minimums.");
        existing.setId("proj-1");
        existing.setRevision(3L);
        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(existing));

        mockMvc.perform(delete("/api/projects/proj-1")
                        .header("If-Match", "3"))
                .andExpect(status().isNoContent());

        verify(projectRepository, times(1)).delete(existing);
    }

    @Test
    @DisplayName("DELETE /api/projects/{id} with correct revision via query param returns 204 No Content")
    void deleteWithCorrectRevisionViaQueryParamReturns204() throws Exception {
        Project existing = new Project("Test Project", "A sufficiently long idea description to satisfy validation minimums.");
        existing.setId("proj-1");
        existing.setRevision(3L);
        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(existing));

        mockMvc.perform(delete("/api/projects/proj-1")
                        .param("revision", "3"))
                .andExpect(status().isNoContent());

        verify(projectRepository, times(1)).delete(existing);
    }
}
