package com.rmdiagram.note;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    Page<Note> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Note> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT n FROM Note n WHERE n.userId = :userId AND n.deleted = false AND (" +
            "LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(COALESCE(n.tags, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Note> searchNotesByTitleOrContent(@Param("userId") Long userId, @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT n.noteDate, n.mood, n.createdAt FROM Note n " +
            "WHERE n.userId = :userId AND n.deleted = false " +
            "AND n.mood IS NOT NULL AND n.noteDate >= :since " +
            "ORDER BY n.noteDate ASC, n.createdAt ASC")
    List<Object[]> findMoodEntriesSince(@Param("userId") Long userId,
            @Param("since") LocalDate since);
}
