package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.dto.admin.FeeRuleRequest;
import com.bankingsim.banking.dto.admin.InterestRuleRequest;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.FeeRule;
import com.bankingsim.banking.entity.InterestRule;
import com.bankingsim.banking.entity.SystemConfig;
import com.bankingsim.banking.entity.enums.CustomerStatus;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.reporting.ReportingService;
import com.bankingsim.banking.repository.CustomerRepository;
import com.bankingsim.banking.repository.FeeRuleRepository;
import com.bankingsim.banking.repository.InterestRuleRepository;
import com.bankingsim.banking.repository.SystemConfigRepository;
import com.bankingsim.banking.util.SecurityUtils;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final FeeRuleRepository feeRuleRepository;
    private final InterestRuleRepository interestRuleRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final CustomerRepository customerRepository;
    private final AuthService authService;
    private final ReportingService reportingService;
    private final AuditService auditService;

    @Transactional
    public FeeRule saveFeeRule(FeeRuleRequest request) {
        FeeRule rule = feeRuleRepository.findByCodeAndActiveTrue(request.getCode()).orElse(new FeeRule());
        rule.setCode(request.getCode());
        rule.setDescription(request.getDescription());
        rule.setAmount(request.getAmount());
        rule.setPercentage(request.getPercentage());
        rule.setActive(request.isActive());
        FeeRule saved = feeRuleRepository.save(rule);

        auditService.log(SecurityUtils.currentUserId(), "FEE_RULE_SAVE", "FEE_RULE", saved.getId().toString(), null,
                saved.getCode(), true, "Fee rule upsert");

        return saved;
    }

    @Transactional
    public InterestRule saveInterestRule(InterestRuleRequest request) {
        InterestRule rule = interestRuleRepository.findByProductTypeAndActiveTrue(request.getProductType()).orElse(new InterestRule());
        rule.setProductType(request.getProductType());
        rule.setAnnualRate(request.getAnnualRate());
        rule.setActive(request.isActive());

        InterestRule saved = interestRuleRepository.save(rule);

        auditService.log(SecurityUtils.currentUserId(), "INTEREST_RULE_SAVE", "INTEREST_RULE", saved.getId().toString(), null,
                saved.getProductType(), true, "Interest rule upsert");

        return saved;
    }

    public List<FeeRule> listFeeRules() {
        return feeRuleRepository.findAll();
    }

    public List<InterestRule> listInterestRules() {
        return interestRuleRepository.findAll();
    }

    @Transactional
    public void blockCustomer(Long customerId, String remarks) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customer.setStatus(CustomerStatus.BLACKLISTED);
        customerRepository.save(customer);
        auditService.log(SecurityUtils.currentUserId(), "CUSTOMER_BLOCK", "CUSTOMER", customerId.toString(), null,
                CustomerStatus.BLACKLISTED.name(), true, remarks);
    }

    @Transactional
    public void unblockCustomer(Long customerId, String remarks) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customer.setStatus(CustomerStatus.ACTIVE);
        customerRepository.save(customer);
        auditService.log(SecurityUtils.currentUserId(), "CUSTOMER_UNBLOCK", "CUSTOMER", customerId.toString(), null,
                CustomerStatus.ACTIVE.name(), true, remarks);
    }

    @Transactional
    public void unlockUser(Long userId) {
        authService.unlockUser(userId);
    }

    @Transactional
    public SystemConfig upsertConfig(String key, String value, String description) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key).orElse(new SystemConfig());
        config.setConfigKey(key);
        config.setConfigValue(value);
        config.setDescription(description);
        SystemConfig saved = systemConfigRepository.save(config);

        auditService.log(SecurityUtils.currentUserId(), "SYSTEM_CONFIG_UPDATE", "SYSTEM_CONFIG", saved.getId().toString(),
                null, key + "=" + value, true, "System config updated");

        return saved;
    }

    public Map<String, String> allConfigs() {
        Map<String, String> map = new HashMap<>();
        for (SystemConfig config : systemConfigRepository.findAll()) {
            map.put(config.getConfigKey(), config.getConfigValue());
        }
        return map;
    }

    public Map<String, Object> monitoring() {
        return reportingService.systemMonitoring();
    }
}
