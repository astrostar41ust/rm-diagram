package com.rmdiagram.habit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {

    List<HabitCompletion> findByHabitIdInAndCompletedDateBetween(
            List<Long> habitIds, LocalDate from, LocalDate to);

    Optional<HabitCompletion> findByHabitIdAndCompletedDate(Long habitId, LocalDate date);

    void deleteByHabitIdAndCompletedDate(Long habitId, LocalDate date);

    @Query("SELECT hc.completedDate FROM HabitCompletion hc " +
            "WHERE hc.habitId = :habitId " +
            "AND hc.completedDate >= :since " +
            "ORDER BY hc.completedDate DESC")
    List<LocalDate> findCompletionDatesSince(Long habitId, LocalDate since);
}
