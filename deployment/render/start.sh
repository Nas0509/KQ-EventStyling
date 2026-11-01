#!/usr/bin/env bash
set -euo pipefail

export KQ_PRIVATE_DIR="${KQ_PRIVATE_DIR:-/tmp/kqstyling}"
export KQ_DB_PATH="$KQ_PRIVATE_DIR/kq.sqlite"
mkdir -p "$KQ_PRIVATE_DIR/sessions" "$KQ_PRIVATE_DIR/uploads"

php bin/init-db.php

admin_count="$(php -r 'require "app/Database.php"; $db=Database::connect(); $check=$db->prepare("SELECT count(*) FROM users WHERE role=?"); $check->execute(["admin"]); echo $check->fetchColumn();')"
if [[ "$admin_count" == "0" && -n "${KQ_ADMIN_EMAIL:-}" && -n "${KQ_ADMIN_PASSWORD:-}" ]]; then
    php bin/create-admin.php
fi

# Keep the one-time provisioning credentials out of the web server environment.
unset KQ_ADMIN_EMAIL KQ_ADMIN_PASSWORD

exec php -S "0.0.0.0:${PORT:-10000}" -t public
