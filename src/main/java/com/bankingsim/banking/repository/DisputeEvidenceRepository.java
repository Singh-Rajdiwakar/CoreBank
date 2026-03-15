package com.bankingsim.banking.repository;

import com.bankingsim.banking.entity.DisputeEvidence;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisputeEvidenceRepository extends JpaRepository<DisputeEvidence, Long> {
    List<DisputeEvidence> findByDisputeCaseIdOrderByUploadedAtDesc(Long disputeCaseId);
}
