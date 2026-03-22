package com.bankingsim.banking.service;

import com.bankingsim.banking.audit.AuditService;
import com.bankingsim.banking.dto.admin.CreateEmployeeRequest;
import com.bankingsim.banking.dto.admin.EmployeeResponse;
import com.bankingsim.banking.dto.common.PageResponse;
import com.bankingsim.banking.dto.customer.CustomerResponse;
import com.bankingsim.banking.entity.Employee;
import com.bankingsim.banking.entity.User;
import com.bankingsim.banking.entity.enums.EmployeeStatus;
import com.bankingsim.banking.exception.DuplicateResourceException;
import com.bankingsim.banking.exception.ResourceNotFoundException;
import com.bankingsim.banking.repository.EmployeeRepository;
import com.bankingsim.banking.repository.UserRepository;
import com.bankingsim.banking.util.PageMapper;
import com.bankingsim.banking.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final BranchService branchService;
    private final CustomerService customerService;
    private final AuditService auditService;

    @Transactional
    public EmployeeResponse create(CreateEmployeeRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        employeeRepository.findByUserId(user.getId()).ifPresent(existing -> {
            throw new DuplicateResourceException("Employee already exists for this user");
        });

        Employee employee = new Employee();
        employee.setUser(user);
        employee.setBranch(branchService.getEntity(request.getBranchId()));
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setManager(request.isManager());

        Employee saved = employeeRepository.save(employee);
        auditService.log(SecurityUtils.currentUserId(), "EMPLOYEE_CREATE", "EMPLOYEE", saved.getId().toString(),
                null, saved.getEmployeeCode(), true, "Employee created");

        return toResponse(saved);
    }

    @Transactional
    public EmployeeResponse updateStatus(Long id, EmployeeStatus status) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        employee.setStatus(status);
        Employee saved = employeeRepository.save(employee);

        auditService.log(SecurityUtils.currentUserId(), "EMPLOYEE_STATUS_UPDATE", "EMPLOYEE", saved.getId().toString(),
                null, status.name(), true, "Employee status updated");

        return toResponse(saved);
    }

    public PageResponse<EmployeeResponse> byBranch(Long branchId, int page, int size) {
        return PageMapper.from(employeeRepository.findByBranchIdAndStatus(branchId, EmployeeStatus.ACTIVE, PageRequest.of(page, size))
                .map(this::toResponse));
    }

    public PageResponse<EmployeeResponse> allEmployees(int page, int size) {
        return PageMapper.from(employeeRepository.findAll(PageRequest.of(page, size))
                .map(this::toResponse));
    }

    public PageResponse<CustomerResponse> assignedBranchCustomers(int page, int size) {
        Employee employee = employeeRepository.findByUserId(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        return customerService.search(employee.getBranch().getId(), null, null, null, null, page, size);
    }

    private EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .userId(employee.getUser().getId())
                .username(employee.getUser().getUsername())
                .branchId(employee.getBranch().getId())
                .employeeCode(employee.getEmployeeCode())
                .status(employee.getStatus())
                .manager(employee.isManager())
                .build();
    }
}
