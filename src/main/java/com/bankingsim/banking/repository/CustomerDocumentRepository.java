package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.CustomerDocument;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerDocumentRepository extends JpaRepository<CustomerDocument, Long> {
    List<CustomerDocument> findByCustomerId(Long customerId);
}
