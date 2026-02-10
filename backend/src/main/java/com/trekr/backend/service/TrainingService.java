package com.trekr.backend.service;

import com.trekr.backend.dto.training.CreateTrainingSessionRequest;
import com.trekr.backend.dto.training.TrainingSessionDto;
import com.trekr.backend.dto.training.TrainingStartRequest;
import com.trekr.backend.dto.training.TrainingSessionsResponse;
import com.trekr.backend.dto.training.TrainingProfileResponse;
import com.trekr.backend.dto.training.WorkoutTypeDto;
import com.trekr.backend.entity.User;
import com.trekr.backend.entity.training.TrainingSession;
import com.trekr.backend.entity.training.TrainingUser;
import com.trekr.backend.repository.TrainingSessionRepository;
import com.trekr.backend.repository.TrainingUserRepository;
import com.trekr.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TrainingService {

    private static final Map<String, BigDecimal> MET_BY_TYPE = Map.ofEntries(
            Map.entry("running", new BigDecimal("9.8")),
            Map.entry("cycling", new BigDecimal("7.5")),
            Map.entry("walking", new BigDecimal("3.5")),
            Map.entry("strength", new BigDecimal("6.0")),
            Map.entry("hiit", new BigDecimal("9.0")),
            Map.entry("yoga", new BigDecimal("2.5")),
            Map.entry("swimming", new BigDecimal("8.0")),
            Map.entry("rowing", new BigDecimal("7.0")),
            Map.entry("elliptical", new BigDecimal("5.0")),

            // Added types (same calories formula; MET is the only extra input)
            Map.entry("hiking", new BigDecimal("6.0")),
            Map.entry("stair-climbing", new BigDecimal("8.8")),
            Map.entry("jump-rope", new BigDecimal("12.3")),
            Map.entry("boxing", new BigDecimal("7.8")),
            Map.entry("basketball", new BigDecimal("8.0")),
            Map.entry("soccer", new BigDecimal("10.0")),
            Map.entry("tennis", new BigDecimal("7.3")),
            Map.entry("dance", new BigDecimal("5.5")),
            Map.entry("pilates", new BigDecimal("3.0")),
            Map.entry("stretching", new BigDecimal("2.3")));

    private static final List<String> WORKOUT_TYPE_ORDER = List.of(
            "running",
            "cycling",
            "walking",
            "strength",
            "hiit",
            "yoga",
            "swimming",
            "rowing",
            "elliptical",
            "hiking",
            "stair-climbing",
            "jump-rope",
            "boxing",
            "basketball",
            "soccer",
            "tennis",
            "dance",
            "pilates",
            "stretching");

    private final TrainingUserRepository trainingUserRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final UserRepository userRepository;

    public TrainingService(
            TrainingUserRepository trainingUserRepository,
            TrainingSessionRepository trainingSessionRepository,
            UserRepository userRepository) {
        this.trainingUserRepository = trainingUserRepository;
        this.trainingSessionRepository = trainingSessionRepository;
        this.userRepository = userRepository;
    }

    public boolean isTracking(Long userId) {
        return trainingUserRepository.existsById(userId);
    }

    @Transactional
    public void startTracking(Long userId, TrainingStartRequest request) {
        if (trainingUserRepository.existsById(userId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TrainingUser trainingUser = new TrainingUser();
        trainingUser.setUser(user);
        trainingUser.setGender(request.getGender());
        trainingUser.setAge(request.getAge());
        trainingUser.setWeight(request.getWeight());

        trainingUserRepository.save(trainingUser);
    }

    public TrainingSessionsResponse getSessions(Long userId, int page, int size) {
        if (!trainingUserRepository.existsById(userId)) {
            return new TrainingSessionsResponse(List.of(), false);
        }

        Page<TrainingSession> result = trainingSessionRepository
                .findByTrainingUser_UserIdOrderByDateDesc(userId, PageRequest.of(page, size));

        List<TrainingSessionDto> sessions = result.getContent().stream()
                .map(s -> new TrainingSessionDto(
                        s.getTrainingId(),
                        s.getDate(),
                        s.getType(),
                        s.getDuration(),
                        s.getCalories()))
                .toList();

        return new TrainingSessionsResponse(sessions, result.hasNext());
    }

    public List<WorkoutTypeDto> getWorkoutTypes() {
        return WORKOUT_TYPE_ORDER.stream()
                .map(type -> new WorkoutTypeDto(type, labelForType(type), MET_BY_TYPE.get(type)))
                .toList();
    }

    public TrainingProfileResponse getProfile(Long userId) {
        TrainingUser trainingUser = trainingUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Training tracking is not enabled for this user"));
        return new TrainingProfileResponse(trainingUser.getGender(), trainingUser.getAge(), trainingUser.getWeight());
    }

    @Transactional
    public TrainingSessionDto createSession(Long userId, CreateTrainingSessionRequest request) {
        TrainingUser trainingUser = trainingUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Training tracking is not enabled for this user"));

        String type = normalizeType(request.getType());
        BigDecimal met = MET_BY_TYPE.get(type);
        if (met == null) {
            throw new RuntimeException("Unsupported workout type");
        }

        BigDecimal durationMinutes = request.getDurationMinutes();
        if (durationMinutes == null || durationMinutes.compareTo(BigDecimal.ONE) < 0) {
            throw new RuntimeException("Duration must be at least 1 minute");
        }

        BigDecimal calories;
        if (Boolean.TRUE.equals(request.getAutoCalculateCalories())) {
            calories = calculateCalories(trainingUser, met, durationMinutes);
        } else {
            calories = request.getCalories();
            if (calories == null) {
                throw new RuntimeException("Calories are required when auto-calculation is disabled");
            }
            if (calories.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Calories must be 0 or greater");
            }
        }

        TrainingSession session = new TrainingSession();
        session.setTrainingUser(trainingUser);
        session.setType(type);
        session.setDuration(durationMinutes);
        session.setCalories(calories);
        session.setDate(LocalDate.now());

        TrainingSession saved = trainingSessionRepository.save(session);

        return new TrainingSessionDto(
                saved.getTrainingId(),
                saved.getDate(),
                saved.getType(),
                saved.getDuration(),
                saved.getCalories());
    }

    private static String normalizeType(String type) {
        if (type == null) {
            return null;
        }
        return type.trim().toLowerCase(Locale.ROOT);
    }

    private static String labelForType(String type) {
        if (type == null || type.isBlank()) {
            return "";
        }
        if ("hiit".equals(type)) {
            return "HIIT";
        }

        String normalized = type.replace('_', '-');
        return List.of(normalized.split("-"))
                .stream()
                .filter(part -> part != null && !part.isBlank())
                .map(part -> Character.toUpperCase(part.charAt(0)) + part.substring(1))
                .collect(Collectors.joining(" "));
    }

    private static BigDecimal calculateCalories(TrainingUser trainingUser, BigDecimal met, BigDecimal durationMinutes) {
        BigDecimal weightKg = trainingUser.getWeight();
        if (weightKg == null) {
            throw new RuntimeException("Weight is required to auto-calculate calories");
        }

        BigDecimal durationHours = durationMinutes.divide(new BigDecimal("60"), 10, RoundingMode.HALF_UP);
        return met.multiply(weightKg)
                .multiply(durationHours)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
