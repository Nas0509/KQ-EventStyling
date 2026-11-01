# KQ Event Styling - IT305W Advanced Web Applications

This repository currently has the original Supabase website and a PHP replacement being migrated in parallel. The PHP app is served from `public/` and stores its records in SQLite. Keep the existing site available until the remaining features and data migration are complete.

## PHP requirements

- PHP 8.1 or later
- `pdo_sqlite` and `mbstring` extensions
- `fileinfo` for private design-image previews
- `openssl` and outbound HTTPS access for Gemini/OpenAI AI requests
- A persistent, private writable directory for SQLite, sessions and reference images

## Local Windows setup

From the repository root, initialize or update the PHP database schema. This preserves existing PHP accounts and records:

```powershell
& "C:\path\to\php.exe" bin\init-db.php
```

Create the first administrator only if the database does not already have one. Use the secure PowerShell password prompt instructions in the deployment section below; no default admin credentials are shipped.

Start the local development server with the actual path to your PHP executable:

```powershell
& "C:\path\to\php.exe" -S localhost:8080 -t public
```

Then open `http://localhost:8080`. Keep the terminal open while using the app. PHP's built-in server is for local development and demonstrations only; do not expose it to the public internet.

For local password-reset email testing with Gmail, first enable Google 2-Step Verification and create a Google App Password. Then run `powershell -ExecutionPolicy Bypass -File bin\start-local-gmail.ps1`; enter the Gmail sender address and App Password when prompted. The password prompt is hidden, the script does not save the password, and it loads OpenSSL only for that local server process. Stop the local server with Ctrl+C. This local setup does not configure the live hosting account.

If a customer only needs a new password in the local database and does not need a reset email, run `powershell -ExecutionPolicy Bypass -File bin\reset-customer.ps1` from the project folder. Enter the customer's registered email and a new password twice at the hidden prompts. This changes only the matching customer account in the local SQLite database and invalidates any old reset links; it does not change the live hosting database.

## Migrate Supabase CSV exports

The PHP importer reads data locally; do not send customer CSV files in chat or commit them. In Supabase, export the non-empty `profiles`, `bookings`, `payments`, `booking_change_requests`, `ocular_inspection_requests`, and `user_notifications` tables as CSV. Save them under `var/supabase-export/` with those exact filenames (for example `profiles.csv`). The empty `inventory` and `expenses` tables do not need exports. Keep the export folder private and outside `public/`.

Run a preview first. It rolls back imported rows and prints counts plus any review notes:

```powershell
& "C:\path\to\php.exe" bin\import-supabase-csv.php
```

Back up `var/kq.sqlite` before applying. Stop the PHP server, copy the database file to a safe location, restart the server, review the preview output, and only then run:

```powershell
& "C:\path\to\php.exe" bin\import-supabase-csv.php --apply
```

The importer matches Supabase profiles by email, keeps the existing local admin account, and creates random-password customer accounts for new profiles. Customers will need password-reset emails, so configure and confirm the hosting mail transport before moving them over. Historical payment amounts that are not clearly marked paid are imported as pending for admin review. Keep the CSV exports private and remove them after the migration is confirmed.

## Create the first administrator

Set `KQ_ADMIN_EMAIL` to the administrator's real email, then run the following commands one at a time from the repository root. The password is entered as a hidden secure prompt, must be unique to this app, and must have at least 12 characters with uppercase/lowercase letters and a number.

```powershell
$env:KQ_ADMIN_EMAIL = 'admin@example.com'
$secure = Read-Host 'Choose a unique admin password' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$env:KQ_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
& "C:\path\to\php.exe" bin\create-admin.php
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
Remove-Item Env:KQ_ADMIN_PASSWORD, Env:KQ_ADMIN_EMAIL
```

The script refuses to add another admin when one already exists. Keep environment values out of shell history, source control and screenshots.

If the one local administrator cannot sign in, run `bin\reset-admin.ps1` in PowerShell. It prompts for a hidden new password and only resets the password when exactly one admin account exists in the local database. Use the admin's existing email at sign-in; imported Supabase customer passwords are not transferred.

## AI service settings

The PHP API reads secrets from the server environment; never put them in browser JavaScript or commit them:

- `GEMINI_API_KEY` for the KQ AI chat; optional `GEMINI_MODEL` overrides the model name.
- `OPENAI_API_KEY` for the reference-image estimator; optional `OPENAI_MODEL` overrides the model name.

When a key is not configured, the corresponding AI feature returns a clear unavailable message. The image estimate remains a preliminary package suggestion, not a binding quote.

## Deploy the PHP version

For a no-card school demonstration, see [`deployment/weeny/README.md`](deployment/weeny/README.md). Weeny free servers can sleep while idle and are not suitable for real business/customer data. That guide uses a separate empty demo database; keep actual customer data private.

For a free PHP demo deployment on Render, see [`deployment/render/README.md`](deployment/render/README.md). Render can run PHP through Docker, but its free filesystem is temporary, so the SQLite demo records reset when the service sleeps, restarts, or redeploys. Do not use it for actual customer bookings.

The prepared live package contains the PHP site source and public assets only. It deliberately excludes the local SQLite database, database backups, session files, Supabase exports, API keys, and credentials. Do not upload those private files into the public website folder.

1. Choose a PHP host that supports PHP 8.1+, `pdo_sqlite`, `mbstring`, and `fileinfo`; persistent disk; HTTPS; outbound HTTPS for any AI features you enable; and a working email sender for password resets. SQLite is not suitable for an ephemeral serverless filesystem.
2. Upload/extract the package, then set the website document root to the package's `public/` folder. `app/`, `bin/`, and `database/` must remain outside the document root. For Apache, `public/.htaccess` disables directory listings and blocks dotfiles and common private/backup file types. On Nginx or other hosts, set equivalent rules in the host configuration; `.htaccess` is ignored there.
3. In the hosting control panel, set `KQ_PRIVATE_DIR` to a persistent writable directory outside the document root (for example `/home/ACCOUNT/kq-private`). The app uses it for the SQLite default, PHP sessions, and private design images. Set `KQ_DB_PATH` to a full SQLite file path in that private directory (for example `/home/ACCOUNT/kq-private/kq.sqlite`). The web process and CLI must use the same values. The app creates the database, session, and upload folders as needed; the host account must be able to write there.
4. Set `KQ_APP_URL` to the final HTTPS website address and `KQ_MAIL_FROM` to a sender address verified by the host. Configure authenticated SMTP with `SMTP_HOST`, `SMTP_PORT` (587 for TLS or 465 for SSL), `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_ENCRYPTION` (`tls` or `ssl`). Put these in the host's private environment settings, never in website files. Send a real password-reset email before inviting users. Until SMTP is configured, the forgot-password page will clearly say email delivery is unavailable. HTTPS is required for secure sign-in cookies.
5. Run `php bin/init-db.php` from the package root on the host using the same `KQ_PRIVATE_DIR` and `KQ_DB_PATH` settings. Create an initial admin with `KQ_ADMIN_EMAIL` and `KQ_ADMIN_PASSWORD` set only for the CLI setup, then immediately remove them. Never put a password in a website file or browser page.
6. Add `GEMINI_API_KEY` for KQ AI chat and `OPENAI_API_KEY` for the image estimator as host secrets if those features are needed. Current model defaults are `gemini-3.5-flash-lite` and `gpt-6-astra`; the host account needs API access/billing for each configured service.
7. Existing local/Supabase customer records and any private design-reference image files are not included in the package. Before switching the business to the live site, securely import and reconcile customer records, bookings, payment history, inspections, change requests, and any image files referenced by existing PHP records. Supabase passwords cannot be exported as plaintext, so customers may need password resets. Keep the current system available until the import and live sign-in/booking/payment/email checks are complete.

### Import Supabase CSVs on the host

Keep CSV files in a private directory outside the public folder. Run the importer in preview mode first, then apply it only after reviewing the counts and warnings. The second argument points to the private export folder:

```sh
php bin/import-supabase-csv.php /home/ACCOUNT/kq-private/supabase-export
php bin/import-supabase-csv.php /home/ACCOUNT/kq-private/supabase-export --apply
```

Use the host's CLI environment with the same `KQ_DB_PATH` and `KQ_PRIVATE_DIR` as the website. Keep a protected backup before applying an import. Delete the temporary export after confirming the live data.

The built-in PHP server is only for local development and demonstrations. Uploading files alone does not publish the site; the host must provide the PHP runtime, document-root setting, private storage, and environment settings above.

## Current PHP migration status

The PHP endpoints now sit behind copies of the original KQ pages and styles, preserving the existing home page, package galleries, booking form, account pages, ocular page and admin dashboard design. The main customer, admin and ocular flows use the PHP API for accounts, bookings, availability, notifications, payment review, expenses and inventory. It supports partial payments after approval and preserves the 30-day reschedule review rule.

The original public pages and styling are preserved in `public/`; their account, booking, payment, inventory, expense, notification, ocular and administrator actions now use the PHP API. Password reset and the original ocular travel-time conflict rules are also handled by PHP. Password-reset delivery requires the host's mail transport to work. AI access requires the hosting secrets listed above. The PHP database is separate from Supabase, so the existing Supabase customer accounts, bookings, payment history and other records have not been copied; migrate and reconcile those records before switching customers to the PHP site. Supabase passwords cannot be copied as plaintext, so customer password resets may be required. Keep the Supabase site available until the record migration and final hosting checks are complete.

## Rubric architecture

| Requirement | PHP evidence |
| --- | --- |
| JSON | `public/api.php` returns JSON envelopes; the browser serializes form data and renders API responses. |
| AJAX | `public/assets/app.js` uses `fetch` for account access, availability, bookings, payments, inspections, notifications, inventory, expenses and AI. |
| PHP | `app/` and `public/api.php` implement routing, sessions, validation, pricing, role/ownership checks and transactions. |
| Database | `database/schema.sql` defines users, packages, bookings, schedule locks, payments, changes, inspections, notifications, inventory, expenses and audit records. |
| UI/security | Responsive semantic HTML/CSS, CSRF checks, prepared statements, password hashing, session renewal, validation, escaped HTML, ownership checks and admin role checks. |
