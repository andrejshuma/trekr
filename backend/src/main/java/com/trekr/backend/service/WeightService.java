package com.trekr.backend.service;

import com.trekr.backend.dto.weight.CreateDailyIntakeRequest;
import com.trekr.backend.dto.weight.TodayTrainingInfoDto;
import com.trekr.backend.dto.weight.WeightDailyIntakeDto;
import com.trekr.backend.dto.weight.WeightDailyIntakesResponse;
import com.trekr.backend.dto.weight.WeightProfileResponse;
import com.trekr.backend.dto.weight.WeightStartRequest;
import com.trekr.backend.entity.User;
import com.trekr.backend.entity.weight.DailyIntake;
import com.trekr.backend.entity.weight.WeightUser;
import com.trekr.backend.repository.DailyIntakeRepository;
import com.trekr.backend.repository.TrainingSessionRepository;
import com.trekr.backend.repository.UserRepository;
import com.trekr.backend.repository.WeightUserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WeightService {

    private static final BigDecimal CALORIE_WEIGHT_FACTOR = new BigDecimal("10");
    private static final BigDecimal CALORIE_HEIGHT_FACTOR = new BigDecimal("6.25");
    private static final BigDecimal CALORIE_BASE = new BigDecimal("50");
    private static final BigDecimal LOSS_CALORIE_DELTA = new BigDecimal("500");
    private static final BigDecimal GAIN_CALORIE_DELTA = new BigDecimal("300");

    private final WeightUserRepository weightUserRepository;
    private final DailyIntakeRepository dailyIntakeRepository;
    private final UserRepository userRepository;
    private final TrainingSessionRepository trainingSessionRepository;

    public WeightService(
            WeightUserRepository weightUserRepository,
            DailyIntakeRepository dailyIntakeRepository,
            UserRepository userRepository,
            TrainingSessionRepository trainingSessionRepository) {
        this.weightUserRepository = weightUserRepository;
        this.dailyIntakeRepository = dailyIntakeRepository;
        this.userRepository = userRepository;
        this.trainingSessionRepository = trainingSessionRepository;
    }

    public boolean isTracking(Long userId) {
        return weightUserRepository.existsById(userId);
    }

    @Transactional
    public void startTracking(Long userId, WeightStartRequest request) {
        if (weightUserRepository.existsById(userId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal goalCalories = resolveGoalCalories(request, request.getWeight(), request.getHeight(), request.getGoalWeight());

        WeightUser weightUser = new WeightUser();
        weightUser.setUser(user);
        weightUser.setWeight(request.getWeight());
        weightUser.setHeight(request.getHeight());
        weightUser.setGoalWeight(request.getGoalWeight());
        weightUser.setGoalCalories(goalCalories);

        weightUserRepository.save(weightUser);
    }

    @Transactional(readOnly = true)
    public WeightProfileResponse getProfile(Long userId) {
        WeightUser weightUser = weightUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Weight tracking is not enabled for this user"));

        return new WeightProfileResponse(
                weightUser.getWeight(),
                weightUser.getHeight(),
                weightUser.getGoalWeight(),
                weightUser.getGoalCalories());
    }

    @Transactional(readOnly = true)
    public WeightDailyIntakesResponse getDailyIntakes(Long userId, int page, int size) {
        if (!weightUserRepository.existsById(userId)) {
            return new WeightDailyIntakesResponse(List.of(), false, false);
        }

        Page<DailyIntake> result = dailyIntakeRepository
                .findByWeightUser_UserIdOrderByDateDesc(userId, PageRequest.of(page, size));

        List<LocalDate> dates = result.getContent().stream()
                .map(DailyIntake::getDate)
                .distinct()
                .toList();

        Map<LocalDate, Integer> trainingCountsByDate = new HashMap<>();
        Map<LocalDate, BigDecimal> burnedCaloriesByDate = new HashMap<>();
        if (!dates.isEmpty()) {
            trainingSessionRepository.findByTrainingUser_UserIdAndDateIn(userId, dates).forEach(session -> {
                LocalDate sessionDate = session.getDate();
                trainingCountsByDate.merge(sessionDate, 1, Integer::sum);
                BigDecimal calories = session.getCalories() != null ? session.getCalories() : BigDecimal.ZERO;
                burnedCaloriesByDate.merge(sessionDate, calories, BigDecimal::add);
            });
        }

        List<WeightDailyIntakeDto> intakes = result.getContent().stream()
                .map(d -> {
                    boolean trainedThatDay = trainingCountsByDate.getOrDefault(d.getDate(), 0) > 0;
                    BigDecimal burnedCalories = burnedCaloriesByDate.getOrDefault(d.getDate(), BigDecimal.ZERO)
                            .setScale(2, java.math.RoundingMode.HALF_UP);

                    return new WeightDailyIntakeDto(
                            d.getDailyIntakeId(),
                            d.getDate(),
                            d.getCalories(),
                            trainedThatDay,
                            burnedCalories);
                })
                .toList();

        boolean hasTodayIntake = dailyIntakeRepository.existsByWeightUser_UserIdAndDate(userId, LocalDate.now());
        return new WeightDailyIntakesResponse(intakes, result.hasNext(), hasTodayIntake);
    }

    @Transactional
    public WeightDailyIntakeDto createDailyIntake(Long userId, CreateDailyIntakeRequest request) {
        WeightUser weightUser = weightUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Weight tracking is not enabled for this user"));

        LocalDate today = LocalDate.now();
        if (dailyIntakeRepository.existsByWeightUser_UserIdAndDate(userId, today)) {
            throw new RuntimeException("Today's intake has already been recorded");
        }

        DailyIntake intake = new DailyIntake();
        intake.setWeightUser(weightUser);
        intake.setCalories(request.getCalories());
        intake.setDate(today);

        DailyIntake saved = dailyIntakeRepository.save(intake);
        
        // Fetch today's training data
        var trainingSessions = trainingSessionRepository.findByTrainingUser_UserIdAndDate(userId, today);
        boolean trainedToday = !trainingSessions.isEmpty();
        BigDecimal burnedCalories = trainingSessions.stream()
                .map(ts -> ts.getCalories() != null ? ts.getCalories() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, java.math.RoundingMode.HALF_UP);
        
        return new WeightDailyIntakeDto(saved.getDailyIntakeId(), saved.getDate(), saved.getCalories(), trainedToday, burnedCalories);
    }

    public WeightProfileResponse updateProfile(Long userId, WeightStartRequest request) {
        WeightUser weightUser = weightUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Weight tracking is not enabled for this user"));

        BigDecimal goalCalories = resolveGoalCalories(request, request.getWeight(), request.getHeight(), request.getGoalWeight());

        weightUser.setWeight(request.getWeight());
        weightUser.setHeight(request.getHeight());
        weightUser.setGoalWeight(request.getGoalWeight());
        weightUser.setGoalCalories(goalCalories);

        WeightUser updated = weightUserRepository.save(weightUser);
        return new WeightProfileResponse(
                updated.getWeight(),
                updated.getHeight(),
                updated.getGoalWeight(),
                updated.getGoalCalories());
    }

    @Transactional(readOnly = true)
    public TodayTrainingInfoDto getTodayTrainingInfo(Long userId) {
        // Try to get training user, if doesn't exist just return zeros
        var trainingUser = trainingSessionRepository.findByTrainingUser_UserIdAndDate(userId, LocalDate.now());

        boolean trainedToday = !trainingUser.isEmpty();
        BigDecimal totalBurnedCalories = trainingUser.stream()
                .map(ts -> ts.getCalories() != null ? ts.getCalories() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        return new TodayTrainingInfoDto(trainedToday, totalBurnedCalories);
    }

    private static BigDecimal resolveGoalCalories(
            WeightStartRequest request,
            BigDecimal currentWeight,
            BigDecimal height,
            BigDecimal goalWeight) {
        if (!Boolean.FALSE.equals(request.getAutoCalculateTargets())) {
            return calculateGoalCalories(currentWeight, height, goalWeight);
        }

        BigDecimal goalCalories = request.getGoalCalories();
        if (goalCalories == null) {
            throw new RuntimeException("Goal calories are required when auto-calculation is disabled");
        }
        if (goalCalories.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Goal calories must be 0 or greater");
        }
        return goalCalories.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private static BigDecimal calculateGoalCalories(BigDecimal currentWeight, BigDecimal height, BigDecimal goalWeight) {
        BigDecimal maintenanceCalories = currentWeight.multiply(CALORIE_WEIGHT_FACTOR)
                .add(height.multiply(CALORIE_HEIGHT_FACTOR))
                .add(CALORIE_BASE)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        int direction = goalWeight.compareTo(currentWeight);
        if (direction < 0) {
            return maintenanceCalories.subtract(LOSS_CALORIE_DELTA).max(BigDecimal.ZERO).setScale(2, java.math.RoundingMode.HALF_UP);
        }
        if (direction > 0) {
            return maintenanceCalories.add(GAIN_CALORIE_DELTA).setScale(2, java.math.RoundingMode.HALF_UP);
        }
        return maintenanceCalories;
    }
}
