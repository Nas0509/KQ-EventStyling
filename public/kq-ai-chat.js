(() => {
    const launcher = document.getElementById("kqAiLauncher");
    const panel = document.getElementById("kqAiPanel");
    const closeButton = document.getElementById("kqAiClose");
    const newChatButton = document.getElementById("kqAiNewChat");
    const form = document.getElementById("kqAiForm");
    const input = document.getElementById("kqAiInput");
    const sendButton = document.getElementById("kqAiSend");
    const messagesElement = document.getElementById("kqAiMessages");
    if (!launcher || !panel || !form || !input || !messagesElement) return;

    const conversation = [];
    let isSending = false;
    const welcomeMessage = "Hi! I’m KQ AI. I can help with packages, event styling, booking and payment steps, ocular inspections, and cancellation or reschedule requests. What would you like to know?";

    function setOpen(open) {
        panel.hidden = !open;
        panel.setAttribute("aria-hidden", String(!open));
        launcher.setAttribute("aria-expanded", String(open));
        if (open) input.focus();
    }

    function addMessage(text, role, extraClass = "") {
        const message = document.createElement("div");
        message.className = `kq-ai-message kq-ai-message-${role}${extraClass ? ` ${extraClass}` : ""}`;
        message.textContent = text;
        messagesElement.appendChild(message);
        messagesElement.scrollTop = messagesElement.scrollHeight;
        return message;
    }

    function resetChat() {
        conversation.length = 0;
        messagesElement.replaceChildren();
        addMessage(welcomeMessage, "assistant");
        input.value = "";
        input.focus();
    }

    launcher.addEventListener("click", () => setOpen(panel.hidden));
    closeButton?.addEventListener("click", () => setOpen(false));
    newChatButton?.addEventListener("click", resetChat);
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !panel.hidden) setOpen(false);
    });

    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });
    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text || isSending) return;

        const supabase = window.supabaseClient;
        if (!supabase?.functions?.invoke) {
            addMessage("KQ AI is not connected yet. Please try again later or contact KQ Event Styling.", "assistant", "kq-ai-message-error");
            return;
        }

        isSending = true;
        sendButton.disabled = true;
        input.disabled = true;
        input.value = "";
        input.style.height = "auto";
        conversation.push({ role: "user", content: text });
        addMessage(text, "user");
        const typing = addMessage("KQ AI is thinking…", "assistant", "kq-ai-typing");

        try {
            // Assistant replies may be longer than the customer's 1,200-character
            // input limit. Keep a bounded recent context and shorten old replies
            // only in the request payload so they cannot trigger input validation.
            const recentMessages = conversation.slice(-8).map(message => ({
                ...message,
                content: message.role === "assistant" && message.content.length > 1200
                    ? `${message.content.slice(0, 1197)}...`
                    : message.content,
            }));
            const { data, error } = await supabase.functions.invoke("kq-ai-chat", {
                body: { messages: recentMessages }
            });
            typing.remove();
            if (error) {
                const status = error.context?.status;
                if (status === 401) throw new Error("Please sign in to use KQ AI, then try again.");
                let message = data?.error;
                // Supabase puts non-2xx response details on error.context; `data` is often null.
                if (!message && typeof error.context?.clone === "function") {
                    try {
                        const body = await error.context.clone().json();
                        if (typeof body?.error === "string") message = body.error;
                    } catch { /* Use the fallback below for non-JSON or network errors. */ }
                }
                throw new Error(message || "KQ AI could not reply right now. Please try again in a moment.");
            }
            if (typeof data?.reply !== "string" || !data.reply.trim()) {
                throw new Error(data?.error || "KQ AI returned an empty reply. Please try again.");
            }
            conversation.push({ role: "assistant", content: data.reply });
            addMessage(data.reply, "assistant");
        } catch (error) {
            typing.remove();
            // Keep failed messages out of the next request so the user may retry cleanly.
            if (conversation.at(-1)?.role === "user" && conversation.at(-1)?.content === text) conversation.pop();
            addMessage(error?.message || "KQ AI could not reply right now. Please try again.", "assistant", "kq-ai-message-error");
        } finally {
            isSending = false;
            sendButton.disabled = false;
            input.disabled = false;
            input.focus();
        }
    });
})();
