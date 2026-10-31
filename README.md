# KQ Event Styling - IT305W Advanced Web Applications

This refactor adds a standalone PHP application to `public/`, backed by SQLite. It is intentionally separate from the original Supabase-only pages so the current site remains available while the PHP version is demonstrated or deployed.

## Run locally

1. Use PHP 8.1+ with `pdo_sqlite` enabled.
2. From the repository root, initialise the database:

   ```powershell
   C:\xampp\php\php.exe bin/init-db.php
   ```

3. Serve only the `public` directory:

   ```powershell
   C:\xampp\php\php.exe -S localhost:8080 -t public
   ```

4. Open `http://localhost:8080`. The local demonstration admin is `admin@kqstyling.test` / `ChangeMe123!`; replace or remove it before deployment.

The SQLite file is created at `var/kq.sqlite`; set `KQ_DB_PATH` to use a different writable location in production. Keep `app/`, `database/`, `bin/`, and `var/` outside the web root.

## Architecture and rubric evidence

| Requirement | Implemented evidence |
| --- | --- |
| JSON | Every API response is a `data`/`error` JSON envelope. The browser serializes form objects with `JSON.stringify`, parses responses with `response.json`, renders returned records, and submits nested state through JSON. `audit_log.details_json` preserves structured server events. |
| AJAX | `public/assets/app.js` uses `fetch` for bootstrap, registration, login, availability, bookings, payment submission, dashboard data, approval, and change requests. The page updates only the affected rows/statistics. |
| PHP | `api.php`, `bootstrap.php`, and `BookingService.php` handle routing, sessions, authentication, validation, money calculation, booking state transitions, payment checks, access control, and atomic transactions. |
| Database | `database/schema.sql` defines normalized users, packages, bookings, schedule locks, payments, changes, inventory, expenses, and audit tables. PDO prepared statements protect database queries. |
| UI/UX | The responsive semantic interface has labels, live status messages, keyboard-native controls, mobile table scrolling, and clear booking/admin views. |
| Security | HttpOnly/SameSite sessions, CSRF tokens, session ID renewal, a CSP, prepared statements, strict server validation, authorization ownership checks, throttled login attempts, escaped DOM text, correct money integers, and non-sensitive server errors are included. |

## Demonstration script

Create a customer account, choose a future date, and submit a booking. The displayed total includes the PHP-calculated travel fee and 30% deposit. Submit its payment reference, sign in as the administrator, and approve the booking after reviewing the payment in the database/API. Repeat the customer booking on the same approved date/slot to show the live availability endpoint prevents the conflict.

The original Supabase scripts remain in the repository as the legacy implementation. Before replacing the production site, migrate existing Supabase records and connect the existing AI estimator/upload/notification features to equivalent PHP endpoints; those integrations need their service credentials and were not moved into source control.
