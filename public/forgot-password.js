const form = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("forgotMessage");
const submitButton = form?.querySelector('button[type="submit"]');

form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!window.supabaseClient) {
        message.textContent = "Password recovery is temporarily unavailable. Please try again later.";
        message.className = "message error";
        return;
    }

    const email = emailInput.value.trim();
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    message.textContent = "";
    message.className = "message";

    try {
        const redirectTo = new URL("reset-password.html", window.location.href).toString();
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;

        message.textContent = "If an account exists with this email, password reset instructions will be sent. Check your inbox and spam folder.";
        message.className = "message success";
        form.reset();
    } catch (error) {
        console.error("Password reset request failed:", error);
        message.textContent = error?.message || "We couldn't send the reset email right now. Please try again later.";
        message.className = "message error";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});
