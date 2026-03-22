package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.account.AccountResponse;
import com.bankingsim.banking.dto.account.OpenAccountRequest;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.transaction.TransactionResponse;
import com.bankingsim.banking.entity.Account;
import com.bankingsim.banking.entity.AccountHolder;
import com.bankingsim.banking.entity.BankTransaction;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.AccountType;
import com.bankingsim.banking.entity.enums.TransactionStatus;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.exception.InsufficientBalanceException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.mapper.AccountMapper;
import com.bankingsim.banking.mapper.TransactionMapper;
import com.bankingsim.banking.repository.AccountHolderRepository;
import com.bankingsim.banking.repository.AccountRepository;
import com.bankingsim.banking.repository.BankTransactionRepository;
import com.bankingsim.banking.util.PageMapper;
import com.bankingsim.banking.util.ReferenceGenerator;
import com.bankingsim.banking.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final AccountHolderRepository accountHolderRepository;
    private final CustomerService customerService;
    private final BranchService branchService;
    private final BankTransactionRepository transactionRepository;
    private final AuditService auditService;
    private final AppProperties appProperties;

    @Transactional
    public AccountResponse open(OpenAccountRequest request) {
        Customer primary = customerService.getCustomerEntity(request.getPrimaryCustomerId());

        Account account = new Account();
        account.setAccountNumber(generateAccountNumber());
        account.setAccountType(request.getAccountType());
        account.setBranch(branchService.getEntity(request.getBranchId()));
        account.setCurrency(request.getCurrency() == null ? "INR" : request.getCurrency());
        account.setBalance(request.getOpeningBalance() == null ? BigDecimal.ZERO : request.getOpeningBalance());
        account.setAvailableBalance(account.getBalance());
        account.setHoldAmount(BigDecimal.ZERO);
        account.setMinimumBalance(resolveMinimumBalance(request));
        account.setInterestRate(request.getInterestRate() == null ? BigDecimal.ZERO : request.getInterestRate());
        account.setOverdraftLimit(resolveOverdraftLimit(request));
        account.setOpenedOn(LocalDate.now());
        account.setStatus(AccountStatus.PENDING_APPROVAL);

        Account saved = accountRepository.save(account);

        AccountHolder primaryHolder = new AccountHolder();
        primaryHolder.setAccount(saved);
        primaryHolder.setCustomer(primary);
        primaryHolder.setPrimaryHolder(true);
        accountHolderRepository.save(primaryHolder);

        if (request.getSecondaryCustomerIds() != null) {
            for (Long secondaryId : request.getSecondaryCustomerIds()) {
                Customer secondary = customerService.getCustomerEntity(secondaryId);
                AccountHolder holder = new AccountHolder();
                holder.setAccount(saved);
                holder.setCustomer(secondary);
                holder.setPrimaryHolder(false);
                accountHolderRepository.save(holder);
            }
        }

        auditService.log(SecurityUtils.currentUserId(), "ACCOUNT_OPEN_REQUEST", "ACCOUNT", saved.getId().toString(), null,
                saved.getAccountNumber(), true, "Account opening request submitted");

        return AccountMapper.toResponse(saved);
    }

    @Transactional
    public AccountResponse approve(Long accountId, boolean approve, String remarks) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new ForbiddenOperationException("Only pending accounts can be approved/rejected");
        }

        account.setStatus(approve ? AccountStatus.ACTIVE : AccountStatus.CLOSED);
        account.setApprovedBy(SecurityUtils.currentUserId());
        account.setApprovedAt(LocalDateTime.now());
        if (!approve) {
            account.setClosedOn(LocalDate.now());
        }

        Account saved = accountRepository.save(account);
        auditService.log(SecurityUtils.currentUserId(), approve ? "ACCOUNT_APPROVE" : "ACCOUNT_REJECT", "ACCOUNT",
                accountId.toString(), null, saved.getStatus().name(), true, remarks);

        return AccountMapper.toResponse(saved);
    }

    @Transactional
    public AccountResponse updateStatus(Long accountId, AccountStatus status, String remarks) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new ForbiddenOperationException("No operation allowed on closed account");
        }

        AccountStatus old = account.getStatus();
        account.setStatus(status);
        if (status == AccountStatus.CLOSED) {
            account.setClosedOn(LocalDate.now());
        }

        Account saved = accountRepository.save(account);
        auditService.log(SecurityUtils.currentUserId(), "ACCOUNT_STATUS_UPDATE", "ACCOUNT", saved.getId().toString(),
                old.name(), status.name(), true, remarks);

        return AccountMapper.toResponse(saved);
    }

    public AccountResponse getByAccountNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        enforceAccess(account);
        return AccountMapper.toResponse(account);
    }

    public PageResponse<AccountResponse> listByCustomer(Long customerId, int page, int size) {
        Long resolvedCustomerId = customerId;
        if (resolvedCustomerId == null) {
            try {
                resolvedCustomerId = customerService.getCustomerByUserId(SecurityUtils.currentUserId()).getId();
            } catch (ResourceNotFoundException e) {
                // Customer not found for current user, return empty page
                return PageMapper.from(Page.empty(PageRequest.of(page, size)));
            }
        }
        return PageMapper.from(
                accountRepository.findByCustomerId(resolvedCustomerId, PageRequest.of(page, size))
                        .map(AccountMapper::toResponse)
        );
    }

    public PageResponse<TransactionResponse> statement(String accountNumber, LocalDate from, LocalDate to, int page, int size) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        enforceAccess(account);

        return PageMapper.from(transactionRepository.findStatementForAccount(
                account.getId(), from, to, PageRequest.of(page, size)
        ).map(TransactionMapper::toResponse));
    }

    public List<TransactionResponse> miniStatement(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        enforceAccess(account);
        return transactionRepository
                .findBySourceAccountIdOrDestinationAccountId(account.getId(), account.getId(), PageRequest.of(0, 10))
                .stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    public Account getEntityByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    public Account findByAccountNumberOrNull(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber).orElse(null);
    }

    public Account getEntityById(Long id) {
        return accountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Transactional
    public Account getAccountForUpdate(String accountNumber) {
        return accountRepository.findWithLockByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Transactional
    public void credit(Account account, BigDecimal amount) {
        account.setBalance(account.getBalance().add(amount));
        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        account.setLastTransactionAt(LocalDateTime.now());
        accountRepository.save(account);
    }

    @Transactional
    public void debit(Account account, BigDecimal amount) {
        BigDecimal allowed = account.getAvailableBalance().add(account.getOverdraftLimit());
        if (allowed.compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient available balance");
        }

        account.setBalance(account.getBalance().subtract(amount));
        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setLastTransactionAt(LocalDateTime.now());
        accountRepository.save(account);
    }

    @Transactional
    public void placeHold(Account account, BigDecimal amount) {
        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient available balance for hold");
        }
        account.setHoldAmount(account.getHoldAmount().add(amount));
        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        accountRepository.save(account);
    }

    @Transactional
    public void releaseHold(Account account, BigDecimal amount) {
        account.setHoldAmount(account.getHoldAmount().subtract(amount));
        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        accountRepository.save(account);
    }

    @Transactional
    public void markDormantAccounts() {
        List<Account> dormantCandidates = accountRepository.findByStatusAndLastTransactionAtBefore(
                AccountStatus.ACTIVE,
                LocalDateTime.now().minusMonths(appProperties.getLimits().getDormancyMonths())
        );
        dormantCandidates.forEach(account -> account.setStatus(AccountStatus.DORMANT));
        accountRepository.saveAll(dormantCandidates);
    }

    @Transactional
    public void save(Account account) {
        accountRepository.save(account);
    }

    public void validateTransferAllowed(Account account) {
        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new ForbiddenOperationException("Operation not allowed on closed account");
        }
        if (account.getStatus() == AccountStatus.FREEZED || account.getStatus() == AccountStatus.BLOCKED) {
            throw new ForbiddenOperationException("Operation not allowed on blocked/frozen account");
        }
        if (account.getStatus() == AccountStatus.PENDING_APPROVAL) {
            throw new ForbiddenOperationException("Account is pending approval");
        }
    }

    public boolean isOwnedByCustomer(Account account, Long customerId) {
        return accountHolderRepository.existsByAccountIdAndCustomerId(account.getId(), customerId);
    }

    private void enforceAccess(Account account) {
        if (SecurityUtils.hasRole("ROLE_ADMIN") || SecurityUtils.hasRole("ROLE_MANAGER") || SecurityUtils.hasRole("ROLE_EMPLOYEE") || SecurityUtils.hasRole("ROLE_AUDITOR")) {
            return;
        }
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        accountHolderRepository.findByAccountIdAndCustomerId(account.getId(), customer.getId())
                .orElseThrow(() -> new ForbiddenOperationException("Unauthorized account access"));
    }

    private String generateAccountNumber() {
        String number;
        do {
            number = ReferenceGenerator.accountNumber();
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }

    private BigDecimal resolveMinimumBalance(OpenAccountRequest request) {
        if (request.getMinimumBalance() != null) {
            return request.getMinimumBalance();
        }
        if (request.getAccountType() == AccountType.SAVINGS || request.getAccountType() == AccountType.SALARY) {
            return appProperties.getLimits().getSavingsMinimumBalance();
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal resolveOverdraftLimit(OpenAccountRequest request) {
        if (request.getOverdraftLimit() != null) {
            return request.getOverdraftLimit();
        }
        if (request.getAccountType() == AccountType.CURRENT) {
            return appProperties.getLimits().getOverdraftDefaultLimit();
        }
        return BigDecimal.ZERO;
    }
}
