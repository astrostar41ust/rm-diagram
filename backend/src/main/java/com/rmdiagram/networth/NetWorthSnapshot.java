package com.rmdiagram.networth;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "net_worth_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NetWorthSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "snapshot_on", nullable = false)
    private LocalDate snapshotOn;

    @Column(name = "base_currency", nullable = false, length = 10)
    private String baseCurrency;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal assets;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal liabilities;

    @Column(name = "net_worth", nullable = false, precision = 14, scale = 2)
    private BigDecimal netWorth;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
