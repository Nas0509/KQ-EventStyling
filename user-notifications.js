(() => {
    const wrapper = document.getElementById("userNotificationWrap");
    const button = document.getElementById("userNotificationBtn");
    const panel = document.getElementById("userNotificationPanel");
    const closeButton = document.getElementById("closeUserNotifications");
    const count = document.getElementById("userNotificationCount");
    const list = document.getElementById("userNotificationList");
    const historyOverlay = document.getElementById("customerBookingHistory");
    const historyContent = document.getElementById("customerHistoryContent");
    const closeHistoryButton = document.getElementById("closeCustomerHistory");
    if (!wrapper || !button || !panel || !list || !window.supabaseClient) return;

    const supabase = window.supabaseClient;
    let currentUserId = null;
    let realtimeChannel = null;
    let refreshTimer = null;
    let notifications = [];
    let historyBookings = [];
    let loading = false;
    let closeOpenRescheduleClock = null;

    historyContent?.addEventListener("scroll", () => closeOpenRescheduleClock?.(), { passive: true });
    document.addEventListener("scroll", () => closeOpenRescheduleClock?.(), { capture: true, passive: true });
    window.addEventListener("resize", () => closeOpenRescheduleClock?.(), { passive: true });

    function setPanelOpen(open) {
        panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
        if (open && currentUserId) {
            void (async () => {
                await loadNotifications();
            })();
        }
    }

    function render() {
        const unreadCount = notifications.filter(item => !item.read_at).length;
        count.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
        count.hidden = unreadCount === 0;
        button.classList.toggle("has-unread", unreadCount > 0);
        button.setAttribute("aria-label", unreadCount
            ? `Notifications, ${unreadCount} unread`
            : "Notifications");

        if (!notifications.length) {
            list.innerHTML = '<p class="user-notification-empty">No notifications yet.</p>';
            return;
        }

        list.replaceChildren();
        notifications.forEach(item => {
            const row = document.createElement("button");
            row.type = "button";
            row.className = `user-notification-item${item.read_at ? " is-read" : " is-unread"}`;
            row.setAttribute("aria-label", `${item.title}. ${item.message}`);
            const title = document.createElement("strong");
            title.textContent = item.title;
            const detail = document.createElement("span");
            detail.textContent = item.message;
            const date = document.createElement("small");
            date.textContent = new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
            }).format(new Date(item.created_at));
            row.append(title, detail, date);
            row.addEventListener("click", () => void (async () => {
                await markRead(item.id);
                setPanelOpen(false);
                await openBookingHistory(item.booking_id);
            })());
            list.appendChild(row);
        });
    }

    async function loadNotifications() {
        if (!currentUserId || loading) return;
        loading = true;
        const { data, error } = await supabase
            .from("user_notifications")
            .select("id,booking_id,title,message,created_at,read_at")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false })
            .limit(40);
        loading = false;
        if (error) {
            console.warn("Unable to load account notifications.");
            if (!notifications.length) list.innerHTML = '<p class="user-notification-empty">Notifications could not be loaded. Please refresh and try again.</p>';
            return;
        }
        notifications = data || [];
        render();
    }

    async function markRead(id) {
        const item = notifications.find(row => row.id === id);
        if (!item || item.read_at) return;
        const readAt = new Date().toISOString();
        item.read_at = readAt;
        render();
        const { error } = await supabase
            .from("user_notifications")
            .update({ read_at: readAt })
            .eq("id", id)
            .eq("user_id", currentUserId);
        if (error) {
            item.read_at = null;
            render();
        }
    }

    const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
    const money = value => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value) || 0);
    const displayDate = value => value ? new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(new Date(`${String(value).slice(0, 10)}T12:00:00`)) : "Not set";
    const displayTime = value => value ? new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(`2000-01-01T${String(value).slice(0, 5)}:00`)) : "Not set";

    function setupRescheduleClock(form) {
        const input = form.querySelector('[name="requested_start_time"]');
        const trigger = form.querySelector("[data-reschedule-clock-toggle]");
        const label = form.querySelector("[data-reschedule-clock-label]");
        const picker = form.querySelector("[data-reschedule-clock]");
        const face = form.querySelector("[data-reschedule-clock-face]");
        const hourText = form.querySelector("[data-reschedule-clock-hour]");
        const minuteText = form.querySelector("[data-reschedule-clock-minute]");
        const periodText = form.querySelector("[data-reschedule-clock-period]");
        const slotNote = form.querySelector("[data-reschedule-clock-slot-note]");
        const hourTab = form.querySelector('[data-reschedule-clock-tab="hour"]');
        const minuteTab = form.querySelector('[data-reschedule-clock-tab="minute"]');
        const done = form.querySelector("[data-reschedule-clock-done]");
        const cancel = form.querySelector("[data-reschedule-clock-cancel]");
        if (!input || !trigger || !label || !picker || !face) return () => {};

        let slot = "";
        let hour = 9;
        let minute = 0;
        let mode = "hour";
        const period = () => slot === "MORNING" ? "AM" : "PM";
        const resetDraft = () => {
            if (input.value) {
                const [hours, minutes] = input.value.split(":").map(Number);
                hour = hours % 12 || 12;
                minute = minutes || 0;
            } else {
                hour = slot === "MORNING" ? 9 : slot === "AFTERNOON" ? 2 : slot === "NIGHT" ? 8 : 9;
                minute = 0;
            }
            mode = "hour";
        };
        const close = (discardDraft = true) => {
            if (discardDraft && !picker.hidden) resetDraft();
            picker.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
        };
        const closeWhenMostlyOutOfView = () => {
            if (picker.hidden) return;
            const rect = picker.getBoundingClientRect();
            const clipRect = historyContent?.getBoundingClientRect();
            const visibleTop = Math.max(rect.top, 0, clipRect?.top ?? 0);
            const visibleBottom = Math.min(rect.bottom, window.innerHeight, clipRect?.bottom ?? window.innerHeight);
            const visibleLeft = Math.max(rect.left, 0, clipRect?.left ?? 0);
            const visibleRight = Math.min(rect.right, window.innerWidth, clipRect?.right ?? window.innerWidth);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibleWidth = Math.max(0, visibleRight - visibleLeft);
            const totalArea = rect.width * rect.height;
            if (totalArea > 0 && (visibleHeight * visibleWidth) / totalArea < 0.5) close();
        };
        closeOpenRescheduleClock = closeWhenMostlyOutOfView;
        const to24Hour = () => hour % 12 + (period() === "PM" ? 12 : 0);
        const render = () => {
            if (hourText) hourText.textContent = String(hour).padStart(2, "0");
            if (minuteText) minuteText.textContent = String(minute).padStart(2, "0");
            if (periodText) periodText.textContent = period();
            hourTab?.classList.toggle("active", mode === "hour");
            minuteTab?.classList.toggle("active", mode === "minute");
            face.replaceChildren();
            const hand = document.createElement("div");
            hand.className = "clock-hand";
            const center = document.createElement("div");
            center.className = "clock-center";
            const values = mode === "hour"
                ? slot === "AFTERNOON" ? [12, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11]
                : Array.from({ length: 12 }, (_, index) => index * 5);
            const activeValue = mode === "hour" ? hour : minute;
            const angle = mode === "hour" ? (hour % 12) * 30 : minute * 6;
            hand.style.transform = `rotate(${angle}deg)`;
            face.append(hand);
            values.forEach((value, index) => {
                const item = document.createElement("button");
                item.type = "button";
                item.className = `clock-number${value === activeValue ? " selected" : ""}`;
                item.textContent = String(value).padStart(2, "0");
                const radians = (index * 30 - 90) * Math.PI / 180;
                item.style.left = `${50 + 40 * Math.cos(radians)}%`;
                item.style.top = `${50 + 40 * Math.sin(radians)}%`;
                item.addEventListener("click", () => {
                    if (mode === "hour") { hour = value; mode = "minute"; }
                    else minute = value;
                    render();
                });
                face.append(item);
            });
            face.append(center);
        };
        const setSlot = nextSlot => {
            slot = nextSlot || "";
            hour = slot === "MORNING" ? 9 : slot === "AFTERNOON" ? 2 : slot === "NIGHT" ? 8 : 9;
            minute = 0;
            mode = "hour";
            input.value = "";
            input.dataset.timeSlot = slot;
            trigger.disabled = !slot;
            trigger.setAttribute("aria-expanded", "false");
            label.textContent = slot ? `Choose a time in the ${slot.toLowerCase()} slot` : "Choose a time after selecting a slot";
            if (slotNote) slotNote.textContent = slot ? `${period()} is set automatically` : "";
            close();
            render();
        };

        trigger.addEventListener("click", () => {
            if (!slot) return;
            if (input.value) {
                const [hours, minutes] = input.value.split(":").map(Number);
                hour = hours % 12 || 12;
                minute = minutes;
            }
            mode = "hour";
            picker.hidden = false;
            trigger.setAttribute("aria-expanded", "true");
            render();
        });
        hourTab?.addEventListener("click", () => { mode = "hour"; render(); });
        minuteTab?.addEventListener("click", () => { mode = "minute"; render(); });
        hourText?.addEventListener("click", () => { mode = "hour"; render(); });
        minuteText?.addEventListener("click", () => { mode = "minute"; render(); });
        done?.addEventListener("click", () => {
            const hours = to24Hour();
            input.value = `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            label.textContent = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period()}`;
            close(false);
        });
        cancel?.addEventListener("click", close);
        form.addEventListener("click", event => {
            const path = event.composedPath();
            if (!picker.hidden && !path.includes(picker) && !path.includes(trigger)) close();
        });
        trigger.disabled = true;
        render();
        return setSlot;
    }

    function showHistoryMessage(message, isError = false) {
        if (historyContent) historyContent.innerHTML = `<p class="customer-history-message${isError ? " is-error" : ""}">${escapeHtml(message)}</p>`;
    }

    function renderBookingHistory(bookings, requests, focusBookingId) {
        if (!bookings.length) {
            showHistoryMessage(focusBookingId
                ? "This booking could not be found in your account."
                : "You do not have any bookings yet.");
            return;
        }
        const requestMap = new Map();
        requests.forEach(request => {
            if (!requestMap.has(String(request.booking_id))) requestMap.set(String(request.booking_id), []);
            requestMap.get(String(request.booking_id)).push(request);
        });
        historyContent.innerHTML = `<div class="customer-history-policy"><strong>Change and cancellation policy</strong><span>Cancellation requests need admin approval and the reservation fee is non-refundable. Reschedule requests made 30 days or more before your current event date are automatic and have no penalty. Requests made less than 30 days before the event need admin approval; the reservation fee is non-refundable even if declined.</span></div>` + bookings.map((booking, index) => {
            const id = String(booking.id);
            const status = String(booking.status || "").toUpperCase();
            const isApproved = status === "APPROVED";
            const latestRequests = requestMap.get(id) || [];
            const adminNotes = String(booking.admin_notes || "").trim();
            const packageDetail = String(booking.message || "").match(/Selected package:\s*([^\n]+)/i)?.[1] || booking.package_type || "Not set";
            const bookingDetails = String(booking.message || "").trim();
            const detailsMarkup = bookingDetails ? `<section class="customer-history-notes"><h4>Booking request details</h4><p>${escapeHtml(bookingDetails).replace(/\n/g, "<br>")}</p></section>` : "";
            const noteMarkup = adminNotes ? `<section class="customer-history-notes"><h4>Admin notes / reminders</h4><p>${escapeHtml(adminNotes).replace(/\n/g, "<br>")}</p></section>` : "";
            const requestMarkup = latestRequests.length ? `<section class="customer-history-requests"><h4>Request history</h4>${latestRequests.map(request => `<article><div><strong>${request.request_type === "CANCELLATION" ? "Cancellation" : "Reschedule"}</strong><span class="customer-history-status status-${escapeHtml(String(request.status).toLowerCase())}">${escapeHtml(request.status)}</span></div><p>${escapeHtml(request.reason)}</p>${request.request_type === "RESCHEDULE" ? `<small>Requested date: ${escapeHtml(displayDate(request.requested_event_date))} · ${escapeHtml(request.requested_time_slot || "")} ${escapeHtml(displayTime(request.requested_start_time))}</small>` : ""}<small>${request.reservation_fee_nonrefundable ? "Reservation fee is non-refundable." : "No reservation fee penalty."} · ${escapeHtml(new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.created_at)))}</small>${request.admin_note ? `<p class="customer-history-admin-reply"><strong>Admin response:</strong> ${escapeHtml(request.admin_note)}</p>` : ""}</article>`).join("")}</section>` : "";
            const actions = isApproved && !latestRequests.some(request => request.status === "PENDING") ? `<div class="customer-history-actions"><button type="button" class="customer-history-action" data-customer-action="reschedule" data-booking-id="${escapeHtml(id)}">Request reschedule</button><button type="button" class="customer-history-action is-danger" data-customer-action="cancel" data-booking-id="${escapeHtml(id)}">Request cancellation</button></div>` : latestRequests.some(request => request.status === "PENDING") ? `<p class="customer-history-pending">A change request is awaiting admin review.</p>` : "";
            return `<article class="customer-booking-card" id="customer-booking-${index}"><header><div><span class="customer-history-eyebrow">BOOKING REFERENCE</span><strong>${escapeHtml(id)}</strong></div><span class="customer-history-status status-${escapeHtml(status.toLowerCase())}">${escapeHtml(status || "UNKNOWN")}</span></header><div class="customer-booking-grid"><div><small>Event</small><strong>${escapeHtml(booking.event_type || "Event")}</strong></div><div><small>Event date</small><strong>${escapeHtml(displayDate(booking.event_date))}</strong></div><div><small>Time</small><strong>${escapeHtml(booking.time_slot || "")} ${escapeHtml(displayTime(booking.start_time))}</strong></div><div><small>Guests</small><strong>${escapeHtml(booking.guests ?? "Not set")}</strong></div><div><small>Package</small><strong>${escapeHtml(packageDetail)}</strong></div><div><small>Total amount</small><strong>${escapeHtml(money(booking.amount))}</strong></div><div><small>Reservation fee</small><strong>${escapeHtml(money(booking.required_down_payment))}</strong></div><div><small>Payment received</small><strong>${escapeHtml(money(booking.down_payment_amount))}</strong></div></div>${detailsMarkup}${noteMarkup}${requestMarkup}${actions}</article>`;
        }).join("");
        if (focusBookingId) {
            const target = bookings.findIndex(booking => String(booking.id) === String(focusBookingId));
            if (target >= 0) requestAnimationFrame(() => document.getElementById(`customer-booking-${target}`)?.scrollIntoView({ block: "start", behavior: "smooth" }));
        }
    }

    async function openBookingHistory(focusBookingId = null) {
        if (!currentUserId || !historyOverlay || !historyContent) return;
        historyOverlay.hidden = false;
        document.body.classList.add("customer-history-open");
        showHistoryMessage("Loading your bookings…");
        const [{ data: bookings, error: bookingError }, { data: requests, error: requestError }] = await Promise.all([
            supabase.from("bookings").select("id,status,event_type,event_date,guests,time_slot,start_time,package_type,travel_distance_km,amount,required_down_payment,down_payment_amount,admin_notes,message,created_at").eq("user_id", currentUserId).order("created_at", { ascending: false }),
            supabase.from("booking_change_requests").select("id,booking_id,request_type,reason,requested_event_date,requested_start_time,requested_time_slot,status,reservation_fee_nonrefundable,admin_note,created_at").eq("user_id", currentUserId).order("created_at", { ascending: false })
        ]);
        if (bookingError || requestError) {
            showHistoryMessage("Could not load booking history. Make sure the booking history setup has been applied, then refresh.", true);
            console.warn("Unable to load booking history.", bookingError || requestError);
            return;
        }
        const selectedBookingId = focusBookingId == null ? null : String(focusBookingId);
        const selectedBookings = (bookings || []).filter(booking =>
            selectedBookingId === null || String(booking.id) === selectedBookingId);
        const selectedRequests = (requests || []).filter(request =>
            selectedBookingId === null || String(request.booking_id) === selectedBookingId);
        historyBookings = selectedBookings;
        renderBookingHistory(selectedBookings, selectedRequests, selectedBookingId);
    }

    function showRequestForm(kind, booking) {
        if (!booking) return;
        const isReschedule = kind === "RESCHEDULE";
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const form = document.createElement("form");
        form.className = "customer-change-form";
        form.dataset.requestKind = kind;
        form.dataset.bookingId = String(booking.id);
        const rescheduleFields = isReschedule ? `<div class="customer-change-form-row"><label>Event type<input type="text" value="${escapeHtml(booking.event_type || "Event")}" readonly></label><label>Estimated number of guests<input type="text" value="${escapeHtml(booking.guests ?? "Not set")}" readonly></label></div><label><span class="customer-change-label">Event date <span class="required-mark">*</span></span><div class="customer-reschedule-date-control"><button type="button" class="booking-date-trigger" data-reschedule-date-trigger><span data-reschedule-date-label>Choose event date</span><span class="booking-date-chevron" aria-hidden="true">▾</span></button><input class="customer-reschedule-date-input" type="date" name="requested_event_date" min="${minDate}" aria-label="Event date" tabindex="-1"></div></label><div class="booking-time-slots customer-reschedule-slots"><p class="time-slot-prompt">Choose an available time slot:</p><div class="time-slot-options"><button type="button" class="time-slot-option is-pending" data-reschedule-slot="MORNING" disabled><strong>Morning</strong><span>6:00 AM–11:55 AM</span><small>Choose a date</small></button><button type="button" class="time-slot-option is-pending" data-reschedule-slot="AFTERNOON" disabled><strong>Afternoon</strong><span>12:00 PM–5:55 PM</span><small>Choose a date</small></button><button type="button" class="time-slot-option is-pending" data-reschedule-slot="NIGHT" disabled><strong>Night</strong><span>6:00 PM–11:55 PM</span><small>Choose a date</small></button></div><small class="booking-time-prompt customer-reschedule-help" role="status" aria-live="polite">Select a date to check availability.</small><input type="hidden" name="requested_time_slot"></div><label><span class="customer-change-label">Event start time <span class="required-mark">*</span></span><div class="clock-picker-wrap customer-reschedule-clock-wrap"><button type="button" class="clock-time-display" data-reschedule-clock-toggle aria-haspopup="dialog" aria-expanded="false" disabled><span data-reschedule-clock-label>Choose a time after selecting a slot</span><span class="clock-icon" aria-hidden="true">◷</span></button><input type="hidden" name="requested_start_time" required><div class="clock-picker customer-reschedule-clock" data-reschedule-clock role="dialog" aria-label="Choose event start time" hidden><div class="clock-picker-header"><div class="clock-current-time"><button type="button" data-reschedule-clock-hour>09</button><span>:</span><button type="button" data-reschedule-clock-minute>00</button><span data-reschedule-clock-period>AM</span></div><div class="clock-tabs"><button type="button" class="active" data-reschedule-clock-tab="hour">Hour</button><button type="button" data-reschedule-clock-tab="minute">Minute</button></div></div><div class="clock-face" data-reschedule-clock-face></div><div class="clock-footer"><span data-reschedule-clock-slot-note></span><button type="button" data-reschedule-clock-cancel>Cancel</button><button type="button" data-reschedule-clock-done>Done</button></div></div></div></label>` : "";
        form.innerHTML = `<div class="customer-change-form-head"><div><span class="customer-history-eyebrow">BOOKING CHANGE</span><h3>${isReschedule ? "Request a reschedule" : "Request cancellation"}</h3></div><button type="button" data-customer-action="close-form" aria-label="Close request form">×</button></div><p class="customer-history-policy-copy">${isReschedule ? "If the request is made 30 or more days before your current event date, the new date is applied automatically with no penalty. Less than 30 days requires admin approval; your reservation fee is non-refundable even if declined." : "Cancellation requests must be reviewed by the admin. Your reservation fee is non-refundable."}</p>${rescheduleFields}<label>Reason<textarea name="reason" rows="4" minlength="10" maxlength="1000" required placeholder="Please explain your request (at least 10 characters)."></textarea></label><div class="customer-change-form-actions"><button type="button" class="customer-history-action" data-customer-action="close-form">Back</button><button type="submit" class="customer-history-action is-primary">${isReschedule ? "Submit reschedule request" : "Submit cancellation request"}</button></div>`;
        historyContent.prepend(form);
        if (isReschedule) {
            form._setRescheduleClock = setupRescheduleClock(form);
            const dateInput = form.querySelector('[name="requested_event_date"]');
            const dateTrigger = form.querySelector("[data-reschedule-date-trigger]");
            const dateLabel = form.querySelector("[data-reschedule-date-label]");
            dateTrigger.addEventListener("click", () => {
                if (typeof dateInput.showPicker === "function") {
                    try { dateInput.showPicker(); } catch { dateInput.focus(); dateInput.click(); }
                } else { dateInput.focus(); dateInput.click(); }
            });
            dateInput.addEventListener("change", () => {
                dateLabel.textContent = dateInput.value ? displayDate(dateInput.value) : "Choose event date";
                void loadRescheduleSlots(form, booking, dateInput.value);
            });
        }
        form.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    async function loadRescheduleSlots(form, booking, date) {
        const slotButtons = Array.from(form.querySelectorAll("[data-reschedule-slot]"));
        const slotInput = form.querySelector('[name="requested_time_slot"]');
        const timeInput = form.querySelector('[name="requested_start_time"]');
        const help = form.querySelector(".customer-reschedule-help");
        if (slotInput) slotInput.value = "";
        if (timeInput) timeInput.value = "";
        form._setRescheduleClock?.("");
        slotButtons.forEach(button => {
            button.disabled = true;
            button.classList.remove("selected");
            button.classList.add("is-pending");
            const status = button.querySelector("small");
            if (status) status.textContent = date ? "Checking availability…" : "Choose a date";
        });
        form.dataset.availabilityDate = date || "";
        if (!date) return;
        const { data, error } = await supabase.rpc("kq_booking_slot_availability", {
            p_start_date: date,
            p_end_date: date
        });
        if (form.dataset.availabilityDate !== date) return;
        if (error || !data?.length) {
            slotButtons.forEach(button => {
                const status = button.querySelector("small");
                if (status) status.textContent = "Unavailable to check";
            });
            if (help) { help.textContent = "Could not load availability. Please try again."; help.hidden = false; }
            return;
        }
        const availability = {
            MORNING: Boolean(data[0].morning_booked),
            AFTERNOON: Boolean(data[0].afternoon_booked),
            NIGHT: Boolean(data[0].night_booked)
        };
        // The availability RPC includes this approved booking itself. Free its current
        // slot (and travel buffer) so the customer may move their own event on that date.
        if (String(booking.event_date || "").slice(0, 10) === date) {
            const currentSlot = String(booking.time_slot || "").toUpperCase();
            const isLarge = /\bPackage [CDE]\b/i.test(String(booking.message || "")) || String(booking.package_type || "").toUpperCase() === "BIG";
            const distance = Number(booking.travel_distance_km) || 0;
            if (isLarge || distance > 30) {
                availability.MORNING = false;
                availability.AFTERNOON = false;
                availability.NIGHT = false;
            } else if (currentSlot in availability) {
                availability[currentSlot] = false;
                if (distance === 30 && currentSlot === "MORNING") availability.AFTERNOON = false;
                if (distance === 30 && currentSlot === "AFTERNOON") availability.NIGHT = false;
            }
        }
        slotButtons.forEach(button => {
            const slot = button.dataset.rescheduleSlot;
            const unavailable = Boolean(availability[slot]);
            button.classList.remove("is-pending");
            button.disabled = unavailable;
            const status = button.querySelector("small");
            if (status) status.textContent = unavailable ? "Unavailable" : "Available";
        });
        if (help) { help.textContent = "Choose a slot to see start times within that period."; help.hidden = false; }
        slotButtons.forEach(button => button.onclick = () => {
            if (button.disabled) return;
            slotButtons.forEach(other => other.classList.toggle("selected", other === button));
            slotInput.value = button.dataset.rescheduleSlot;
            form._setRescheduleClock?.(button.dataset.rescheduleSlot);
            if (help) help.textContent = `Showing ${button.dataset.rescheduleSlot.toLowerCase()} start times only.`;
        });
    }

    async function submitChangeRequest(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const isReschedule = form.dataset.requestKind === "RESCHEDULE";
        const reason = String(formData.get("reason") || "").trim();
        if (reason.length < 10) {
            form.querySelector('[name="reason"]')?.focus();
            return;
        }
        if (isReschedule && (!formData.get("requested_event_date") || !formData.get("requested_time_slot") || !formData.get("requested_start_time"))) {
            form.querySelector(".customer-change-error")?.remove();
            const errorMessage = document.createElement("p");
            errorMessage.className = "customer-history-message is-error customer-change-error";
            errorMessage.textContent = "Choose an available date, time slot, and start time before submitting.";
            form.prepend(errorMessage);
            return;
        }
        const args = {
            p_booking_id: form.dataset.bookingId,
            p_request_type: form.dataset.requestKind,
            p_reason: reason,
            p_requested_event_date: isReschedule ? formData.get("requested_event_date") : null,
            p_requested_start_time: isReschedule ? formData.get("requested_start_time") : null,
            p_requested_time_slot: isReschedule ? formData.get("requested_time_slot") : null
        };
        submitButton.disabled = true;
        submitButton.textContent = "Submitting…";
        const { data, error } = await supabase.rpc("kq_request_booking_change", args);
        if (error) {
            form.querySelector(".customer-change-error")?.remove();
            const errorMessage = document.createElement("p");
            errorMessage.className = "customer-history-message is-error customer-change-error";
            errorMessage.textContent = error.message || "Your request could not be submitted. Please try again.";
            form.prepend(errorMessage);
            submitButton.disabled = false;
            submitButton.textContent = isReschedule ? "Submit reschedule request" : "Submit cancellation request";
            return;
        }
        await openBookingHistory(form.dataset.bookingId);
        const result = Array.isArray(data) ? data[0] : data;
        const message = result?.status === "ACCEPTED"
            ? "Your reschedule is confirmed."
            : "Your request was sent to the admin for review.";
        historyContent.insertAdjacentHTML("afterbegin", `<p class="customer-history-message is-success">${escapeHtml(message)}</p>`);
    }

    async function setSessionUser(user) {
        const nextUserId = user?.id || null;
        if (nextUserId === currentUserId) return;
        if (realtimeChannel) {
            await supabase.removeChannel(realtimeChannel);
            realtimeChannel = null;
        }
        if (refreshTimer) {
            window.clearInterval(refreshTimer);
            refreshTimer = null;
        }
        currentUserId = nextUserId;
        notifications = [];
        wrapper.hidden = !currentUserId;
        setPanelOpen(false);
        render();
        if (!currentUserId) return;

        await loadNotifications();
        realtimeChannel = supabase
            .channel(`user-notifications-${currentUserId}`)
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "user_notifications",
                filter: `user_id=eq.${currentUserId}`
            }, () => void loadNotifications())
            .subscribe();
        // Realtime normally updates the bell immediately. Poll as a fallback in case
        // the Supabase Realtime publication is not enabled on the project yet.
        refreshTimer = window.setInterval(() => {
            if (document.visibilityState === "visible") void loadNotifications();
        }, 15000);
    }

    button.addEventListener("click", () => setPanelOpen(panel.hidden));
    closeButton?.addEventListener("click", () => setPanelOpen(false));
    closeHistoryButton?.addEventListener("click", closeBookingHistory);
    historyOverlay?.addEventListener("click", event => { if (event.target === historyOverlay) closeBookingHistory(); });
    historyContent?.addEventListener("click", event => {
        const action = event.target.closest("[data-customer-action]");
        if (!action) return;
        const type = action.dataset.customerAction;
        const booking = historyBookings.find(item => String(item.id) === String(action.dataset.bookingId));
        if (type === "cancel") showRequestForm("CANCELLATION", booking);
        if (type === "reschedule") showRequestForm("RESCHEDULE", booking);
        if (type === "close-form") action.closest(".customer-change-form")?.remove();
    });
    historyContent?.addEventListener("submit", event => {
        if (!event.target.matches(".customer-change-form")) return;
        event.preventDefault();
        void submitChangeRequest(event.target);
    });
    document.addEventListener("click", event => {
        if (!panel.hidden && !wrapper.contains(event.target)) setPanelOpen(false);
    });
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && currentUserId) void loadNotifications();
    });
    window.addEventListener("focus", () => {
        if (currentUserId) void loadNotifications();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !panel.hidden) {
            setPanelOpen(false);
            button.focus();
        }
        if (event.key === "Escape" && historyOverlay && !historyOverlay.hidden) closeBookingHistory();
    });

    supabase.auth.getSession().then(({ data }) => setSessionUser(data?.session?.user));
    supabase.auth.onAuthStateChange((_event, session) => setSessionUser(session?.user));

    function closeBookingHistory() {
        if (!historyOverlay) return;
        historyOverlay.hidden = true;
        document.body.classList.remove("customer-history-open");
    }
})();
