ALTER TABLE notifications
    ADD INDEX idx_notifications_status_created (status, created_at);
