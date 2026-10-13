console.log("🔥 SUPABASE-CONFIG.JS IS LOADING");

const SUPABASE_URL =
    "https://byllwuyybldobxiixzvx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ULtApFtBxPKoB9WxfCDC0w_H-7fBFQQ";

window.supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );

console.log("SUPABASE CONFIG LOADED");