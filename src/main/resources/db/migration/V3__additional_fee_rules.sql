INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'MIN_BALANCE_PENALTY', 'Penalty when monthly minimum balance not maintained', 250.00, 0.0000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'MIN_BALANCE_PENALTY');

INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'ACCOUNT_MAINTENANCE', 'Monthly account maintenance charge', 50.00, 0.0000, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'ACCOUNT_MAINTENANCE');

INSERT INTO fee_rules (code, description, amount, percentage, active, created_at, updated_at, version)
SELECT 'OVERDRAFT_DAILY_INTEREST_PERCENT', 'Daily overdraft interest percent', 0.00, 0.0500, b'1', NOW(6), NOW(6), 0
WHERE NOT EXISTS (SELECT 1 FROM fee_rules WHERE code = 'OVERDRAFT_DAILY_INTEREST_PERCENT');
