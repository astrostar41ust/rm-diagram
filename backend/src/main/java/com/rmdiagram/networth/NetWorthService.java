package com.rmdiagram.networth;

import com.rmdiagram.exception.NotFoundException;
import com.rmdiagram.finance.CurrencyService;
import com.rmdiagram.settings.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NetWorthService {

    private final AccountRepository accountRepository;
    private final NetWorthSnapshotRepository snapshotRepository;
    private final SettingsRepository settingsRepository;
    private final CurrencyService currencyService;

    @Transactional
    public NetWorthDto.AccountResponse createAccount(
            Long userId, NetWorthDto.CreateAccountRequest request) {
        String currency = (request.currency() != null && currencyService.isSupported(request.currency()))
                ? request.currency().toUpperCase() : baseCurrency(userId);
        Account a = Account.builder()
                .userId(userId)
                .name(request.name())
                .type(request.type())
                .currency(currency)
                .balance(request.balance() != null ? request.balance() : BigDecimal.ZERO)
                .build();
        a = accountRepository.save(a);
        log.debug("Created account {} for user {}", a.getId(), userId);
        return toAccountResponse(a, baseCurrency(userId));
    }

    @Transactional
    public NetWorthDto.AccountResponse updateAccount(
            Long userId, Long id, NetWorthDto.UpdateAccountRequest request) {
        Account a = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        if (request.name() != null) a.setName(request.name());
        if (request.type() != null) a.setType(request.type());
        if (request.currency() != null && currencyService.isSupported(request.currency())) {
            a.setCurrency(request.currency().toUpperCase());
        }
        if (request.balance() != null) a.setBalance(request.balance());
        if (request.archived() != null) a.setArchived(request.archived());
        a = accountRepository.save(a);
        return toAccountResponse(a, baseCurrency(userId));
    }

    @Transactional
    public void deleteAccount(Long userId, Long id) {
        Account a = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        accountRepository.delete(a);
    }

    @Transactional(readOnly = true)
    public NetWorthDto.OverviewResponse getOverview(Long userId) {
        String base = baseCurrency(userId);
        List<Account> accounts = accountRepository.findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId);
        BigDecimal assets = BigDecimal.ZERO;
        BigDecimal liabilities = BigDecimal.ZERO;
        for (Account a : accounts) {
            BigDecimal converted = currencyService.convert(a.getBalance(), a.getCurrency(), base);
            if (a.getType().isLiability()) {
                liabilities = liabilities.add(converted.abs());
            } else {
                assets = assets.add(converted);
            }
        }
        BigDecimal netWorth = assets.subtract(liabilities);
        return new NetWorthDto.OverviewResponse(
                base, assets, liabilities, netWorth,
                accounts.stream().map(a -> toAccountResponse(a, base)).toList(),
                snapshotRepository.findByUserIdOrderBySnapshotOnAsc(userId).stream()
                        .map(NetWorthDto.SnapshotResponse::from)
                        .toList());
    }

    @Transactional
    public NetWorthDto.SnapshotResponse snapshotToday(Long userId) {
        NetWorthDto.OverviewResponse o = getOverview(userId);
        LocalDate today = LocalDate.now();
        NetWorthSnapshot snap = snapshotRepository.findByUserIdAndSnapshotOn(userId, today)
                .orElseGet(() -> NetWorthSnapshot.builder()
                        .userId(userId)
                        .snapshotOn(today)
                        .build());
        snap.setBaseCurrency(o.baseCurrency());
        snap.setAssets(o.assets());
        snap.setLiabilities(o.liabilities());
        snap.setNetWorth(o.netWorth());
        snap = snapshotRepository.save(snap);
        log.info("Saved net-worth snapshot for user {} on {}", userId, today);
        return NetWorthDto.SnapshotResponse.from(snap);
    }

    private NetWorthDto.AccountResponse toAccountResponse(Account a, String base) {
        BigDecimal converted = currencyService.convert(a.getBalance(), a.getCurrency(), base);
        return NetWorthDto.AccountResponse.from(a, converted, base);
    }

    private String baseCurrency(Long userId) {
        return settingsRepository.findByUserId(userId)
                .map(s -> s.getCurrency())
                .orElse("THB");
    }
}
