INSERT INTO roles (name, created_at, updated_at, version)
SELECT 'ROLE_CUSTOMER', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_CUSTOMER');

INSERT INTO roles (name, created_at, updated_at, version)
SELECT 'ROLE_EMPLOYEE', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_EMPLOYEE');

INSERT INTO roles (name, created_at, updated_at, version)
SELECT 'ROLE_MANAGER', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_MANAGER');

INSERT INTO roles (name, created_at, updated_at, version)
SELECT 'ROLE_ADMIN', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

INSERT INTO roles (name, created_at, updated_at, version)
SELECT 'ROLE_AUDITOR', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_AUDITOR');

INSERT INTO users (
    username, email, phone, password_hash, password_changed_at, password_expiry_date,
    account_non_locked, enabled, failed_login_attempts, created_at, updated_at, version
)
SELECT
    'admin', 'admin@bank.local', '9000000001',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    NOW(6), DATE_ADD(CURDATE(), INTERVAL 365 DAY), b'1', b'1', 0, NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (
    username, email, phone, password_hash, password_changed_at, password_expiry_date,
    account_non_locked, enabled, failed_login_attempts, created_at, updated_at, version
)
SELECT
    'manager1', 'manager1@bank.local', '9000000002',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    NOW(6), DATE_ADD(CURDATE(), INTERVAL 365 DAY), b'1', b'1', 0, NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager1');

INSERT INTO users (
    username, email, phone, password_hash, password_changed_at, password_expiry_date,
    account_non_locked, enabled, failed_login_attempts, created_at, updated_at, version
)
SELECT
    'employee1', 'employee1@bank.local', '9000000003',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    NOW(6), DATE_ADD(CURDATE(), INTERVAL 365 DAY), b'1', b'1', 0, NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'employee1');

INSERT INTO users (
    username, email, phone, password_hash, password_changed_at, password_expiry_date,
    account_non_locked, enabled, failed_login_attempts, created_at, updated_at, version
)
SELECT
    'auditor1', 'auditor1@bank.local', '9000000004',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    NOW(6), DATE_ADD(CURDATE(), INTERVAL 365 DAY), b'1', b'1', 0, NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'auditor1');

INSERT INTO users (
    username, email, phone, password_hash, password_changed_at, password_expiry_date,
    account_non_locked, enabled, failed_login_attempts, created_at, updated_at, version
)
SELECT
    'customer1', 'customer1@bank.local', '9000000005',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    NOW(6), DATE_ADD(CURDATE(), INTERVAL 365 DAY), b'1', b'1', 0, NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'customer1');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'manager1' AND r.name = 'ROLE_MANAGER'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'employee1' AND r.name = 'ROLE_EMPLOYEE'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'auditor1' AND r.name = 'ROLE_AUDITOR'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'customer1' AND r.name = 'ROLE_CUSTOMER'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO branches (
    name, branch_code, ifsc_code, address_line1, city, state, postal_code,
    contact_email, contact_phone, status, manager_user_id, created_at, updated_at, version
)
SELECT
    'Main Branch', 'BR001', 'BANK0001234', '100 Finance Street', 'Mumbai', 'Maharashtra', '400001',
    'branch.main@bank.local', '02212345678', 'ACTIVE',
    (SELECT id FROM users WHERE username = 'manager1'),
    NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE branch_code = 'BR001');

INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT
    (SELECT id FROM users WHERE username = 'manager1'),
    (SELECT id FROM branches WHERE branch_code = 'BR001'),
    'EMP1001', 'ACTIVE', b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP1001');

INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT
    (SELECT id FROM users WHERE username = 'employee1'),
    (SELECT id FROM branches WHERE branch_code = 'BR001'),
    'EMP1002', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP1002');

INSERT INTO customers (
    customer_code, user_id, branch_id, first_name, last_name, gender, dob,
    address_line1, city, state, postal_code, country,
    risk_profile, kyc_status, status, archived,
    created_at, updated_at, version
)
SELECT
    'CUST10000001',
    (SELECT id FROM users WHERE username = 'customer1'),
    (SELECT id FROM branches WHERE branch_code = 'BR001'),
    'Raj', 'Singh', 'MALE', '1998-02-14',
    '12 Residency Road', 'Mumbai', 'Maharashtra', '400001', 'India',
    'LOW', 'VERIFIED', 'ACTIVE', b'0',
    NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000001');

INSERT INTO accounts (
    account_number, account_type, branch_id, currency, balance, available_balance, hold_amount,
    minimum_balance, interest_rate, overdraft_limit, opened_on, status, approved_by, approved_at,
    created_at, updated_at, version
)
SELECT
    '42000000000001', 'SAVINGS',
    (SELECT id FROM branches WHERE branch_code = 'BR001'),
    'INR', 250000.00, 250000.00, 0.00,
    5000.00, 3.5000, 0.00, CURDATE(), 'ACTIVE',
    (SELECT id FROM users WHERE username = 'manager1'), NOW(6),
    NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = '42000000000001');

INSERT INTO account_holders (account_id, customer_id, primary_holder, created_at, updated_at, version)
SELECT
    (SELECT id FROM accounts WHERE account_number = '42000000000001'),
    (SELECT id FROM customers WHERE customer_code = 'CUST10000001'),
    b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (
    SELECT 1 FROM account_holders
    WHERE account_id = (SELECT id FROM accounts WHERE account_number = '42000000000001')
      AND customer_id = (SELECT id FROM customers WHERE customer_code = 'CUST10000001')
);

INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'INTERNAL_TRANSFER', 'Internal transfer flat fee', 2.50, 0.0000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'INTERNAL_TRANSFER');

INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'EXTERNAL_TRANSFER', 'External transfer flat fee', 7.50, 0.0000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'EXTERNAL_TRANSFER');

INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'ATM_WITHDRAWAL', 'ATM withdrawal charge', 20.00, 0.0000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'ATM_WITHDRAWAL');

INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'MIN_BALANCE_PENALTY', 'Penalty when monthly minimum balance not maintained', 250.00, 0.0000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'MIN_BALANCE_PENALTY');

INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'ACCOUNT_MAINTENANCE', 'Monthly account maintenance charge', 50.00, 0.0000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'ACCOUNT_MAINTENANCE');

INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'OVERDRAFT_DAILY_INTEREST_PERCENT', 'Daily overdraft interest percent', 0.00, 0.0500, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'OVERDRAFT_DAILY_INTEREST_PERCENT');

INSERT INTO interest_rules (product_type, annual_rate, active, created_at, updated_at, version)
SELECT 'SAVINGS', 3.5000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM interest_rules WHERE product_type = 'SAVINGS');

INSERT INTO interest_rules (product_type, annual_rate, active, created_at, updated_at, version)
SELECT 'FIXED_DEPOSIT', 7.1000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM interest_rules WHERE product_type = 'FIXED_DEPOSIT');

INSERT INTO interest_rules (product_type, annual_rate, active, created_at, updated_at, version)
SELECT 'RECURRING_DEPOSIT', 6.8000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM interest_rules WHERE product_type = 'RECURRING_DEPOSIT');

INSERT INTO system_configs (config_key, config_value, description, created_at, updated_at, version)
SELECT 'fraud.auto_block_threshold', '85', 'Auto block threshold for fraud score', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM system_configs WHERE config_key = 'fraud.auto_block_threshold');

INSERT INTO system_configs (config_key, config_value, description, created_at, updated_at, version)
SELECT 'transfer.high_value_threshold', '100000', 'OTP threshold for transfer', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM system_configs WHERE config_key = 'transfer.high_value_threshold');
