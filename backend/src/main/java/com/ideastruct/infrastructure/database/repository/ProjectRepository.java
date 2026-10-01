package com.ideastruct.infrastructure.database.repository;

import com.ideastruct.domain.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    Page<Project> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
