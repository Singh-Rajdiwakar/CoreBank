package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.customer.CustomerCreateRequest;
import com.bankingsim.banking.dto.customer.CustomerResponse;
import com.bankingsim.banking.dto.customer.CustomerUpdateRequest;
import com.bankingsim.banking.dto.customer.DocumentMetadataRequest;
import com.bankingsim.banking.dto.account.SetTransactionPinRequest;
import com.bankingsim.banking.entity.Customer;
import com.bankingsim.banking.entity.CustomerDocument;
import com.bankingsim.banking.entity.Role;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.AccountStatus;
import com.bankingsim.banking.entity.enums.CustomerStatus;
import com.bankingsim.banking.entity.enums.KycStatus;
import com.bankingsim.banking.entity.enums.RiskProfile;
import com.bankingsim.banking.entity.enums.RoleType;
import com.bankingsim.banking.exception.DuplicateResourceException;
import com.bankingsim.banking.exception.ForbiddenOperationException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.mapper.CustomerMapper;
import com.bankingsim.banking.repository.CustomerDocumentRepository;
import com.bankingsim.banking.repository.CustomerRepository;
import com.bankingsim.banking.repository.RoleRepository;
import com.bankingsim.banking.repository.UserRepository;
import com.bankingsim.banking.util.PageMapper;
import com.bankingsim.banking.util.ReferenceGenerator;
import com.bankingsim.banking.util.SecurityUtils;
import com.bankingsim.banking.validation.BusinessValidation;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BranchService branchService;
    private final PasswordEncoder passwordEncoder;
    private final CustomerDocumentRepository customerDocumentRepository;
    private final AuditService auditService;

    @Transactional
    public CustomerResponse create(CustomerCreateRequest request) {
        BusinessValidation.validateAdult(request.getDob());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone already exists");
        }

        Role customerRole = roleRepository.findByName(RoleType.ROLE_CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_CUSTOMER not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setPasswordExpiryDate(LocalDate.now().plusDays(90));
        user.getRoles().add(customerRole);

        User savedUser = userRepository.save(user);

        Customer customer = new Customer();
        customer.setCustomerCode(generateUniqueCustomerCode());
        customer.setUser(savedUser);
        customer.setBranch(branchService.getEntity(request.getBranchId()));
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setDob(request.getDob());
        customer.setGender(request.getGender());
        customer.setAddressLine1(request.getAddressLine1());
        customer.setAddressLine2(request.getAddressLine2());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setPostalCode(request.getPostalCode());
        customer.setCountry(request.getCountry());
        customer.setPan(request.getPan());
        customer.setAadhaar(request.getAadhaar());
        customer.setPassport(request.getPassport());
        customer.setNomineeName(request.getNomineeName());
        customer.setNomineeRelationship(request.getNomineeRelationship());
        customer.setNomineeContact(request.getNomineeContact());
        customer.setEmploymentType(request.getEmploymentType());
        customer.setEmployerName(request.getEmployerName());
        customer.setIncomeRange(request.getIncomeRange());
        customer.setRiskProfile(request.getRiskProfile() == null ? RiskProfile.LOW : request.getRiskProfile());
        customer.setKycStatus(KycStatus.PENDING);
        customer.setStatus(CustomerStatus.ACTIVE);

        Customer saved = customerRepository.save(customer);

        auditService.log(SecurityUtils.currentUserId(), "CUSTOMER_CREATE", "CUSTOMER", saved.getId().toString(), null,
                saved.getCustomerCode(), true, "Customer profile created");

        return CustomerMapper.toResponse(saved);
    }

    public CustomerResponse getById(Long id) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return CustomerMapper.toResponse(customer);
    }

    public CustomerResponse getMyProfile() {
        Customer customer = customerRepository.findByUserId(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        return CustomerMapper.toResponse(customer);
    }

    @Transactional
    public CustomerResponse update(Long customerId, CustomerUpdateRequest request) {
        enforceCustomerSelfAccess(customerId);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        String oldValue = customer.getFirstName() + "|" + customer.getLastName() + "|" + customer.getStatus();

        if (request.getFirstName() != null) {
            customer.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            customer.setLastName(request.getLastName());
        }
        if (request.getDob() != null) {
            BusinessValidation.validateAdult(request.getDob());
            customer.setDob(request.getDob());
        }
        if (request.getAddressLine1() != null) {
            customer.setAddressLine1(request.getAddressLine1());
        }
        if (request.getAddressLine2() != null) {
            customer.setAddressLine2(request.getAddressLine2());
        }
        if (request.getCity() != null) {
            customer.setCity(request.getCity());
        }
        if (request.getState() != null) {
            customer.setState(request.getState());
        }
        if (request.getPostalCode() != null) {
            customer.setPostalCode(request.getPostalCode());
        }
        if (request.getCountry() != null) {
            customer.setCountry(request.getCountry());
        }
        if (request.getNomineeName() != null) {
            customer.setNomineeName(request.getNomineeName());
        }
        if (request.getNomineeRelationship() != null) {
            customer.setNomineeRelationship(request.getNomineeRelationship());
        }
        if (request.getNomineeContact() != null) {
            customer.setNomineeContact(request.getNomineeContact());
        }
        if (request.getEmploymentType() != null) {
            customer.setEmploymentType(request.getEmploymentType());
        }
        if (request.getEmployerName() != null) {
            customer.setEmployerName(request.getEmployerName());
        }
        if (request.getIncomeRange() != null) {
            customer.setIncomeRange(request.getIncomeRange());
        }
        if (request.getRiskProfile() != null) {
            customer.setRiskProfile(request.getRiskProfile());
        }
        if (request.getKycStatus() != null) {
            customer.setKycStatus(request.getKycStatus());
        }
        if (request.getStatus() != null) {
            customer.setStatus(request.getStatus());
        }

        Customer saved = customerRepository.save(customer);
        auditService.log(SecurityUtils.currentUserId(), "CUSTOMER_UPDATE", "CUSTOMER", saved.getId().toString(), oldValue,
                saved.getFirstName() + "|" + saved.getLastName() + "|" + saved.getStatus(), true,
                "Customer profile updated");

        return CustomerMapper.toResponse(saved);
    }

    @Transactional
    public void archive(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customer.setArchived(true);
        customer.setStatus(CustomerStatus.ARCHIVED);
        customerRepository.save(customer);

        auditService.log(SecurityUtils.currentUserId(), "CUSTOMER_ARCHIVE", "CUSTOMER", customerId.toString(), null,
                "archived=true", true, "Customer archived");
    }

    @Transactional
    public void setTransactionPin(SetTransactionPinRequest request) {
        Customer customer = customerRepository.findByUserId(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        customer.setTransactionPinHash(passwordEncoder.encode(request.getPin()));
        customerRepository.save(customer);

        auditService.log(customer.getUser().getId(), "SET_TRANSACTION_PIN", "CUSTOMER", customer.getId().toString(), null,
                "pinUpdated", true, "Transaction pin set/updated");
    }

    @Transactional
    public void uploadDocument(Long customerId, DocumentMetadataRequest request) {
        enforceCustomerSelfAccess(customerId);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        CustomerDocument document = new CustomerDocument();
        document.setCustomer(customer);
        document.setDocumentType(request.getDocumentType());
        document.setDocumentNumber(request.getDocumentNumber());
        document.setFileName(request.getFileName());
        document.setFileUrl(request.getFileUrl());
        customerDocumentRepository.save(document);

        auditService.log(SecurityUtils.currentUserId(), "CUSTOMER_DOCUMENT_UPLOAD", "CUSTOMER_DOCUMENT", document.getId().toString(),
                null, request.getDocumentType().name(), true, "Customer document metadata uploaded");
    }

    public List<CustomerDocument> getDocuments(Long customerId) {
        enforceCustomerSelfAccess(customerId);
        return customerDocumentRepository.findByCustomerId(customerId);
    }

    public PageResponse<CustomerResponse> search(Long branchId,
                                                 KycStatus kycStatus,
                                                 CustomerStatus status,
                                                 RiskProfile riskProfile,
                                                 AccountStatus accountStatus,
                                                 int page,
                                                 int size) {
        var pageable = PageRequest.of(page, size);
        return PageMapper.from(
                customerRepository.search(branchId, kycStatus, status, riskProfile, accountStatus, pageable)
                        .map(CustomerMapper::toResponse)
        );
    }

    public Customer getCustomerByUserId(Long userId) {
        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
    }

    public Customer getCustomerEntity(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private String generateUniqueCustomerCode() {
        String code;
        do {
            code = ReferenceGenerator.customerCode();
        } while (customerRepository.existsByCustomerCode(code));
        return code;
    }

    private void enforceCustomerSelfAccess(Long customerId) {
        if (!SecurityUtils.hasRole("ROLE_CUSTOMER")) {
            return;
        }
        Customer me = customerRepository.findByUserId(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        if (!me.getId().equals(customerId)) {
            throw new ForbiddenOperationException("Customers can only access their own profile");
        }
    }
}
