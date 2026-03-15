CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    password_changed_at DATETIME(6),
    password_expiry_date DATE,
    account_non_locked BIT(1) NOT NULL DEFAULT b'1',
    enabled BIT(1) NOT NULL DEFAULT b'1',
    failed_login_attempts INT NOT NULL DEFAULT 0,
    last_login_at DATETIME(6),
    last_login_ip VARCHAR(64),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME(6) NOT NULL,
    revoked BIT(1) NOT NULL DEFAULT b'0',
    revoked_at DATETIME(6),
    device_info VARCHAR(255),
    ip_address VARCHAR(64),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_refresh_token_user (user_id)
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    success BIT(1) NOT NULL,
    ip_address VARCHAR(64),
    device_info VARCHAR(255),
    attempted_at DATETIME(6) NOT NULL,
    remarks VARCHAR(255),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    INDEX idx_login_attempt_username (username),
    INDEX idx_login_attempt_at (attempted_at)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME(6) NOT NULL,
    used BIT(1) NOT NULL DEFAULT b'0',
    used_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS otp_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed BIT(1) NOT NULL DEFAULT b'0',
    consumed_at DATETIME(6),
    channel VARCHAR(50) NOT NULL,
    remarks VARCHAR(255),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    branch_code VARCHAR(20) NOT NULL UNIQUE,
    ifsc_code VARCHAR(20) NOT NULL UNIQUE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    manager_user_id BIGINT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    INDEX idx_branches_code (branch_code),
    INDEX idx_branches_ifsc (ifsc_code)
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    is_manager BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_employee_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
    INDEX idx_employees_branch (branch_id)
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    branch_id BIGINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    dob DATE NOT NULL,
    nationality VARCHAR(50),
    pan VARCHAR(20) UNIQUE,
    aadhaar VARCHAR(20) UNIQUE,
    passport VARCHAR(20) UNIQUE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    nominee_name VARCHAR(150),
    nominee_relationship VARCHAR(100),
    nominee_contact VARCHAR(20),
    employment_type VARCHAR(30),
    employer_name VARCHAR(150),
    income_range VARCHAR(30),
    risk_profile VARCHAR(20) NOT NULL,
    kyc_status VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    transaction_pin_hash VARCHAR(255),
    archived BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_customer_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
    INDEX idx_customer_code (customer_code),
    INDEX idx_customer_branch (branch_id),
    INDEX idx_customer_kyc_status (kyc_status),
    INDEX idx_customer_status (status)
);

CREATE TABLE IF NOT EXISTS customer_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    document_type VARCHAR(30) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    verification_status VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_customer_document_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(30) NOT NULL UNIQUE,
    account_type VARCHAR(30) NOT NULL,
    branch_id BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    balance DECIMAL(19,2) NOT NULL,
    available_balance DECIMAL(19,2) NOT NULL,
    hold_amount DECIMAL(19,2) NOT NULL,
    minimum_balance DECIMAL(19,2) NOT NULL,
    interest_rate DECIMAL(8,4) NOT NULL,
    overdraft_limit DECIMAL(19,2) NOT NULL,
    opened_on DATE NOT NULL,
    closed_on DATE,
    last_transaction_at DATETIME(6),
    status VARCHAR(30) NOT NULL,
    approved_by BIGINT,
    approved_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_account_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
    INDEX idx_accounts_number (account_number),
    INDEX idx_accounts_status (status),
    INDEX idx_accounts_branch (branch_id)
);

CREATE TABLE IF NOT EXISTS account_holders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    primary_holder BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_account_holder_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT fk_account_holder_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_account_holders_account (account_id),
    INDEX idx_account_holders_customer (customer_id)
);

CREATE TABLE IF NOT EXISTS beneficiaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    beneficiary_type VARCHAR(20) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    daily_limit DECIMAL(19,2) NOT NULL,
    cooling_until DATETIME(6),
    status VARCHAR(30) NOT NULL,
    is_blacklisted BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_beneficiary_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_beneficiary_customer (customer_id),
    INDEX idx_beneficiary_status (status)
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(40) NOT NULL UNIQUE,
    source_account_id BIGINT,
    destination_account_id BIGINT,
    transaction_type VARCHAR(40) NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    charges DECIMAL(19,2) NOT NULL,
    tax DECIMAL(19,2) NOT NULL,
    description VARCHAR(255),
    initiated_by BIGINT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    initiated_at DATETIME(6) NOT NULL,
    value_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(255),
    fraud_score INT NOT NULL,
    ip_address VARCHAR(64),
    device_info VARCHAR(255),
    idempotency_key VARCHAR(100) UNIQUE,
    before_balance DECIMAL(19,2),
    after_balance DECIMAL(19,2),
    approval_required BIT(1) NOT NULL DEFAULT b'0',
    approved_by BIGINT,
    approved_at DATETIME(6),
    scheduled_for DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_txn_source_account FOREIGN KEY (source_account_id) REFERENCES accounts(id),
    CONSTRAINT fk_txn_destination_account FOREIGN KEY (destination_account_id) REFERENCES accounts(id),
    INDEX idx_transactions_ref (reference_number),
    INDEX idx_transactions_status (status),
    INDEX idx_transactions_initiated_at (initiated_at),
    INDEX idx_transactions_value_date (value_date)
);

CREATE TABLE IF NOT EXISTS transaction_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by BIGINT,
    changed_at DATETIME(6) NOT NULL,
    remarks VARCHAR(255),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_txn_audit_txn FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    masked_number VARCHAR(25) NOT NULL UNIQUE,
    card_holder_name VARCHAR(150) NOT NULL,
    pin_hash VARCHAR(255),
    expiry_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    daily_limit DECIMAL(19,2) NOT NULL,
    domestic_enabled BIT(1) NOT NULL DEFAULT b'1',
    international_enabled BIT(1) NOT NULL DEFAULT b'0',
    contactless_enabled BIT(1) NOT NULL DEFAULT b'1',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_card_account FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    disbursement_account_id BIGINT NOT NULL,
    loan_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    principal_amount DECIMAL(19,2) NOT NULL,
    annual_interest_rate DECIMAL(8,4) NOT NULL,
    tenure_months INT NOT NULL,
    emi_amount DECIMAL(19,2),
    outstanding_principal DECIMAL(19,2),
    approved_on DATE,
    disbursed_on DATE,
    credit_score INT,
    risk_score INT,
    rejection_reason VARCHAR(255),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_loan_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_loan_account FOREIGN KEY (disbursement_account_id) REFERENCES accounts(id),
    INDEX idx_loans_status (status)
);

CREATE TABLE IF NOT EXISTS emi_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    principal_component DECIMAL(19,2) NOT NULL,
    interest_component DECIMAL(19,2) NOT NULL,
    penalty_component DECIMAL(19,2) NOT NULL,
    total_due DECIMAL(19,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    paid_on DATE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_emi_loan FOREIGN KEY (loan_id) REFERENCES loans(id),
    INDEX idx_emi_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS fixed_deposits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    funding_account_id BIGINT NOT NULL,
    fd_number VARCHAR(40) NOT NULL UNIQUE,
    principal_amount DECIMAL(19,2) NOT NULL,
    interest_rate DECIMAL(8,4) NOT NULL,
    tenure_months INT NOT NULL,
    opened_on DATE NOT NULL,
    maturity_date DATE NOT NULL,
    maturity_amount DECIMAL(19,2) NOT NULL,
    auto_renew BIT(1) NOT NULL DEFAULT b'0',
    payout_mode VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    certificate_number VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_fd_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_fd_account FOREIGN KEY (funding_account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS recurring_deposits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    funding_account_id BIGINT NOT NULL,
    rd_number VARCHAR(40) NOT NULL UNIQUE,
    monthly_installment DECIMAL(19,2) NOT NULL,
    interest_rate DECIMAL(8,4) NOT NULL,
    tenure_months INT NOT NULL,
    opened_on DATE NOT NULL,
    maturity_date DATE NOT NULL,
    total_paid DECIMAL(19,2) NOT NULL,
    missed_installments INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_rd_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_rd_account FOREIGN KEY (funding_account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    title VARCHAR(180) NOT NULL,
    message VARCHAR(500) NOT NULL,
    sent_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT,
    customer_id BIGINT,
    score INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    review_notes VARCHAR(500),
    reviewed_by BIGINT,
    reviewed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_fraud_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    CONSTRAINT fk_fraud_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS fee_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    percentage DECIMAL(8,4) NOT NULL,
    active BIT(1) NOT NULL DEFAULT b'1',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS interest_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_type VARCHAR(80) NOT NULL UNIQUE,
    annual_rate DECIMAL(8,4) NOT NULL,
    active BIT(1) NOT NULL DEFAULT b'1',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT,
    action_type VARCHAR(80) NOT NULL,
    target_entity VARCHAR(80) NOT NULL,
    target_id VARCHAR(80),
    old_value TEXT,
    new_value TEXT,
    success BIT(1) NOT NULL,
    remarks VARCHAR(500),
    ip_address VARCHAR(64),
    device_info VARCHAR(255),
    action_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    INDEX idx_audit_action_at (action_at)
);

CREATE TABLE IF NOT EXISTS system_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(120) NOT NULL UNIQUE,
    config_value VARCHAR(500) NOT NULL,
    description VARCHAR(255),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0
);
