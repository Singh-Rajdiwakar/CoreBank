-- Insert 3 Employees
INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP001', 'ACTIVE', b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP001');

INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'manager1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP002', 'ACTIVE', b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP002');

INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'employee1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP003', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP003');

-- Insert 3 Customers
INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000001', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Raj', 'Singh', 'MALE', '1998-02-14', '12 Residency Road', 'Mumbai', 'Maharashtra', '400001', 'India', 'LOW', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000001');

INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000002', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Priya', 'Sharma', 'FEMALE', '1995-07-22', '25 Park View, Sector 5', 'Delhi', 'Delhi', '110001', 'India', 'MEDIUM', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000002');

INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000003', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Amit', 'Patel', 'MALE', '2000-05-10', '99 Tech Park Lane', 'Bangalore', 'Karnataka', '560001', 'India', 'HIGH', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000003');
