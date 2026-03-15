package com.bankingsim.banking.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.exception.InsufficientBalanceException;
import com.bankingsim.banking.repository.AccountHolderRepository;
import com.bankingsim.banking.repository.AccountRepository;
import com.bankingsim.banking.repository.BankTransactionRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private AccountHolderRepository accountHolderRepository;
    @Mock
    private CustomerService customerService;
    @Mock
    private BranchService branchService;
    @Mock
    private BankTransactionRepository transactionRepository;
    @Mock
    private AuditService auditService;

    private AppProperties appProperties;

    @InjectMocks
    private AccountService accountService;

    @BeforeEach
    void setUp() {
        appProperties = new AppProperties();
        AppProperties.Limits limits = new AppProperties.Limits();
        limits.setDormancyMonths(12);
        limits.setOverdraftDefaultLimit(BigDecimal.valueOf(10000));
        limits.setSavingsMinimumBalance(BigDecimal.valueOf(5000));
        appProperties.setLimits(limits);

        accountService = new AccountService(
                accountRepository,
                accountHolderRepository,
                customerService,
                branchService,
                transactionRepository,
                auditService,
                appProperties
        );
    }

    @Test
    void debitShouldThrowWhenInsufficientBalance() {
        Account account = new Account();
        account.setAvailableBalance(BigDecimal.valueOf(100));
        account.setOverdraftLimit(BigDecimal.ZERO);

        assertThrows(InsufficientBalanceException.class, () -> accountService.debit(account, BigDecimal.valueOf(200)));
    }

    @Test
    void debitShouldUpdateBalancesWhenSufficient() {
        Account account = new Account();
        account.setAvailableBalance(BigDecimal.valueOf(500));
        account.setOverdraftLimit(BigDecimal.valueOf(100));
        account.setBalance(BigDecimal.valueOf(500));
        account.setStatus(AccountStatus.ACTIVE);

        when(accountRepository.save(account)).thenReturn(account);

        accountService.debit(account, BigDecimal.valueOf(120));

        assertEquals(BigDecimal.valueOf(380), account.getBalance());
        assertEquals(BigDecimal.valueOf(380), account.getAvailableBalance());
        verify(accountRepository).save(account);
    }
}
