package com.bankingsim.banking.mapper;

import com.bankingsim.banking.dto.customer.CustomerResponse;
import com.bankingsim.banking.entity.Customer;

public final class CustomerMapper {

    private CustomerMapper() {
    }

    public static CustomerResponse toResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .customerCode(customer.getCustomerCode())
                .userId(customer.getUser().getId())
                .fullName(customer.getFirstName() + " " + customer.getLastName())
                .email(customer.getUser().getEmail())
                .phone(customer.getUser().getPhone())
                .dob(customer.getDob())
                .branchId(customer.getBranch().getId())
                .branchCode(customer.getBranch().getBranchCode())
                .kycStatus(customer.getKycStatus())
                .riskProfile(customer.getRiskProfile())
                .status(customer.getStatus())
                .address(String.join(", ",
                        customer.getAddressLine1(),
                        customer.getCity(),
                        customer.getState(),
                        customer.getPostalCode(),
                        customer.getCountry()))
                .build();
    }
}
