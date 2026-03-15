CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    transaction_in_app_enabled BIT(1) NOT NULL DEFAULT b'1',
    transaction_email_enabled BIT(1) NOT NULL DEFAULT b'1',
    transaction_sms_enabled BIT(1) NOT NULL DEFAULT b'1',
    security_in_app_enabled BIT(1) NOT NULL DEFAULT b'1',
    security_email_enabled BIT(1) NOT NULL DEFAULT b'1',
    security_sms_enabled BIT(1) NOT NULL DEFAULT b'1',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_notification_preferences_user FOREIGN KEY (user_id) REFERENCES users(id)
);

SET @notifications_table_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
);

SET @read_flag_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND column_name = 'read_flag'
);

SET @read_at_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND column_name = 'read_at'
);

SET @add_read_flag_sql := IF(
    @notifications_table_exists > 0 AND @read_flag_exists = 0,
    'ALTER TABLE notifications ADD COLUMN read_flag BIT(1) NOT NULL DEFAULT b''0''',
    'SELECT 1'
);
PREPARE add_read_flag_stmt FROM @add_read_flag_sql;
EXECUTE add_read_flag_stmt;
DEALLOCATE PREPARE add_read_flag_stmt;

SET @add_read_at_sql := IF(
    @notifications_table_exists > 0 AND @read_at_exists = 0,
    'ALTER TABLE notifications ADD COLUMN read_at DATETIME(6)',
    'SELECT 1'
);
PREPARE add_read_at_stmt FROM @add_read_at_sql;
EXECUTE add_read_at_stmt;
DEALLOCATE PREPARE add_read_at_stmt;
