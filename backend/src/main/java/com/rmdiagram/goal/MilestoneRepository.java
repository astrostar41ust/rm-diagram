package com.rmdiagram.goal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByGoalIdOrderBySortOrderAsc(Long goalId);

    Optional<Milestone> findByIdAndGoalId(Long id, Long goalId);
}
