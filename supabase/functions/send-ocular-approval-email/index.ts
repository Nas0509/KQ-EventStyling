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

function htmlEscape(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] || character);
}

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

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
    const loginUrl = Deno.env.get("SITE_LOGIN_URL") || "https://nas0509.github.io/KQ-EventStyling/login.html";
    if (!authorization?.startsWith("Bearer ")) return jsonResponse({ error: "Please sign in as an administrator." }, 401);
    if (!supabaseUrl || !supabaseKey) return jsonResponse({ error: "Email notifications are not configured yet." }, 503);
    if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken || !gmailSender) {
      return jsonResponse({ error: "Gmail is not configured. Add the Gmail OAuth secrets to Supabase." }, 503);
    }

    const body = await request.json();
    const requestId = typeof body?.requestId === "string" ? body.requestId.trim() : "";
    if (!requestId || requestId.length > 100) return jsonResponse({ error: "Invalid ocular request reference." }, 400);

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

    const { data: ocularRequest, error: requestError } = await supabase
      .from("ocular_inspection_requests")
      .select("id,status,customer_name,customer_email,inspection_date,inspection_time,venue_name,inspection_address")
      .eq("id", requestId)
      .single();
    if (requestError || !ocularRequest) return jsonResponse({ error: "The ocular inspection request could not be found." }, 404);
    const status = String(ocularRequest.status || "").toUpperCase();
    if (!["APPROVED", "DECLINED"].includes(status)) {
      return jsonResponse({ error: "Only approved or declined ocular inspection requests can receive this email." }, 409);
    }

    const recipient = plainText(ocularRequest.customer_email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return jsonResponse({ error: "This request does not have a valid customer email address." }, 400);
    }
    const name = plainText(ocularRequest.customer_name) || "there";
    const date = plainText(ocularRequest.inspection_date) || "your selected date";
    const time = plainText(ocularRequest.inspection_time);
    const venue = plainText(ocularRequest.venue_name);
    const address = plainText(ocularRequest.inspection_address);
    const approved = status === "APPROVED";
    const outcome = approved ? "approved" : "declined";
    const text = [
      `Hi ${name},`,
      "",
      approved
        ? "Your ocular inspection request has been approved by KQ Event Styling."
        : "Your ocular inspection request has been declined by KQ Event Styling.",
      `Preferred date: ${date}`,
      time ? `Preferred time: ${time}` : "",
      venue ? `Venue: ${venue}` : "",
      address ? `Address: ${address}` : "",
      loginUrl ? `View your request: ${loginUrl}` : "",
      "",
      approved
        ? "For questions or next steps, contact us at 0961 137 0355 or kqeventstyling@gmail.com."
        : "If you have questions about this decision, contact us at 0961 137 0355 or kqeventstyling@gmail.com.",
      "",
      "Thank you,",
      "KQ Event Styling Team",
    ].filter(Boolean).join("\n");
    const safeName = htmlEscape(name);
    const safeDate = htmlEscape(date);
    const safeTime = htmlEscape(time);
    const safeVenue = htmlEscape(venue);
    const safeAddress = htmlEscape(address);
    const safeLoginUrl = loginUrl ? htmlEscape(loginUrl) : "";
    const badge = approved
      ? "background:#e9f7ee;color:#217647"
      : "background:#fff1ee;color:#a33c31";
    const heading = approved ? "Your ocular inspection is approved" : "Your ocular inspection request was declined";
    const resultMessage = approved
      ? "Your ocular inspection request has been approved by KQ Event Styling."
      : "Your ocular inspection request has been declined by KQ Event Styling.";
    const supportMessage = approved
      ? "For questions or next steps, contact us at"
      : "If you have questions about this decision, contact us at";
    const html = `<!doctype html><html><body style="margin:0;padding:28px 12px;background:#f2f6f8;font-family:Arial,Helvetica,sans-serif;color:#263844"><table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e0e8ec;border-radius:14px;overflow:hidden"><tr><td style="padding:24px 32px;background:#173b4b;color:#fff"><strong style="letter-spacing:2px;color:#bfe4ee">KQ EVENT STYLING</strong><div style="margin-top:6px;color:#d8e6eb">OCULAR INSPECTION UPDATE</div></td></tr><tr><td style="padding:32px"><div style="display:inline-block;padding:6px 11px;border-radius:20px;${badge};font-size:12px;font-weight:bold">REQUEST ${outcome.toUpperCase()}</div><h1 style="margin:18px 0 12px;color:#193747">${heading}</h1><p style="font-size:16px;line-height:1.65">Hi ${safeName},<br>${resultMessage}</p><div style="padding:16px;background:#f7fafb;border:1px solid #e4ecef;border-radius:9px"><strong>Date:</strong> ${safeDate}${safeTime ? `<br><strong>Time:</strong> ${safeTime}` : ""}${safeVenue ? `<br><strong>Venue:</strong> ${safeVenue}` : ""}${safeAddress ? `<br><strong>Address:</strong> ${safeAddress}` : ""}</div>${safeLoginUrl ? `<p style="margin:22px 0;text-align:center"><a href="${safeLoginUrl}" style="display:inline-block;padding:13px 22px;border-radius:7px;background:#1688b4;color:#fff;text-decoration:none;font-weight:bold">View your request</a></p>` : ""}<p style="margin-top:22px;font-size:14px;line-height:1.65;color:#536872">${supportMessage} <a href="tel:+639611370355">0961 137 0355</a> or <a href="mailto:kqeventstyling@gmail.com">kqeventstyling@gmail.com</a>.</p><p>Thank you,<br><strong>KQ Event Styling Team</strong></p></td></tr></table></body></html>`;

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
      return jsonResponse({ error: "Gmail authorization failed. Check the Gmail OAuth secrets." }, 502);
    }

    const boundary = `kq_alt_${crypto.randomUUID().replace(/-/g, "")}`;
    const mime = [
      `From: KQ Event Styling <${plainText(gmailSender)}>`,
      `To: ${recipient}`,
      `Subject: Your KQ Event Styling ocular inspection request was ${outcome}`,
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
    const emailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenResult.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: base64Url(new TextEncoder().encode(mime)) }),
    });
    if (!emailResponse.ok) {
      const providerError = await emailResponse.json().catch(() => ({}));
      return jsonResponse({ error: plainText(providerError?.error?.message) || "Gmail could not send the email." }, 502);
    }
    return jsonResponse({ sent: true });
  } catch (error) {
    console.error("Ocular inspection status email could not be sent.", error);
    const detail = plainText(error instanceof Error ? error.message : error).slice(0, 240);
    return jsonResponse({ error: detail
      ? `The ocular inspection status email could not be sent: ${detail}`
      : "The ocular inspection status email could not be sent. Check the function logs." }, 500);
  }
});
