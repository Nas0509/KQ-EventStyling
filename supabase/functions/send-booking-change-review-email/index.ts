import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function plainText(value: unknown) { return String(value ?? "").replace(/[\r\n\t]+/g, " ").trim(); }
function htmlEscape(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}
function encodeBase64(value: string) { return btoa(unescape(encodeURIComponent(value))); }
function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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
    const configuredLoginUrl = Deno.env.get("SITE_LOGIN_URL") || "https://nas0509.github.io/KQ-EventStyling/login.html";
    if (!authorization?.startsWith("Bearer ")) return jsonResponse({ error: "Please sign in as an administrator." }, 401);
    if (!supabaseUrl || !supabaseKey) return jsonResponse({ error: "Email notifications are not configured yet." }, 503);
    if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken || !gmailSender) return jsonResponse({ error: "Gmail is not configured in Supabase secrets." }, 503);
    let loginUrl: URL | null = null;
    if (configuredLoginUrl) {
      try { loginUrl = new URL(configuredLoginUrl); if (loginUrl.protocol !== "https:") throw new Error("HTTPS required"); }
      catch { return jsonResponse({ error: "SITE_LOGIN_URL must be a full HTTPS login page URL in Supabase secrets." }, 503); }
    }
    const body = await request.json();
    const requestId = typeof body?.requestId === "string" ? body.requestId.trim() : "";
    if (!requestId || requestId.length > 100) return jsonResponse({ error: "Invalid request reference." }, 400);
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResponse({ error: "Your session has expired. Please sign in again." }, 401);
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profileError || profile?.role !== "admin") return jsonResponse({ error: "Administrator access is required." }, 403);

    const { data: changeRequest, error: requestError } = await supabase
      .from("booking_change_requests")
      .select("id,booking_id,user_id,request_type,reason,requested_event_date,requested_start_time,requested_time_slot,status,reservation_fee_nonrefundable,admin_note")
      .eq("id", requestId)
      .single();
    if (requestError || !changeRequest) return jsonResponse({ error: "The customer request could not be found." }, 404);
    if (!["ACCEPTED", "REJECTED"].includes(String(changeRequest.status).toUpperCase())) return jsonResponse({ error: "This request has not been reviewed yet." }, 409);
    const { data: booking, error: bookingError } = await supabase.from("bookings")
      .select("id,user_id,full_name,email,event_type,event_date,start_time,time_slot")
      .eq("id", changeRequest.booking_id).single();
    if (bookingError || !booking) return jsonResponse({ error: "The related booking could not be found." }, 404);
    const requestUserId = String(changeRequest.user_id || "");
    if (!requestUserId) return jsonResponse({ error: "The request does not have a linked customer account." }, 400);
    // The request owner is authoritative. Some older booking rows may have a
    // different or missing user_id, so never send to that row's email in that case.
    const bookingOwnerMatchesRequest = String(booking.user_id || "") === requestUserId;
    let recipient = bookingOwnerMatchesRequest ? plainText(booking.email) : "";
    if (!recipient) {
      // Older bookings may not have copied the account email into the booking row.
      // Look it up on the customer's profile, then fall back to the Auth account.
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (serviceRoleKey) {
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: customerProfile } = await adminClient.from("profiles")
          .select("email").eq("id", requestUserId).maybeSingle();
        recipient = plainText(customerProfile?.email);
        if (!recipient) {
          const { data: authUser } = await adminClient.auth.admin.getUserById(requestUserId);
          recipient = plainText(authUser?.user?.email);
        }
      } else {
        const { data: customerProfile } = await supabase.from("profiles")
          .select("email").eq("id", requestUserId).maybeSingle();
        recipient = plainText(customerProfile?.email);
      }
    }
    if (!recipient) return jsonResponse({ error: "No email address was found on the booking or customer account." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return jsonResponse({ error: "The customer email address is invalid." }, 400);

    const accepted = String(changeRequest.status).toUpperCase() === "ACCEPTED";
    const cancellation = String(changeRequest.request_type).toUpperCase() === "CANCELLATION";
    const outcome = accepted ? "approved" : "declined";
    const kind = cancellation ? "cancellation" : "reschedule";
    const name = plainText(booking.full_name) || "there";
    const eventType = plainText(booking.event_type) || "event";
    const originalDate = plainText(booking.event_date) || "your scheduled date";
    const newDate = plainText(changeRequest.requested_event_date) || "";
    const requestedTime = [plainText(changeRequest.requested_time_slot), plainText(changeRequest.requested_start_time)].filter(Boolean).join(" ");
    let resultLine: string;
    if (cancellation) resultLine = accepted
      ? `Your cancellation request for your ${eventType} booking on ${originalDate} has been approved. The booking is cancelled.`
      : `Your cancellation request for your ${eventType} booking on ${originalDate} has been declined. Your booking remains active.`;
    else resultLine = accepted
      ? `Your reschedule request has been approved. Your ${eventType} booking is now scheduled for ${newDate}${requestedTime ? ` at ${requestedTime}` : ""}.`
      : `Your reschedule request has been declined. Your original ${eventType} booking date remains ${originalDate}.`;
    if (changeRequest.reservation_fee_nonrefundable) resultLine += " Your reservation fee is non-refundable.";
    const adminNote = plainText(changeRequest.admin_note);
    const safeName = htmlEscape(name);
    const safeResult = htmlEscape(resultLine);
    const safeNote = htmlEscape(adminNote);
    const safeLoginUrl = loginUrl ? htmlEscape(loginUrl.toString()) : "";
    const text = [`Hi ${name},`, "", resultLine, adminNote ? `Admin note: ${adminNote}` : "", "", loginUrl ? `View your booking history or sign in: ${loginUrl.toString()}` : "", "", "For questions, contact KQ Event Styling at 0961 137 0355 or kqeventstyling@gmail.com.", "", "Thank you,", "KQ Event Styling Team"].filter(Boolean).join("\n");
    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f2f6f8;font-family:Arial,Helvetica,sans-serif;color:#263844"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f6f8;padding:28px 12px"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e0e8ec;border-radius:14px;overflow:hidden"><tr><td style="padding:24px 32px;background:#173b4b;color:#fff"><div style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#bfe4ee">KQ EVENT STYLING</div><div style="margin-top:5px;font-size:13px;color:#d8e6eb">BOOKING REQUEST UPDATE</div></td></tr><tr><td style="padding:32px"><div style="display:inline-block;padding:6px 11px;border-radius:20px;background:${accepted ? "#e9f7ee;color:#217647" : "#fff1ee;color:#a33c31"};font-size:12px;font-weight:bold;letter-spacing:.6px">${cancellation ? "CANCELLATION" : "RESCHEDULE"} ${accepted ? "APPROVED" : "DECLINED"}</div><h1 style="margin:18px 0 12px;font-size:24px;line-height:1.25;color:#193747">Your ${kind} request was ${outcome}</h1><p style="margin:0 0 18px;font-size:16px;line-height:1.65">Hi ${safeName},<br>${safeResult}</p>${adminNote ? `<div style="margin:20px 0;padding:16px 18px;background:#f5f9fb;border:1px solid #e1eaee;border-radius:9px"><div style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#778992">ADMIN NOTE</div><div style="margin-top:7px;font-size:15px;line-height:1.6;color:#344c58">${safeNote}</div></div>` : ""}${loginUrl ? `<p style="margin:22px 0;text-align:center"><a href="${safeLoginUrl}" style="display:inline-block;padding:13px 22px;border-radius:7px;background:#1688b4;color:#fff;text-decoration:none;font-size:15px;font-weight:bold">Log in to view your booking</a></p>` : ""}<p style="margin:20px 0 0;font-size:14px;line-height:1.65;color:#536872">For questions, contact us at <a href="tel:+639611370355" style="color:#147da5">0961 137 0355</a> or <a href="mailto:kqeventstyling@gmail.com" style="color:#147da5">kqeventstyling@gmail.com</a>.</p><p style="margin:22px 0 0;font-size:14px;line-height:1.6">Thank you,<br><strong>KQ Event Styling Team</strong></p></td></tr><tr><td style="padding:15px 32px;border-top:1px solid #e8eef1;background:#fbfcfd;color:#89969d;font-size:11px;line-height:1.5">This is an automated booking update from KQ Event Styling.</td></tr></table></td></tr></table></body></html>`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: gmailClientId, client_secret: gmailClientSecret, refresh_token: gmailRefreshToken, grant_type: "refresh_token" }),
    });
    const tokenResult = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenResult?.access_token) return jsonResponse({ error: "Gmail authorization failed. Check the OAuth client and refresh token secrets." }, 502);
    const boundary = `kq_alt_${crypto.randomUUID().replace(/-/g, "")}`;
    const subject = `Your KQ Event Styling ${kind} request was ${outcome}`;
    const mime = [`From: KQ Event Styling <${plainText(gmailSender)}>`, `To: ${recipient}`, `Subject: ${subject}`, "MIME-Version: 1.0", `Content-Type: multipart/alternative; boundary="${boundary}"`, "", `--${boundary}`, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", encodeBase64(text), `--${boundary}`, "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64", "", encodeBase64(html), `--${boundary}--`].join("\r\n");
    const emailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST", headers: { Authorization: `Bearer ${tokenResult.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: base64Url(new TextEncoder().encode(mime)) }),
    });
    if (!emailResponse.ok) {
      const providerError = await emailResponse.json().catch(() => ({}));
      const detail = plainText(providerError?.error?.message).slice(0, 200);
      return jsonResponse({ error: detail ? `Gmail could not send the email: ${detail}` : "Gmail could not send the email. Check Gmail API access and OAuth authorization." }, 502);
    }
    return jsonResponse({ sent: true });
  } catch (error) {
    console.error("Booking change review email could not be completed.", error);
    return jsonResponse({ error: "The request was reviewed, but its email could not be sent." }, 500);
  }
});
