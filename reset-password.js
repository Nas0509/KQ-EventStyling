const form = document.getElementById("resetForm");
const message = document.getElementById("resetMessage");
const passwordInput = document.getElementById("newPassword");
const confirmInput = document.getElementById("confirmPassword");
let recoverySessionReady = false;

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `message ${type}`;
}

function showResetForm() {
    recoverySessionReady = true;
    form.hidden = false;
    message.textContent = "";
    message.className = "message";
}

window.supabaseClient?.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" && session) showResetForm();
});

(async () => {
    if (!window.supabaseClient) {
        showMessage("Password reset is temporarily unavailable. Please try again later.");
        return;
    }

    try {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (error) throw error;
        if (session) showResetForm();
        else showMessage("This password reset link is invalid or has expired. Request a new link and try again.");
    } catch (error) {
        console.error("Could not validate password reset link:", error);
        showMessage("This password reset link is invalid or has expired. Request a new link and try again.");
    }
})();

form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!recoverySessionReady) {
        showMessage("Open the password reset link from your email first.");
        return;
    }

    const password = passwordInput.value;
    const confirmation = confirmInput.value;
    const meetsRules = password.length >= 8
        && /[A-Z]/.test(password)
        && /[a-z]/.test(password)
        && /[0-9]/.test(password)
        && /[^A-Za-z0-9]/.test(password);

    if (!meetsRules) {
        showMessage("Use at least 8 characters, including uppercase and lowercase letters, a number, and a symbol.");
        return;
    }
    if (password !== confirmation) {
        showMessage("The passwords do not match.");
        return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Saving…";

    try {
        const { error } = await window.supabaseClient.auth.updateUser({ password });
        if (error) throw error;
        await window.supabaseClient.auth.signOut({ scope: "local" });
        showMessage("Your password has been reset. You can now sign in with your new password.", "success");
        form.hidden = true;
    } catch (error) {
        console.error("Password update failed:", error);
        showMessage(error?.message || "We couldn't update your password. Request a new reset link and try again.");
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
});
