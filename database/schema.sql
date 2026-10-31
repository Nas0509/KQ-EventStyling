PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS packages (
 id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, price_cents INTEGER NOT NULL CHECK(price_cents > 0),
 full_day INTEGER NOT NULL DEFAULT 0 CHECK(full_day IN (0,1))
);
INSERT OR IGNORE INTO packages VALUES
 (1,'Simple Styling',650000,0),(2,'Package A',790000,0),(3,'Package B',1550000,0),
 (4,'Package C',1950000,1),(5,'Package D',2950000,1),(6,'Package E',3500000,1);
CREATE TABLE IF NOT EXISTS bookings (
 id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
 package_id INTEGER NOT NULL REFERENCES packages(id), event_date TEXT NOT NULL,
 slot TEXT NOT NULL CHECK(slot IN ('MORNING','AFTERNOON','NIGHT')),
 venue TEXT NOT NULL, phone TEXT NOT NULL, guests INTEGER NOT NULL CHECK(guests BETWEEN 1 AND 5000),
 distance_km INTEGER NOT NULL CHECK(distance_km BETWEEN 0 AND 1000), notes TEXT NOT NULL DEFAULT '',
 total_cents INTEGER NOT NULL CHECK(total_cents > 0), deposit_cents INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','cancelled','completed')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS bookings_owner ON bookings(user_id,created_at);
CREATE INDEX IF NOT EXISTS bookings_schedule ON bookings(event_date,status);
CREATE TABLE IF NOT EXISTS schedule_locks (
 event_date TEXT NOT NULL, slot TEXT NOT NULL, booking_id INTEGER NOT NULL REFERENCES bookings(id),
 PRIMARY KEY(event_date,slot)
);
CREATE TABLE IF NOT EXISTS payments (
 id INTEGER PRIMARY KEY, booking_id INTEGER NOT NULL REFERENCES bookings(id),
 reference TEXT NOT NULL UNIQUE, amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS change_requests (
 id INTEGER PRIMARY KEY, booking_id INTEGER NOT NULL REFERENCES bookings(id),
 type TEXT NOT NULL CHECK(type IN ('cancel','reschedule')), reason TEXT NOT NULL,
 event_date TEXT, slot TEXT, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS one_pending_change ON change_requests(booking_id) WHERE status='pending';
CREATE TABLE IF NOT EXISTS inventory (
 id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, quantity INTEGER NOT NULL CHECK(quantity >= 0),
 unit TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS expenses (
 id INTEGER PRIMARY KEY, description TEXT NOT NULL, amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
 expense_date TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_log (
 id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), action TEXT NOT NULL,
 details_json TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS login_attempts (
 attempt_key TEXT PRIMARY KEY, failures INTEGER NOT NULL, last_attempt INTEGER NOT NULL
);
