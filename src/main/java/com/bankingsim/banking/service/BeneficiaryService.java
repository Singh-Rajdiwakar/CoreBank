package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.config.AppProperties;
import com.bankingsim.banking.dto.account.BeneficiaryCreateRequest;
import com.bankingsim.banking.dto.account.BeneficiaryResponse;
import com.bankingsim.banking.entity.Beneficiary;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.enums.BeneficiaryStatus;
import com.bankingsim.banking.entity.enums.NotificationType;
import com.bankingsim.banking.exception.DuplicateResourceException;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.mapper.BeneficiaryMapper;
import com.bankingsim.banking.notification.NotificationService;
import com.bankingsim.banking.repository.BeneficiaryRepository;
import com.bankingsim.banking.util.SecurityUtils;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerService customerService;
    private final AppProperties appProperties;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public BeneficiaryResponse add(BeneficiaryCreateRequest request) {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());

        if (beneficiaryRepository.existsByCustomerIdAndAccountNumber(customer.getId(), request.getAccountNumber())) {
            throw new DuplicateResourceException("Beneficiary already exists");
        }

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setCustomer(customer);
        beneficiary.setBeneficiaryType(request.getBeneficiaryType());
        beneficiary.setNickname(request.getNickname());
        beneficiary.setName(request.getName());
        beneficiary.setAccountNumber(request.getAccountNumber());
        beneficiary.setIfscCode(request.getIfscCode());
        beneficiary.setBankName(request.getBankName());
        beneficiary.setDailyLimit(request.getDailyLimit());
        beneficiary.setStatus(BeneficiaryStatus.PENDING_VERIFICATION);

        Beneficiary saved = beneficiaryRepository.save(beneficiary);
        auditService.log(SecurityUtils.currentUserId(), "BENEFICIARY_ADD", "BENEFICIARY", saved.getId().toString(), null,
                saved.getAccountNumber(), true, "Beneficiary added");
        notificationService.publish(customer.getUser().getId(), NotificationType.BENEFICIARY,
                "Beneficiary Added",
                "Beneficiary " + saved.getNickname() + " added and pending verification.");

        return BeneficiaryMapper.toResponse(saved);
    }

    @Transactional
    public BeneficiaryResponse verify(Long beneficiaryId) {
        Beneficiary beneficiary = getOwnedBeneficiary(beneficiaryId);
        if (beneficiary.getStatus() != BeneficiaryStatus.PENDING_VERIFICATION) {
            throw new ForbiddenOperationException("Beneficiary not in verification state");
        }
        beneficiary.setStatus(BeneficiaryStatus.COOLING);
        beneficiary.setCoolingUntil(LocalDateTime.now().plusHours(appProperties.getLimits().getBeneficiaryCoolingPeriodHours()));
        Beneficiary saved = beneficiaryRepository.save(beneficiary);

        auditService.log(SecurityUtils.currentUserId(), "BENEFICIARY_VERIFY", "BENEFICIARY", saved.getId().toString(), null,
                saved.getStatus().name(), true, "Beneficiary verified and moved to cooling period");
        notificationService.publish(beneficiary.getCustomer().getUser().getId(), NotificationType.BENEFICIARY,
                "Beneficiary Verified",
                "Beneficiary " + saved.getNickname() + " will become active after cooling period.");

        return BeneficiaryMapper.toResponse(saved);
    }

    @Transactional
    public BeneficiaryResponse remove(Long beneficiaryId) {
        Beneficiary beneficiary = getOwnedBeneficiary(beneficiaryId);
        beneficiary.setStatus(BeneficiaryStatus.REMOVED);
        Beneficiary saved = beneficiaryRepository.save(beneficiary);

        auditService.log(SecurityUtils.currentUserId(), "BENEFICIARY_REMOVE", "BENEFICIARY", saved.getId().toString(), null,
                saved.getStatus().name(), true, "Beneficiary removed");
        notificationService.publish(beneficiary.getCustomer().getUser().getId(), NotificationType.BENEFICIARY,
                "Beneficiary Removed",
                "Beneficiary " + saved.getNickname() + " has been removed.");

        return BeneficiaryMapper.toResponse(saved);
    }

    public List<BeneficiaryResponse> listActive() {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        return beneficiaryRepository.findByCustomerIdAndStatus(customer.getId(), BeneficiaryStatus.ACTIVE)
                .stream()
                .map(BeneficiaryMapper::toResponse)
                .toList();
    }

    public Beneficiary getBeneficiaryForCustomer(Long beneficiaryId, Long customerId) {
        return beneficiaryRepository.findByIdAndCustomerId(beneficiaryId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
    }

    @Transactional
    public void activateCooledBeneficiaries() {
        List<Beneficiary> beneficiaries = beneficiaryRepository.findByStatusAndCoolingUntilBefore(
                BeneficiaryStatus.COOLING,
                LocalDateTime.now()
        );
        beneficiaries.forEach(beneficiary -> beneficiary.setStatus(BeneficiaryStatus.ACTIVE));
        beneficiaryRepository.saveAll(beneficiaries);
    }

    private Beneficiary getOwnedBeneficiary(Long beneficiaryId) {
        Customer customer = customerService.getCustomerByUserId(SecurityUtils.currentUserId());
        return beneficiaryRepository.findByIdAndCustomerId(beneficiaryId, customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
    }
}
