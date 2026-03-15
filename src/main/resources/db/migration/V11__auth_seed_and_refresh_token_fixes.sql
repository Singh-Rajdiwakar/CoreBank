ALTER TABLE refresh_tokens
    MODIFY COLUMN token VARCHAR(768) NOT NULL;

UPDATE users
SET password_hash = '$2a$10$nHiAxgRkcnD85Z/OF0ayfOMRY.EJbN7xhMWRdbuxFNSq5cKgVGcSm',
    account_non_locked = b'1',
    failed_login_attempts = 0,
    enabled = b'1',
    password_changed_at = NOW(6),
    password_expiry_date = DATE_ADD(CURDATE(), INTERVAL 365 DAY)
WHERE username IN ('admin', 'manager1', 'employee1', 'auditor1', 'customer1')
  AND password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
