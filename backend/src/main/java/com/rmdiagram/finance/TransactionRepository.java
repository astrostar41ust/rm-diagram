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

    /**
     * Returns one row per month: [month "YYYY-MM", totalIncome, totalExpense].
     * PostgreSQL-specific (TO_CHAR, EXTRACT).
     */
    @Query(value = """
            SELECT TO_CHAR(transaction_date, 'YYYY-MM') AS month,
                   SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END) AS total_income,
                   SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS total_expense
            FROM transactions
            WHERE user_id = :userId
              AND EXTRACT(YEAR FROM transaction_date) = :year
            GROUP BY month
            ORDER BY month
            """, nativeQuery = true)
    List<Object[]> monthlySummary(@Param("userId") Long userId, @Param("year") int year);
}
