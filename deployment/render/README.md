# Render free PHP demo

This deploys KQ Event Styling as a PHP Docker web service for a school presentation. Render supports PHP through Docker. The service is configured on the free plan and does not require adding a payment method, but free services sleep after 15 minutes without traffic and start again on the next visit.

## Important data limitation

Render's free web service has an ephemeral filesystem. This project stores its SQLite database, sessions, and image uploads in `/tmp/kqstyling`, so **all demo accounts, bookings, sessions, and uploads reset whenever Render spins down, restarts, or redeploys the service**. The startup script recreates the schema and administrator from private environment settings. Only use fake presentation data. This is not suitable for actual customers or business bookings.

Render's free service also blocks outbound email ports (25, 465, 587), so password-reset emails will not send from this deployment. AI features need their API secrets and remain unavailable without them.

## Setup

1. Push this project to a GitHub repository that Render can read. Do not add `var/`, `.env` files, CSV exports, credentials, or local SQLite databases. The `.gitignore` excludes these local files.
2. In Render, choose **New → Blueprint**, connect the repository, and select the `render.yaml` file. Confirm `kq-event-styling-demo` is on the **Free** plan. Do not choose a paid plan or add a payment method.
3. When prompted for the environment values, set `KQ_ADMIN_EMAIL` to the admin email and `KQ_ADMIN_PASSWORD` to a unique password with 12+ characters, uppercase and lowercase letters, and a number. Enter the values in Render's private settings only; never put them in GitHub or this file.
4. Start the deployment. Render builds the Docker image, runs `bin/init-db.php`, creates the first admin from the private settings, and starts the PHP site. The startup script removes those credentials from the environment passed to the website.
5. Open the public `onrender.com` URL, sign in, create a fake customer account, and make a sample booking. If it has been idle, the first visit may take about a minute while Render wakes it.

## Demonstration caveats

- After an idle sleep, restart, or new deploy, start again with an empty database and sign in again. Any sample records you entered are gone.
- On the free tier, outbound SMTP ports are blocked, so the forgot-password email workflow cannot be demonstrated.
- For a live business system with persistent records, use hosting with a persistent database/storage and working email. Render's free instance is a temporary class demo only.
