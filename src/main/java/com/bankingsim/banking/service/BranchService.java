package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.dto.admin.BranchResponse;
import com.bankingsim.banking.dto.admin.CreateBranchRequest;
import com.bankingsim.banking.dto.admin.UpdateBranchRequest;
import com.bankingsim.banking.entity.Branch;
import com.bankingsim.banking.entity.enums.BranchStatus;
import com.bankingsim.banking.exception.DuplicateResourceException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.repository.BranchRepository;
import com.bankingsim.banking.util.PageMapper;
import com.bankingsim.banking.util.SecurityUtils;
import com.bankingsim.banking.dto.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final AuditService auditService;

    @Transactional
    public BranchResponse create(CreateBranchRequest request) {
        if (branchRepository.findByBranchCode(request.getBranchCode()).isPresent()) {
            throw new DuplicateResourceException("Branch code already exists");
        }
        if (branchRepository.findByIfscCode(request.getIfscCode()).isPresent()) {
            throw new DuplicateResourceException("IFSC code already exists");
        }

        Branch branch = new Branch();
        branch.setName(request.getName());
        branch.setBranchCode(request.getBranchCode());
        branch.setIfscCode(request.getIfscCode());
        branch.setAddressLine1(request.getAddressLine1());
        branch.setAddressLine2(request.getAddressLine2());
        branch.setCity(request.getCity());
        branch.setState(request.getState());
        branch.setPostalCode(request.getPostalCode());
        branch.setContactEmail(request.getContactEmail());
        branch.setContactPhone(request.getContactPhone());
        branch.setStatus(BranchStatus.ACTIVE);
        branch.setManagerUserId(request.getManagerUserId());

        Branch saved = branchRepository.save(branch);

        auditService.log(SecurityUtils.currentUserId(), "BRANCH_CREATE", "BRANCH", saved.getId().toString(), null,
                saved.getBranchCode(), true, "Branch created");

        return toResponse(saved);
    }

    @Transactional
    public BranchResponse update(Long id, UpdateBranchRequest request) {
        Branch branch = branchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        String oldValue = branch.getName() + "|" + branch.getStatus();
        if (request.getName() != null) {
            branch.setName(request.getName());
        }
        if (request.getAddressLine1() != null) {
            branch.setAddressLine1(request.getAddressLine1());
        }
        if (request.getAddressLine2() != null) {
            branch.setAddressLine2(request.getAddressLine2());
        }
        if (request.getCity() != null) {
            branch.setCity(request.getCity());
        }
        if (request.getState() != null) {
            branch.setState(request.getState());
        }
        if (request.getPostalCode() != null) {
            branch.setPostalCode(request.getPostalCode());
        }
        if (request.getContactEmail() != null) {
            branch.setContactEmail(request.getContactEmail());
        }
        if (request.getContactPhone() != null) {
            branch.setContactPhone(request.getContactPhone());
        }
        if (request.getStatus() != null) {
            branch.setStatus(request.getStatus());
        }
        if (request.getManagerUserId() != null) {
            branch.setManagerUserId(request.getManagerUserId());
        }

        Branch saved = branchRepository.save(branch);
        auditService.log(SecurityUtils.currentUserId(), "BRANCH_UPDATE", "BRANCH", saved.getId().toString(), oldValue,
                saved.getName() + "|" + saved.getStatus(), true, "Branch updated");

        return toResponse(saved);
    }

    public BranchResponse get(Long id) {
        Branch branch = branchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        return toResponse(branch);
    }

    public PageResponse<BranchResponse> list(BranchStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var branchPage = status == null ? branchRepository.findAll(pageable) : branchRepository.findByStatus(status, pageable);
        return PageMapper.from(branchPage.map(this::toResponse));
    }

    public Branch getEntity(Long id) {
        return branchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
    }

    private BranchResponse toResponse(Branch branch) {
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .branchCode(branch.getBranchCode())
                .ifscCode(branch.getIfscCode())
                .city(branch.getCity())
                .state(branch.getState())
                .contactEmail(branch.getContactEmail())
                .contactPhone(branch.getContactPhone())
                .status(branch.getStatus())
                .managerUserId(branch.getManagerUserId())
                .build();
    }
}
