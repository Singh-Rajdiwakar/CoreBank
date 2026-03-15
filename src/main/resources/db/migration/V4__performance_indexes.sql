ALTER TABLE transactions
    ADD INDEX idx_transactions_initiated_by (initiated_by),
    ADD INDEX idx_transactions_source_status_time (source_account_id, status, initiated_at),
    ADD INDEX idx_transactions_dest_status_time (destination_account_id, status, initiated_at),
    ADD INDEX idx_transactions_channel_time (channel, initiated_at);

ALTER TABLE account_holders
    ADD INDEX idx_account_holders_customer_account (customer_id, account_id);

ALTER TABLE accounts
    ADD INDEX idx_accounts_status_last_txn (status, last_transaction_at);
