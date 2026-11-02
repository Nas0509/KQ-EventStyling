# Render PHP school project

This deploys the KQ Event Styling PHP app as a Docker web service on Render's Free plan. The service sleeps after 15 minutes without traffic and may take about a minute to wake.

## Persistent database setup

The PHP app supports the existing Supabase PostgreSQL project using a private Render environment variable. It creates its own `kq_php` schema and does not modify the existing Supabase tables. The original Supabase Auth accounts and records are not automatically shared with PHP; PHP customers need to sign up on the PHP site unless records are deliberately migrated.

1. In Render, create/update the Blueprint from this repository and select branch `codex/render-free-demo`. Confirm the service uses the Free plan.
2. In Supabase, open **Project Settings → Database → Connection string**, choose **Session pooler**, and copy the URI.
3. In Render service **Environment**, add `KQ_DATABASE_URL` and paste the URI as its value. Keep it private. Never put the URI in GitHub or send it in chat.
4. Set `KQ_ADMIN_EMAIL` and a new unique `KQ_ADMIN_PASSWORD` in Render's private environment settings. Use a new password that was not exposed in a screenshot.
5. Save changes and deploy. The service installs the tables in the separate `kq_php` schema and creates the administrator if none exists.
6. After the deployment shows **Live**, open the site, create a customer account, sign in, and try a sample booking and admin review.

## Free-plan limitations

- Render's free web service has temporary local files. The database is stored in Supabase, but PHP sessions and uploaded design-estimate images may be lost on restart.
- Supabase Free may pause after a week of low activity. Its data is kept while paused, but the project must be restored to resume the app.
- Render Free blocks outbound SMTP ports, so password-reset email needs an HTTPS email service integration before that feature can send mail.
- The KQ AI features need their optional API keys.
- This is suitable for a class project demonstration, not live customer/business records without stronger hosting, backups, and verified email delivery.
