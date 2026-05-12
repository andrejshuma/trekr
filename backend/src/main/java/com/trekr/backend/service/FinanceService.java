package com.trekr.backend.service;

import com.trekr.backend.dto.finance.CreateIncomeRequest;
import com.trekr.backend.dto.finance.FinanceProfileResponse;
import com.trekr.backend.dto.finance.FinanceStartRequest;
import com.trekr.backend.dto.finance.IncomeDto;
import com.trekr.backend.dto.finance.IncomesResponse;
import com.trekr.backend.entity.User;
import com.trekr.backend.entity.finance.FinanceUser;
import com.trekr.backend.entity.finance.Income;
import com.trekr.backend.repository.FinanceUserRepository;
import com.trekr.backend.repository.IncomeRepository;
import com.trekr.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class FinanceService {

    private final FinanceUserRepository financeUserRepository;
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    public FinanceService(
            FinanceUserRepository financeUserRepository,
            IncomeRepository incomeRepository,
            UserRepository userRepository) {
        this.financeUserRepository = financeUserRepository;
        this.incomeRepository = incomeRepository;
        this.userRepository = userRepository;
    }

    public boolean isTracking(Long userId) {
        return financeUserRepository.existsById(userId);
    }

    @Transactional
    public void startOrUpdateTracking(Long userId, FinanceStartRequest request) {
        FinanceUser financeUser = financeUserRepository.findById(userId).orElse(null);
        if (financeUser == null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            financeUser = new FinanceUser();
            financeUser.setUser(user);
        }

        BigDecimal spending = normalizePercent(request.getSpendingBudget());
        BigDecimal saving = normalizePercent(request.getSavingBudget());
        BigDecimal investing = normalizePercent(request.getInvestingBudget());
        BigDecimal donation = normalizePercent(request.getDonationBudget());
        BigDecimal credit = normalizePercent(request.getCredit());

        validateSumTo100(spending, saving, investing, donation, credit);

        financeUser.setSpendingBudget(spending);
        financeUser.setSavingBudget(saving);
        financeUser.setInvestingBudget(investing);
        financeUser.setDonationBudget(donation);
        financeUser.setCredit(credit);

        financeUserRepository.save(financeUser);
    }

    @Transactional(readOnly = true)
    public FinanceProfileResponse getProfile(Long userId) {
        FinanceUser financeUser = financeUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Finance tracking is not enabled for this user"));

        return new FinanceProfileResponse(
                financeUser.getSpendingBudget(),
                financeUser.getSavingBudget(),
                financeUser.getInvestingBudget(),
                financeUser.getDonationBudget(),
                financeUser.getCredit());
    }

    @Transactional(readOnly = true)
    public IncomesResponse getIncomes(Long userId, int page, int size) {
        if (!financeUserRepository.existsById(userId)) {
            return new IncomesResponse(List.of(), false);
        }

        Page<Income> result = incomeRepository.findByFinanceUser_UserIdOrderByDateDescIncomeIdDesc(
                userId, PageRequest.of(page, size));

        List<IncomeDto> dtos = result.getContent().stream()
                .map(i -> new IncomeDto(i.getIncomeId(), i.getDate(), i.getAmount()))
                .toList();

        return new IncomesResponse(dtos, result.hasNext());
    }

    @Transactional
    public IncomeDto createIncome(Long userId, CreateIncomeRequest request) {
        FinanceUser financeUser = financeUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Finance tracking is not enabled for this user"));

        LocalDate date = request.getDate();
        if (date == null) {
            throw new RuntimeException("Date is required");
        }
        if (date.isAfter(LocalDate.now().plusDays(1))) {
            throw new RuntimeException("Date cannot be in the future");
        }

        BigDecimal amount = request.getAmount();
        if (amount == null) {
            throw new RuntimeException("Amount is required");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }

        Income income = new Income();
        income.setFinanceUser(financeUser);
        income.setDate(date);
        income.setAmount(amount);

        Income saved = incomeRepository.save(income);
        return new IncomeDto(saved.getIncomeId(), saved.getDate(), saved.getAmount());
    }

    private static BigDecimal normalizePercent(BigDecimal value) {
        if (value == null) {
            return null;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private static void validateSumTo100(BigDecimal spending, BigDecimal saving, BigDecimal investing, BigDecimal donation,
            BigDecimal credit) {
        if (spending == null || saving == null || investing == null || donation == null || credit == null) {
            throw new RuntimeException("All 5 percentage values are required");
        }

        List<BigDecimal> list = List.of(spending, saving, investing, donation, credit);

        for (BigDecimal v : list) {
            if (v.compareTo(BigDecimal.ZERO) < 0 || v.compareTo(new BigDecimal("100")) > 0) {
                throw new RuntimeException("Percentages must be between 0 and 100");
            }
        }

        BigDecimal sum = spending.add(saving).add(investing).add(donation).add(credit);
        // allow tiny rounding errors (e.g. 33.33 * 3 + 0.01)
        BigDecimal diff = sum.subtract(new BigDecimal("100")).abs();
        if (diff.compareTo(new BigDecimal("0.01")) > 0) {
            throw new RuntimeException("Percentages must sum to 100");
        }
    }
}

