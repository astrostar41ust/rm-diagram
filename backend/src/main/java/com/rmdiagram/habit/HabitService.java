package com.rmdiagram.habit;

import com.rmdiagram.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;

    public HabitDto.Response createHabit(Long userId, HabitDto.CreateRequest request) {
        Habit habit = Habit.builder()
                .userId(userId)
                .name(request.name())
                .icon(request.icon())
                .color(request.color())
                .frequencyType(request.frequencyType())
                .scheduleDays(request.scheduleDays())
                .reminderEnabled(Boolean.TRUE.equals(request.reminderEnabled()))
                .reminderTime(request.reminderTime())
                .build();
        habit = habitRepository.save(habit);
        log.debug("Created habit {} for user {}", habit.getId(), userId);
        return HabitDto.Response.from(habit);
    }

    public HabitDto.Response updateHabit(Long userId, Long habitId, HabitDto.UpdateRequest request) {
        Habit habit = findUserHabit(userId, habitId);

        if (request.name() != null) habit.setName(request.name());
        if (request.icon() != null) habit.setIcon(request.icon());
        if (request.color() != null) habit.setColor(request.color());
        if (request.frequencyType() != null) habit.setFrequencyType(request.frequencyType());
        if (request.scheduleDays() != null) habit.setScheduleDays(request.scheduleDays());
        if (request.reminderEnabled() != null) habit.setReminderEnabled(request.reminderEnabled());
        if (request.reminderTime() != null) habit.setReminderTime(request.reminderTime());

        habit = habitRepository.save(habit);
        log.debug("Updated habit {} for user {}", habitId, userId);
        return HabitDto.Response.from(habit);
    }

    public void deleteHabit(Long userId, Long habitId) {
        Habit habit = findUserHabit(userId, habitId);
        habit.setArchived(true);
        habitRepository.save(habit);
        log.debug("Archived habit {} for user {}", habitId, userId);
    }

    public HabitDto.GridResponse getGrid(Long userId, LocalDate from, LocalDate to) {
        List<Habit> habits = habitRepository.findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId);
        if (habits.isEmpty()) {
            return new HabitDto.GridResponse(List.of());
        }

        List<Long> habitIds = habits.stream().map(Habit::getId).toList();
        List<HabitCompletion> completions = completionRepository
                .findByHabitIdInAndCompletedDateBetween(habitIds, from, to);

        Map<Long, List<HabitCompletion>> completionsByHabit = completions.stream()
                .collect(Collectors.groupingBy(HabitCompletion::getHabitId));

        List<HabitDto.HabitGridItem> items = habits.stream().map(habit -> {
            List<HabitCompletion> habitCompletions = completionsByHabit
                    .getOrDefault(habit.getId(), List.of());
            List<LocalDate> dates = habitCompletions.stream()
                    .map(HabitCompletion::getCompletedDate)
                    .toList();
            int streak = calculateStreak(
                    habit.getId(),
                    habit.getFrequencyType(),
                    habit.getScheduleDays(),
                    habitCompletions);
            return new HabitDto.HabitGridItem(
                    habit.getId(),
                    habit.getName(),
                    habit.getIcon(),
                    habit.getColor(),
                    habit.getFrequencyType(),
                    habit.getScheduleDays(),
                    habit.getReminderEnabled(),
                    habit.getReminderTime(),
                    streak,
                    dates);
        }).toList();

        return new HabitDto.GridResponse(items);
    }

    @Transactional
    public boolean toggleCompletion(Long userId, Long habitId, LocalDate date) {
        findUserHabit(userId, habitId);

        return completionRepository.findByHabitIdAndCompletedDate(habitId, date)
                .map(existing -> {
                    completionRepository.deleteByHabitIdAndCompletedDate(habitId, date);
                    log.debug("Removed completion for habit {} on {}", habitId, date);
                    return false;
                })
                .orElseGet(() -> {
                    completionRepository.save(HabitCompletion.builder()
                            .habitId(habitId)
                            .completedDate(date)
                            .build());
                    log.debug("Added completion for habit {} on {}", habitId, date);
                    return true;
                });
    }

    @Transactional(readOnly = true)
    public HabitDto.AnalyticsResponse getAnalytics(Long userId, Long habitId, int days) {
        Habit habit = findUserHabit(userId, habitId);
        int windowDays = Math.max(7, Math.min(days, 365));
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(windowDays - 1L);

        List<LocalDate> completionList = completionRepository.findCompletionDatesSince(habitId, from);
        Set<LocalDate> completedSet = new HashSet<>(completionList);
        Set<DayOfWeek> scheduledDays = parseScheduleDays(habit.getFrequencyType(), habit.getScheduleDays());
        FrequencyType type = habit.getFrequencyType();

        List<HabitDto.DailyPoint> daily = new ArrayList<>(windowDays);
        int totalCompletions = 0;
        int totalScheduled = 0;
        int longestStreak = 0;
        int runningStreak = 0;

        for (int i = 0; i < windowDays; i++) {
            LocalDate date = from.plusDays(i);
            boolean scheduled = isScheduledDay(type, scheduledDays, date);
            boolean completed = completedSet.contains(date);
            if (scheduled) totalScheduled++;
            if (completed) totalCompletions++;
            daily.add(new HabitDto.DailyPoint(date, completed, scheduled));

            if (scheduled) {
                if (completed) {
                    runningStreak++;
                    longestStreak = Math.max(longestStreak, runningStreak);
                } else {
                    runningStreak = 0;
                }
            }
        }

        int currentStreak = computeCurrentStreak(today, type, scheduledDays, completedSet);

        Map<LocalDate, int[]> weekMap = new TreeMap<>();
        for (HabitDto.DailyPoint p : daily) {
            LocalDate weekStart = p.date().with(DayOfWeek.MONDAY);
            int[] counts = weekMap.computeIfAbsent(weekStart, k -> new int[2]);
            if (p.scheduled()) counts[1]++;
            if (p.completed()) counts[0]++;
        }
        List<HabitDto.WeeklyPoint> weekly = weekMap.entrySet().stream()
                .map(e -> new HabitDto.WeeklyPoint(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();

        double rate = totalScheduled == 0 ? 0.0 : (double) totalCompletions / totalScheduled;
        return new HabitDto.AnalyticsResponse(
                habitId, habit.getName(), windowDays, currentStreak, longestStreak,
                totalCompletions, totalScheduled, rate, daily, weekly);
    }

    private int computeCurrentStreak(LocalDate today, FrequencyType type,
                                     Set<DayOfWeek> scheduledDays, Set<LocalDate> completedSet) {
        LocalDate cursor = today;
        int streak = 0;
        for (int i = 0; i < 365; i++) {
            if (!isScheduledDay(type, scheduledDays, cursor)) {
                cursor = cursor.minusDays(1);
                continue;
            }
            if (completedSet.contains(cursor)) {
                streak++;
                cursor = cursor.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    private Habit findUserHabit(Long userId, Long habitId) {
        return habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new NotFoundException("Habit not found"));
    }

    private int calculateStreak(Long habitId, FrequencyType type, String scheduleDays,
                                List<HabitCompletion> completions) {
        Set<LocalDate> completedDates = completions.stream()
                .map(HabitCompletion::getCompletedDate)
                .collect(Collectors.toSet());

        Set<DayOfWeek> scheduledDays = parseScheduleDays(type, scheduleDays);
        LocalDate cursor = LocalDate.now();
        int streak = 0;

        for (int i = 0; i < 365; i++) {
            if (!isScheduledDay(type, scheduledDays, cursor)) {
                cursor = cursor.minusDays(1);
                continue;
            }
            if (completedDates.contains(cursor)) {
                streak++;
                cursor = cursor.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    private boolean isScheduledDay(FrequencyType type, Set<DayOfWeek> scheduledDays, LocalDate date) {
        if (type == FrequencyType.DAILY) return true;
        if (type == FrequencyType.SPECIFIC_DAYS) return scheduledDays.contains(date.getDayOfWeek());
        return true;
    }

    private Set<DayOfWeek> parseScheduleDays(FrequencyType type, String scheduleDays) {
        if (type != FrequencyType.SPECIFIC_DAYS || scheduleDays == null || scheduleDays.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(scheduleDays.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toSet());
    }
}
