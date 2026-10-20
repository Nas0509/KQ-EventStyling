import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function plainText(value: unknown) {
  return String(value ?? "").replace(/[\r\n\t]+/g, " ").trim();
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function htmlEscape(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] || character);
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    const gmailClientId = Deno.env.get("GMAIL_CLIENT_ID");
    const gmailClientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
    const gmailRefreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");
    const gmailSender = Deno.env.get("GMAIL_SENDER_EMAIL");
    const configuredLoginUrl = Deno.env.get("SITE_LOGIN_URL");
    if (!authorization?.startsWith("Bearer ")) return jsonResponse({ error: "Please sign in as an administrator." }, 401);
    if (!supabaseUrl || !supabaseKey) return jsonResponse({ error: "Email notifications are not configured yet." }, 503);
    if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken || !gmailSender) {
      return jsonResponse({ error: "Gmail is not configured. Add GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_SENDER_EMAIL to Supabase secrets." }, 503);
    }
    let loginUrl: URL | null = null;
    if (configuredLoginUrl) {
      try {
        loginUrl = new URL(configuredLoginUrl);
        if (loginUrl.protocol !== "https:") throw new Error("HTTPS is required");
      } catch {
        return jsonResponse({ error: "SITE_LOGIN_URL must be a full HTTPS login page URL in Supabase secrets." }, 503);
      }
    }

    const body = await request.json();
    const bookingId = typeof body?.bookingId === "string" ? body.bookingId.trim() : "";
    if (!bookingId || bookingId.length > 100) return jsonResponse({ error: "Invalid booking reference." }, 400);

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResponse({ error: "Your session has expired. Please sign in again." }, 401);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError || profile?.role !== "admin") return jsonResponse({ error: "Administrator access is required." }, 403);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id,status,user_id,full_name,email,event_type,event_date,start_time,time_slot")
      .eq("id", bookingId)
      .single();
    if (bookingError || !booking) return jsonResponse({ error: "The booking could not be found." }, 404);
    if (String(booking.status).toUpperCase() !== "APPROVED") return jsonResponse({ error: "Only approved bookings can receive this email." }, 409);
    if (!booking.email || !booking.user_id) return jsonResponse({ error: "This booking does not have a customer account email." }, 400);
    const recipient = plainText(booking.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return jsonResponse({ error: "The customer email address is invalid." }, 400);

    const name = plainText(booking.full_name) || "there";
    const eventType = plainText(booking.event_type) || "event";
    const eventDate = plainText(booking.event_date) || "your selected date";
    const time = [plainText(booking.time_slot), plainText(booking.start_time)].filter(Boolean).join(" ");
    const safeName = htmlEscape(name);
    const safeEventType = htmlEscape(eventType);
    const safeEventDate = htmlEscape(eventDate);
    const safeTime = htmlEscape(time);
    const safeLoginUrl = loginUrl ? htmlEscape(loginUrl.toString()) : "";
    const text = [
      `Hi ${name},`,
      "",
      `Good news! Your ${eventType} booking request for ${eventDate} has been approved by KQ Event Styling.`,
      time ? `Preferred event time: ${time}` : "",
      "",
      ...(loginUrl ? [`View your booking or sign in to your account: ${loginUrl.toString()}`] : []),
      "",
      "For questions or next steps, contact KQ Event Styling at 0961 137 0355 or kqeventstyling@gmail.com.",
      "",
      "Thank you for choosing us,",
      "KQ Event Styling Team",
    ].filter(Boolean).join("\n");
    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f2f6f8;font-family:Arial,Helvetica,sans-serif;color:#263844"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f6f8;padding:28px 12px"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e0e8ec;border-radius:14px;overflow:hidden"><tr><td style="padding:24px 32px;background:#173b4b;color:#fff"><div style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#bfe4ee">KQ EVENT STYLING</div><div style="margin-top:5px;font-size:13px;color:#d8e6eb">BOOKING CONFIRMATION</div></td></tr><tr><td style="padding:32px"><div style="display:inline-block;padding:6px 11px;border-radius:20px;background:#e9f7ee;color:#217647;font-size:12px;font-weight:bold;letter-spacing:.6px">BOOKING APPROVED</div><h1 style="margin:18px 0 12px;font-size:25px;line-height:1.25;color:#193747">Your event booking is confirmed</h1><p style="margin:0 0 18px;font-size:16px;line-height:1.65">Hi ${safeName},<br>Good news! Your <strong>${safeEventType}</strong> booking request has been approved by KQ Event Styling.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;background:#f7fafb;border:1px solid #e4ecef;border-radius:9px"><tr><td style="padding:15px 17px"><div style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#778992">EVENT DATE</div><div style="margin-top:5px;font-size:16px;font-weight:bold;color:#263f4c">${safeEventDate}</div>${time ? `<div style="margin-top:11px;font-size:11px;font-weight:bold;letter-spacing:1px;color:#778992">PREFERRED TIME</div><div style="margin-top:5px;font-size:15px;color:#263f4c">${safeTime}</div>` : ""}</td></tr></table>${loginUrl ? `<p style="margin:22px 0;text-align:center"><a href="${safeLoginUrl}" style="display:inline-block;padding:13px 22px;border-radius:7px;background:#1688b4;color:#fff;text-decoration:none;font-size:15px;font-weight:bold">Log in to view your booking</a></p>` : ""}<p style="margin:20px 0 0;font-size:14px;line-height:1.65;color:#536872">For questions or next steps, contact us at <a href="tel:+639611370355" style="color:#147da5">0961 137 0355</a> or <a href="mailto:kqeventstyling@gmail.com" style="color:#147da5">kqeventstyling@gmail.com</a>.</p><p style="margin:22px 0 0;font-size:14px;line-height:1.6">Thank you for choosing us,<br><strong>KQ Event Styling Team</strong></p></td></tr><tr><td style="padding:15px 32px;border-top:1px solid #e8eef1;background:#fbfcfd;color:#89969d;font-size:11px;line-height:1.5">This is an automated booking update from KQ Event Styling. Please keep this email for your records.</td></tr></table></td></tr></table></body></html>`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: gmailClientId,
        client_secret: gmailClientSecret,
        refresh_token: gmailRefreshToken,
        grant_type: "refresh_token",
      }),
    });
    const tokenResult = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenResult?.access_token) {
      const detail = plainText(tokenResult?.error_description || tokenResult?.error).slice(0, 240);
      console.error("Gmail OAuth token request failed", tokenResponse.status, detail || "No provider details");
      return jsonResponse({ error: detail
        ? `Gmail authorization failed (${tokenResponse.status}): ${detail}`
        : `Gmail authorization failed (${tokenResponse.status}). Check the OAuth client and refresh token secrets.` }, 502);
    }

    const boundary = `kq_alt_${crypto.randomUUID().replace(/-/g, "")}`;
    const mime = [
      `From: KQ Event Styling <${plainText(gmailSender)}>`,
      `To: ${recipient}`,
      "Subject: Your KQ Event Styling booking is approved",
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      encodeBase64(text),
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      encodeBase64(html),
      `--${boundary}--`,
    ].join("\r\n");
    const raw = base64Url(new TextEncoder().encode(mime));
    const emailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenResult.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });
    if (!emailResponse.ok) {
      const providerError = await emailResponse.json().catch(() => ({}));
      const detail = plainText(providerError?.error?.message || providerError?.error_description).slice(0, 240);
      console.error("Gmail send request failed", emailResponse.status, detail || "No provider details");
      const message = detail
        ? `Gmail could not send the email (${emailResponse.status}): ${detail}`
        : `Gmail could not send the email (${emailResponse.status}). Check Gmail API access and OAuth authorization.`;
      return jsonResponse({ error: message }, 502);
    }
    return jsonResponse({ sent: true });
  } catch (error) {
    console.error("Booking approval email could not be completed.", error);
    return jsonResponse({ error: "The booking was approved, but its email could not be sent." }, 500);
  }
});
