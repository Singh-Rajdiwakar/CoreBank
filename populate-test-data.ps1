# Database Configuration
$dbHost = "localhost"
$dbPort = "3307"
$dbName = "banking_sim"
$dbUser = "root"
$dbPassword = "root"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "STEP 1: CHECKING CURRENT DATA" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Create SQL script file with proper formatting
$sqlCheckFile = "$env:TEMP\check_data.sql"
$sqlFile = "$env:TEMP\insert_data.sql"

# Check current data using docker exec
Write-Host "`nFetching existing data..." -ForegroundColor Yellow

$checkUsers = @"
SELECT 'USERS' as section;
SELECT id, username FROM users WHERE username IN ('admin', 'manager1', 'employee1', 'customer1') ORDER BY id;

SELECT 'BRANCHES' as section;
SELECT id, branch_code, name FROM branches WHERE branch_code = 'BR001';

SELECT 'EMPLOYEES' as section;
SELECT id, user_id, employee_code, status, is_manager FROM employees ORDER BY id;

SELECT 'CUSTOMERS' as section;
SELECT id, user_id, customer_code, status FROM customers ORDER BY id;
"@

# Write to temp file
$checkUsers | Out-File -FilePath $sqlCheckFile -Encoding UTF8

# Execute via Docker
try {
    Write-Host "`n--- Current Data ---" -ForegroundColor Green
    Get-Content $sqlCheckFile | docker exec -i banking-mysql mysql -h localhost -u $dbUser -p$dbPassword $dbName
} catch {
    Write-Host "Warning: Could not check current data via Docker. Will continue with inserts." -ForegroundColor Yellow
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "STEP 2: SQL INSERT STATEMENTS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Employee insert statements
Write-Host "`n--- EMPLOYEE INSERTS ---" -ForegroundColor Green
Write-Host @"
INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP001', 'ACTIVE', b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP001');

INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'manager1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP002', 'ACTIVE', b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP002');

INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'employee1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP003', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP003');
"@

Write-Host "`n--- CUSTOMER INSERTS ---" -ForegroundColor Green
Write-Host @"
INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000001', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Raj', 'Singh', 'MALE', '1998-02-14', '12 Residency Road', 'Mumbai', 'Maharashtra', '400001', 'India', 'LOW', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000001');

INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000002', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Priya', 'Sharma', 'FEMALE', '1995-07-22', '25 Park View, Sector 5', 'Delhi', 'Delhi', '110001', 'India', 'MEDIUM', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000002');

INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000003', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Amit', 'Patel', 'MALE', '2000-05-10', '99 Tech Park Lane', 'Bangalore', 'Karnataka', '560001', 'India', 'HIGH', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000003');
"@

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "STEP 3: EXECUTING INSERTS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Create the insert SQL file
$insertSQL = @"
INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP001', 'ACTIVE', b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP001');

INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'manager1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP002', 'ACTIVE', b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP002');

INSERT INTO employees (user_id, branch_id, employee_code, status, is_manager, created_at, updated_at, version)
SELECT (SELECT id FROM users WHERE username = 'employee1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'EMP003', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP003');

INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000001', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Raj', 'Singh', 'MALE', '1998-02-14', '12 Residency Road', 'Mumbai', 'Maharashtra', '400001', 'India', 'LOW', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000001');

INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000002', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Priya', 'Sharma', 'FEMALE', '1995-07-22', '25 Park View, Sector 5', 'Delhi', 'Delhi', '110001', 'India', 'MEDIUM', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000002');

INSERT INTO customers (customer_code, user_id, branch_id, first_name, last_name, gender, dob, address_line1, city, state, postal_code, country, risk_profile, kyc_status, status, archived, created_at, updated_at, version)
SELECT 'CUST10000003', (SELECT id FROM users WHERE username = 'customer1'), (SELECT id FROM branches WHERE branch_code = 'BR001'), 'Amit', 'Patel', 'MALE', '2000-05-10', '99 Tech Park Lane', 'Bangalore', 'Karnataka', '560001', 'India', 'HIGH', 'VERIFIED', 'ACTIVE', b'0', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE customer_code = 'CUST10000003');
"@

$insertSQL | Out-File -FilePath $sqlFile -Encoding UTF8

Write-Host "`nExecuting SQL inserts via Docker..." -ForegroundColor Yellow
try {
    Get-Content $sqlFile | docker exec -i banking-mysql mysql -h localhost -u $dbUser -p$dbPassword $dbName
    Write-Host "SQL Inserts executed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error executing inserts: $_" -ForegroundColor Red
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "STEP 4: VERIFYING DATA" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$verifySQL = @"
SELECT COUNT(*) as total_employees FROM employees;

SELECT 'Employee Details:' as info;
SELECT id, employee_code, (SELECT username FROM users WHERE users.id = employees.user_id) as username, is_manager, status FROM employees ORDER BY id;

SELECT COUNT(*) as total_customers FROM customers;

SELECT 'Customer Details:' as info;
SELECT id, customer_code, (SELECT username FROM users WHERE users.id = customers.user_id) as username, status FROM customers ORDER BY id;
"@

$verifySQL | Out-File -FilePath "$env:TEMP\verify.sql" -Encoding UTF8

Write-Host "`nVerifying database contents..." -ForegroundColor Yellow
Get-Content "$env:TEMP\verify.sql" | docker exec -i banking-mysql mysql -h localhost -u $dbUser -p$dbPassword $dbName

# Clean up
Remove-Item $sqlCheckFile -Force -ErrorAction SilentlyContinue
Remove-Item $sqlFile -Force -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\verify.sql" -Force -ErrorAction SilentlyContinue

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "DATABASE POPULATION COMPLETE!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`nNext: Test the API endpoints to verify the data is returned:" -ForegroundColor Yellow
Write-Host "- GET http://localhost:8080/api/admin/employees" -ForegroundColor Cyan
Write-Host "- GET http://localhost:8080/api/customers" -ForegroundColor Cyan
