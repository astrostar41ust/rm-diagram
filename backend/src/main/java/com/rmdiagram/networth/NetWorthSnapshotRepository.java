package com.rmdiagram.networth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NetWorthSnapshotRepository extends JpaRepository<NetWorthSnapshot, Long> {

    List<NetWorthSnapshot> findByUserIdOrderBySnapshotOnAsc(Long userId);

    Optional<NetWorthSnapshot> findByUserIdAndSnapshotOn(Long userId, LocalDate snapshotOn);
}
