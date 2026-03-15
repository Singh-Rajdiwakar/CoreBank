CREATE TABLE IF NOT EXISTS dispute_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(40) NOT NULL UNIQUE,
    transaction_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    category VARCHAR(40) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    reported_channel VARCHAR(30) NOT NULL,
    liability_tier VARCHAR(20) NOT NULL,
    disputed_amount DECIMAL(19,2) NOT NULL,
    description VARCHAR(500) NOT NULL,
    evidence_reference VARCHAR(255),
    reported_at DATETIME(6) NOT NULL,
    resolution_due_at DATETIME(6) NOT NULL,
    provisional_credit_due_at DATETIME(6),
    provisional_credit_recommended BIT(1) NOT NULL DEFAULT b'0',
    assigned_to BIGINT,
    resolution_summary VARCHAR(500),
    resolved_at DATETIME(6),
    closed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_dispute_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    CONSTRAINT fk_dispute_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_dispute_assignee FOREIGN KEY (assigned_to) REFERENCES users(id)
);

ALTER TABLE dispute_cases
    ADD INDEX idx_dispute_customer_status_time (customer_id, status, created_at),
    ADD INDEX idx_dispute_status_due_time (status, resolution_due_at),
    ADD INDEX idx_dispute_transaction (transaction_id),
    ADD INDEX idx_dispute_assigned_status (assigned_to, status);
