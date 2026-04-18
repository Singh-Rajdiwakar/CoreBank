UPDATE users SET password_hash='$2a$10$nHiAxgRkcnD85Z/OF0ayfOMRY.EJbN7xhMWRdbuxFNSq5cKgVGcSm', account_non_locked=1, failed_login_attempts=0 WHERE username='admin';
