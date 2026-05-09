package com.rmdiagram.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    List<RecurringTransaction> findByUserIdOrderByCreatedAtAsc(Long userId);

    Optional<RecurringTransaction> findByIdAndUserId(Long id, Long userId);

    List<RecurringTransaction> findByActiveTrueAndNextRunDateLessThanEqual(LocalDate date);
}
