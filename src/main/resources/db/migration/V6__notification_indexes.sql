ALTER TABLE notifications
    ADD INDEX idx_notifications_user_created (user_id, created_at),
    ADD INDEX idx_notifications_user_read_created (user_id, read_flag, created_at);

ALTER TABLE notification_preferences
    ADD INDEX idx_notification_preferences_user (user_id);
