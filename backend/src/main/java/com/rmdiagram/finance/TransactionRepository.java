package com.rmdiagram.finance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId, Pageable pageable);

    Page<Transaction> findByUserIdAndCategoryIdOrderByTransactionDateDesc(
            Long userId, Long categoryId, Pageable pageable);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.userId = :userId " +
            "AND t.transactionDate BETWEEN :from AND :to " +
            "ORDER BY t.transactionDate DESC")
    List<Transaction> findInRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query(value = """
            SELECT * FROM transactions
            WHERE user_id = :userId
              AND EXTRACT(YEAR FROM transaction_date) = :year
            ORDER BY transaction_date
            """, nativeQuery = true)
    List<Transaction> findInYear(@Param("userId") Long userId, @Param("year") int year);

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.userId = :userId " +
            "AND t.type = 'EXPENSE' " +
            "AND t.categoryId = :categoryId " +
            "AND t.transactionDate BETWEEN :from AND :to")
    List<Transaction> findExpensesForCategoryInRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.userId = :userId " +
            "AND t.categoryId = :categoryId " +
            "AND t.transactionDate BETWEEN :from AND :to")
    List<Transaction> findForCategoryInRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
