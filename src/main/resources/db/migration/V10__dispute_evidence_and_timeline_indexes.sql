CREATE TABLE IF NOT EXISTS dispute_evidences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispute_case_id BIGINT NOT NULL,
    file_name VARCHAR(180) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    checksum VARCHAR(100),
    notes VARCHAR(255),
    uploaded_by BIGINT NOT NULL,
    uploaded_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_dispute_evidence_case FOREIGN KEY (dispute_case_id) REFERENCES dispute_cases(id),
    CONSTRAINT fk_dispute_evidence_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

ALTER TABLE dispute_evidences
    ADD INDEX idx_dispute_evidence_case_time (dispute_case_id, uploaded_at),
    ADD INDEX idx_dispute_evidence_uploader_time (uploaded_by, uploaded_at);

ALTER TABLE audit_logs
    ADD INDEX idx_audit_target_timeline (target_entity, target_id, action_at);
