# Banking System Simulation (Enterprise-Style)

A production-inspired digital banking backend simulation built with **Java 21 + Spring Boot + MySQL**.

This project is intentionally beyond basic CRUD and includes:
- Role-based banking operations (`CUSTOMER`, `EMPLOYEE`, `MANAGER`, `ADMIN`, `AUDITOR`)
- JWT auth + refresh token + lockout + password expiry + OTP simulation
- Customer lifecycle, KYC status, branch mapping, document metadata
- Multi-account support, holder mapping, account lifecycle (`PENDING_APPROVAL`, `ACTIVE`, `DORMANT`, `FREEZED`, `BLOCKED`, `CLOSED`)
- Beneficiary cooling period + verification flow
- Transaction engine with idempotency, maker-checker pending queue, rollback-safe atomic debit/credit
- Recurring transfer setup + bulk transfer file simulation endpoints
- Fraud scoring + alert queue + manual review APIs
- Loan module (apply/review/disburse/EMI/foreclose)
- FD/RD products with maturity and penalties
- Card simulation (request/activate/block/hotlist/PIN/settings/ATM withdrawal)
- Card transaction history endpoint + account ownership checks for customer card actions
- Real-time transaction alert engine for debit/credit/pending/failed/reversed transactions
- Channel-aware transaction alerts (in-app + email + SMS simulation) with immediate low-balance warning
- Notification preferences API with read/unread management
- Notification retry queue with exponential backoff + delivery callback simulation
- Bilingual transaction alert templates (EN/HI) based on user notification preference
- Admin notification queue monitoring (pending/failed/sent/due-retry) + status-wise feed
- Dispute/chargeback-style case management with liability tiering, SLA tracking, assignment, escalation and resolution workflow
- Dispute evidence attachment metadata + dispute timeline/audit trail APIs
- Audit logging for sensitive actions
- Reporting/dashboard/analytics endpoints
- Scheduled jobs (dormancy, maturity, low-balance alerts, interest posting, statements)
- Scheduled monthly maintenance/min-balance penalty and daily overdraft interest debits
- Reconciliation summary report endpoint for daily ops simulation
- Docker support + Flyway migrations + seed data + Postman collection + Swagger

## Tech Stack
- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA (Hibernate)
- MySQL + Flyway
- JWT (jjwt)
- Bean Validation
- Lombok
- OpenAPI/Swagger
- JUnit 5 + Mockito
- Docker / Docker Compose

## Project Structure

```text
src/main/java/com/bankingsim/banking
  audit/
  config/
  controller/
  dto/
  entity/
  exception/
  fraud/
  mapper/
  notification/
  reporting/
  repository/
  scheduler/
  security/
  service/
  util/
  validation/
```

## Security Model

### Roles
- `ROLE_CUSTOMER`
- `ROLE_EMPLOYEE`
- `ROLE_MANAGER`
- `ROLE_ADMIN`
- `ROLE_AUDITOR`

### Auth Features
- Registration / login / logout / refresh token
- BCrypt password hashing
- Password expiry tracking
- Forgot/reset password token flow
- OTP generation/verification simulation
- Failed login tracking + account lock
- Admin unlock flow
- JWT access token + refresh token persistence
- Token revocation support (refresh + in-memory access blacklist)

### CSRF Decision
CSRF is **disabled** because APIs are stateless and secured with bearer JWT tokens (no cookie-based session auth). This is standard for token-based API backends.

### Request Protection
- CORS configured via `app.security.cors.allowed-origins`
- Request logging filter (IP/user-agent/method/path/status/duration)
- Rate limiting simulation for login and transfer endpoints
- Idempotency-key enforced for transfer APIs

## Configuration
Main config: `src/main/resources/application.yml`

Important env vars:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`

Optional alert controls:
- `app.notifications.email-enabled`
- `app.notifications.sms-enabled`
- `app.notifications.max-retries`
- `app.notifications.retry-delay-seconds`
- `app.notifications.retry-batch-size`
- `app.notifications.email-failure-rate-percent`
- `app.notifications.sms-failure-rate-percent`
- `app.notifications.template-default-language`
- `app.notifications.retention-days`

## Database
Flyway migrations:
- `V1__schema.sql` - normalized schema + indexes
- `V2__seed_data.sql` - roles/users/branch/customer/account/rules/config seed
- `V3__additional_fee_rules.sql` - operational fee rules for penalties/maintenance/overdraft
- `V4__performance_indexes.sql` - additional performance indexes for transaction/reporting workloads
- `V5__notification_preferences_and_read_status.sql` - notification preferences and read tracking
- `V6__notification_indexes.sql` - notification feed/read performance indexes
- `V7__notification_delivery_retry_and_templates.sql` - delivery retry metadata, callback support, language preference
- `V8__notification_cleanup_index.sql` - index for retention cleanup performance
- `V9__dispute_case_module.sql` - dispute case schema, indexing, assignment and SLA support
- `V10__dispute_evidence_and_timeline_indexes.sql` - dispute evidence metadata + dispute timeline index
- `V11__auth_seed_and_refresh_token_fixes.sql` - seed credential alignment and refresh token column-size fix

### Seed Login Accounts
Default seeded password is: `password`

- Admin: `admin`
- Manager: `manager1`
- Employee: `employee1`
- Auditor: `auditor1`
- Customer: `customer1`

## Run Locally

### Prerequisites
- Java 21
- Maven 3.9+
- MySQL 8+

### Steps
1. Create DB (or use auto create in URL): `banking_sim`
2. Set env vars (optional if using defaults)
3. Run:
   ```bash
   mvn clean spring-boot:run
   ```
4. Open Swagger:
   - `http://localhost:8080/swagger-ui.html`

## Run with Docker

```bash
docker compose up --build
```

App: `http://localhost:8080`

## API Highlights

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/otp/generate`
- `POST /api/auth/otp/verify`

### Core Banking
- `GET/POST /api/customers`
- `GET/POST/PATCH /api/accounts/*`
- `GET/POST /api/beneficiaries/*`
- `POST /api/deposits`
- `POST /api/withdrawals`
- `POST /api/transfers/internal|beneficiary|neft|imps|rtgs|upi|scheduled|recurring`
- `POST /api/transfers/bulk-file`

### Cards / Loans / Deposits
- `POST/PATCH /api/cards/*`
- `GET /api/cards/{cardNumber}/transactions`
- `POST/PATCH /api/loans/*`
- `POST/PATCH /api/deposit-products/fd|rd/*`

### Notifications
- `GET /api/notifications/me?page=0&size=50`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/me/read-all`
- `GET /api/notifications/preferences`
- `PATCH /api/notifications/preferences`
- `PATCH /api/notifications/callbacks/delivery` (admin/manager)
- `PATCH /api/notifications/admin/retry-dispatch` (admin/manager)
  - Optional query param: `channel=EMAIL|SMS`
- `GET /api/notifications/admin/summary` (admin/manager/auditor)
- `GET /api/notifications/admin/queue?status=PENDING&page=0&size=50` (admin/manager/auditor)
- `DELETE /api/notifications/admin/cleanup` (admin)
- `GET /api/notifications/admin/dead-letter/export?channel=SMS&limit=1000` (admin/manager/auditor, CSV)

### Disputes
- `POST /api/disputes` (customer)
- `GET /api/disputes/me` (customer)
- `POST /api/disputes/{id}/evidence` (customer/employee/manager/admin)
- `GET /api/disputes/{id}/evidence` (customer/employee/manager/admin/auditor)
- `GET /api/disputes/{id}/timeline` (customer/employee/manager/admin/auditor)
- `GET /api/disputes/ops` (employee/manager/admin/auditor)
- `GET /api/disputes/ops/summary` (employee/manager/admin/auditor)
- `PATCH /api/disputes/{id}/assign` (manager/admin)
- `PATCH /api/disputes/{id}/status` (employee/manager/admin)

### Admin / Fraud / Reporting / Audit
- `POST/GET /api/admin/config/*`
- `GET /api/admin/reports/*`
- `GET /api/admin/reports/reconciliation`
- `GET/PATCH /api/fraud/cases/*`
- `GET /api/audit/logs`
- `GET /api/reports/*`

## Testing

Run tests:
```bash
mvn test
```

Included tests cover:
- Fraud scoring behavior
- Idempotent transfer handling
- Balance safety checks
- Auth lock behavior
- Controller login response contract

## Postman
Collection: `postman/BankingSystem.postman_collection.json`

Set variables:
- `baseUrl` (default `http://localhost:8080`)
- `accessToken`

## Notes
- Monetary values use `BigDecimal` (never `double`).
- Account updates use optimistic versioning and transfer flows use DB transaction boundaries + pessimistic row lock access method for debit/credit safety.
- This is a simulation backend; external integrations (SMS/email gateways, actual core banking rails) are mocked through event-driven notification simulation.
- Performance-oriented paths use DB aggregation queries instead of loading full transaction sets in memory.
- Notification dispatch is asynchronous via dedicated thread pool for lower request latency.
- Notification feed is paginated and indexed by user/read/time for better response latency at scale.
- SMS/email delivery supports retry queue behavior for transient failures and provider callback update simulation.
- Dead-letter (failed SMS/email) notifications can be exported as CSV for audit/ops reporting.
- Dispute module includes auto-escalation of overdue open cases via scheduler.

## Industry References Used
- RBI: Customer protection and liability in unauthorized electronic banking transactions (July 6, 2017 circular): `https://rbi.org.in/Scripts/NotificationUser.aspx?Id=11040&Mode=0`
- Mastercard: Dispute management lifecycle concepts and stages: `https://www.mastercard.us/en-us/business/issuers/get-support/resolve-disputes.html`
- Visa: Dispute framework resources and operations guide catalog: `https://visa-resources.manager.e.visa.com/latest-dispute-management-guides`
