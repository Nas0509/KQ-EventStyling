console.log("🔥 SUPABASE-CONFIG.JS IS LOADING");

const KQ_REMEMBER_ME_KEY = "kqRememberMe";
const kqAuthStorage = {
    getItem(key) {
        const rememberPreference = localStorage.getItem(KQ_REMEMBER_ME_KEY);
        const storage = rememberPreference === "false" ? sessionStorage : localStorage;
        return storage.getItem(key);
    },
    setItem(key, value) {
        const rememberMe = localStorage.getItem(KQ_REMEMBER_ME_KEY) === "true";
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        storage.setItem(key, value);
        otherStorage.removeItem(key);
    },
    removeItem(key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    }
};

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
                storage: kqAuthStorage,
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );

console.log("SUPABASE CONFIG LOADED");
