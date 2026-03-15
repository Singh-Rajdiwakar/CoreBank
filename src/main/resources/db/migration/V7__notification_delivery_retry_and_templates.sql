SET @notifications_table_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
);

SET @notification_preferences_table_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'notification_preferences'
);

SET @delivered_at_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND column_name = 'delivered_at'
);

SET @provider_message_id_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND column_name = 'provider_message_id'
);

SET @attempt_count_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND column_name = 'attempt_count'
);

SET @next_retry_at_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND column_name = 'next_retry_at'
);

SET @last_error_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND column_name = 'last_error'
);

SET @language_code_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'notification_preferences'
      AND column_name = 'language_code'
);

SET @idx_status_retry_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND index_name = 'idx_notifications_status_retry'
);

SET @idx_provider_message_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'notifications'
      AND index_name = 'idx_notifications_provider_message'
);

SET @add_delivered_at_sql := IF(
    @notifications_table_exists > 0 AND @delivered_at_exists = 0,
    'ALTER TABLE notifications ADD COLUMN delivered_at DATETIME(6)',
    'SELECT 1'
);
PREPARE add_delivered_at_stmt FROM @add_delivered_at_sql;
EXECUTE add_delivered_at_stmt;
DEALLOCATE PREPARE add_delivered_at_stmt;

SET @add_provider_message_id_sql := IF(
    @notifications_table_exists > 0 AND @provider_message_id_exists = 0,
    'ALTER TABLE notifications ADD COLUMN provider_message_id VARCHAR(120)',
    'SELECT 1'
);
PREPARE add_provider_message_id_stmt FROM @add_provider_message_id_sql;
EXECUTE add_provider_message_id_stmt;
DEALLOCATE PREPARE add_provider_message_id_stmt;

SET @add_attempt_count_sql := IF(
    @notifications_table_exists > 0 AND @attempt_count_exists = 0,
    'ALTER TABLE notifications ADD COLUMN attempt_count INT NOT NULL DEFAULT 0',
    'SELECT 1'
);
PREPARE add_attempt_count_stmt FROM @add_attempt_count_sql;
EXECUTE add_attempt_count_stmt;
DEALLOCATE PREPARE add_attempt_count_stmt;

SET @add_next_retry_at_sql := IF(
    @notifications_table_exists > 0 AND @next_retry_at_exists = 0,
    'ALTER TABLE notifications ADD COLUMN next_retry_at DATETIME(6)',
    'SELECT 1'
);
PREPARE add_next_retry_at_stmt FROM @add_next_retry_at_sql;
EXECUTE add_next_retry_at_stmt;
DEALLOCATE PREPARE add_next_retry_at_stmt;

SET @add_last_error_sql := IF(
    @notifications_table_exists > 0 AND @last_error_exists = 0,
    'ALTER TABLE notifications ADD COLUMN last_error VARCHAR(255)',
    'SELECT 1'
);
PREPARE add_last_error_stmt FROM @add_last_error_sql;
EXECUTE add_last_error_stmt;
DEALLOCATE PREPARE add_last_error_stmt;

SET @add_language_code_sql := IF(
    @notification_preferences_table_exists > 0 AND @language_code_exists = 0,
    'ALTER TABLE notification_preferences ADD COLUMN language_code VARCHAR(5) NOT NULL DEFAULT ''EN''',
    'SELECT 1'
);
PREPARE add_language_code_stmt FROM @add_language_code_sql;
EXECUTE add_language_code_stmt;
DEALLOCATE PREPARE add_language_code_stmt;

SET @add_idx_status_retry_sql := IF(
    @notifications_table_exists > 0 AND @idx_status_retry_exists = 0,
    'ALTER TABLE notifications ADD INDEX idx_notifications_status_retry (status, next_retry_at)',
    'SELECT 1'
);
PREPARE add_idx_status_retry_stmt FROM @add_idx_status_retry_sql;
EXECUTE add_idx_status_retry_stmt;
DEALLOCATE PREPARE add_idx_status_retry_stmt;

SET @add_idx_provider_message_sql := IF(
    @notifications_table_exists > 0 AND @idx_provider_message_exists = 0,
    'ALTER TABLE notifications ADD INDEX idx_notifications_provider_message (provider_message_id)',
    'SELECT 1'
);
PREPARE add_idx_provider_message_stmt FROM @add_idx_provider_message_sql;
EXECUTE add_idx_provider_message_stmt;
DEALLOCATE PREPARE add_idx_provider_message_stmt;
