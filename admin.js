const STORAGE_KEY = "kqBookings";
const PAYMENT_KEY = "kqPayments";
const EXPENSE_KEY = "kqExpenses";
const EXPENSE_ARCHIVE_KEY = "kqArchivedExpenses";
const INVENTORY_KEY = "kqInventory";

const defaultInventory = [
    { id: 1, name: "Balloons", category: "Decoration", quantity: 200, unit: "pcs", cost: 5, reorder: 50 },
    { id: 2, name: "Table Covers", category: "Table Styling", quantity: 20, unit: "pcs", cost: 150, reorder: 10 },
    { id: 3, name: "LED Lights", category: "Lighting", quantity: 5, unit: "pcs", cost: 500, reorder: 5 }
];

let bookings = [];
let bookingChangeRequests = [];
let payments = JSON.parse(localStorage.getItem(PAYMENT_KEY) || "[]");
let expenses = JSON.parse(localStorage.getItem(EXPENSE_KEY) || "[]");
let archivedExpenses = JSON.parse(localStorage.getItem(EXPENSE_ARCHIVE_KEY) || "[]");
let inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || "null") || defaultInventory;

const accountMenuWrap = document.getElementById("accountMenuWrap");
const settingsMenuBtn = document.getElementById("settingsMenuBtn");
const sidebarAccountMenu = document.getElementById("sidebarAccountMenu");
let currentAdminProfile = null;
let currentAdminUser = null;

function setAccountMenuOpen(open) {
    if (!settingsMenuBtn || !sidebarAccountMenu) return;
    sidebarAccountMenu.hidden = !open;
    settingsMenuBtn.setAttribute("aria-expanded", String(open));
    if (!open) return;

    const buttonRect = settingsMenuBtn.getBoundingClientRect();
    const menuRect = sidebarAccountMenu.getBoundingClientRect();
    const edge = 12;
    const left = Math.max(edge, Math.min(buttonRect.left, window.innerWidth - menuRect.width - edge));
    let top = buttonRect.top - menuRect.height - edge;
    if (top < edge) top = buttonRect.bottom + edge;
    top = Math.max(edge, Math.min(top, window.innerHeight - menuRect.height - edge));
    sidebarAccountMenu.style.left = `${left}px`;
    sidebarAccountMenu.style.top = `${top}px`;
}

const money = n => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(Number(n) || 0);
const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(payments));
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
    localStorage.setItem(EXPENSE_ARCHIVE_KEY, JSON.stringify(archivedExpenses));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
};

function statusClass(status) { return String(status || "").toUpperCase().replace(/\s+/g, "_"); }

function syncPayments() {
    bookings.forEach(b => {
        if (!payments.find(p => p.bookingId === b.id)) {
            const paid = Number(b.down_payment_amount) || 0;
            payments.push({ bookingId: b.id, total: Number(b.amount) || 0, paid, status: paid > 0 ? "DOWN PAYMENT MADE" : "NO DOWN PAYMENT" });
        } else if (String(b.payment_status || "").toUpperCase() === "PAID") {
            const payment = payments.find(p => p.bookingId === b.id);
            payment.paid = Math.max(Number(payment.paid) || 0, Number(b.down_payment_amount) || 0);
            if (payment.paid < Number(payment.total)) payment.status = "DOWN PAYMENT MADE";
        }
    });
    payments = payments.filter(p => bookings.some(b => b.id === p.bookingId));
    save();
}
// Bookings come from Supabase so submissions are shared across devices.
function normalizeBooking(row) {
    const selectedPackage = String(row.message || "").match(/Selected package:\s*(Simple Styling|Package [A-E])\b/i)?.[1] || "";
    const packageLabel = selectedPackage
        ? (/^Package [CDE]$/i.test(selectedPackage) ? "BIG" : "SIMPLE")
        : (String(row.package_type || row.package || "").toUpperCase() === "BIG" ? "BIG" : "SIMPLE");
    return {
        ...row,
        fullName: row.full_name || "",
        eventType: row.event_type || "",
        eventDate: row.event_date || "",
        startTime: row.start_time || "",
        timeSlot: row.time_slot || "",
        package: packageLabel,
        adminNotes: row.admin_notes || "",
        createdAt: row.created_at || ""
    };
}

async function loadBookings() {
    const emptyState = document.getElementById("emptyBookings");
    if (emptyState) emptyState.textContent = "Loading bookings...";

    const { data, error } = await window.supabaseClient
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        bookings = [];
        renderAll();
        if (emptyState) {
            emptyState.textContent = "Unable to load bookings. Check your connection and Supabase admin access, then refresh.";
            emptyState.style.display = "block";
        }
        console.error("Booking loading error:", error);
        return;
    }

    bookings = (data || []).map(normalizeBooking);
    syncPayments();
    renderAll();
}

async function loadBookingChangeRequests() {
    const container = document.getElementById("bookingChangeRequestList");
    const count = document.getElementById("bookingChangeRequestCount");
    if (!container || !window.supabaseClient) return;
    const { data, error } = await window.supabaseClient
        .from("booking_change_requests")
        .select("id,booking_id,user_id,request_type,reason,requested_event_date,requested_start_time,requested_time_slot,status,reservation_fee_nonrefundable,admin_note,created_at,reviewed_at")
        .order("created_at", { ascending: false });
    if (error) {
        bookingChangeRequests = [];
        container.innerHTML = '<div class="empty-state">Unable to load these requests. Apply booking-change-requests.sql in Supabase, then refresh.</div>';
        if (count) count.textContent = "Admin review setup needed";
        updateAdminNotifications();
        return;
    }
    bookingChangeRequests = data || [];
    const pendingRequests = bookingChangeRequests.filter(request => String(request.status).toUpperCase() === "PENDING");
    if (count) count.textContent = `${pendingRequests.length} request${pendingRequests.length === 1 ? "" : "s"} awaiting your review`;
    renderBookings();
    updateAdminNotifications();
    if (!pendingRequests.length) {
        container.innerHTML = '<div class="empty-state">No cancellation or reschedule requests need review.</div>';
    } else container.innerHTML = pendingRequests.slice().sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).map(request => {
        const booking = bookings.find(item => String(item.id) === String(request.booking_id));
        const isCancellation = request.request_type === "CANCELLATION";
        const requestedDate = request.requested_event_date
            ? new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(new Date(`${String(request.requested_event_date).slice(0, 10)}T12:00:00`))
            : "";
        const requestedTime = request.requested_start_time
            ? new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(`2000-01-01T${String(request.requested_start_time).slice(0, 5)}:00`))
            : "";
        return `<article class="booking-change-request-card"><div class="booking-change-request-top"><div><span class="badge">${isCancellation ? "CANCELLATION" : "RESCHEDULE"}</span><h4>${escapeHtml(booking?.fullName || "Customer")} <small>· ${escapeHtml(request.booking_id)}</small></h4><p>${escapeHtml(booking?.eventType || "Event")} · current date ${escapeHtml(booking?.eventDate || "not set")}${!isCancellation ? ` · requested ${escapeHtml(requestedDate)} at ${escapeHtml(request.requested_time_slot || "")} ${escapeHtml(requestedTime)}` : ""}</p></div><div class="booking-change-card-actions"><span class="booking-change-fee ${request.reservation_fee_nonrefundable ? "is-nonrefundable" : ""}">${request.reservation_fee_nonrefundable ? "Reservation fee non-refundable" : "No fee penalty"}</span><details class="booking-change-menu"><summary aria-label="Request actions" title="Request actions">⋮</summary><div class="booking-change-menu-options"><button type="button" data-change-review="accept" data-request-id="${escapeAttr(request.id)}">Accept</button><button type="button" data-change-review="reject" data-request-id="${escapeAttr(request.id)}">Decline</button><button type="button" data-view-change-request="${escapeAttr(request.id)}">View</button></div></details></div></div><div class="booking-change-reason"><strong>Customer reason</strong><p>${escapeHtml(request.reason)}</p></div></article>`;
    }).join("");
}

function openCustomerRequestHistory(bookingId) {
    const booking = bookings.find(item => String(item.id) === String(bookingId));
    if (!booking) return;
    const clientBookingIds = new Set(bookings
        .filter(item => booking.user_id ? String(item.user_id) === String(booking.user_id) : String(item.id) === String(bookingId))
        .map(item => String(item.id)));
    const requests = bookingChangeRequests
        .filter(request => clientBookingIds.has(String(request.booking_id)))
        .slice()
        .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    const history = requests.length ? requests.map(request => {
        const kind = String(request.request_type).toUpperCase() === "CANCELLATION" ? "Cancellation" : "Reschedule";
        const status = String(request.status || "PENDING").toUpperCase();
        const statusLabel = status === "ACCEPTED" ? "APPROVED" : status === "REJECTED" ? "DECLINED" : "PENDING";
        const statusClassName = status === "ACCEPTED" ? "is-accepted" : status === "REJECTED" ? "is-rejected" : "is-pending";
        const submitted = request.created_at ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.created_at)) : "Date not recorded";
        const requestedDate = request.requested_event_date ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(`${String(request.requested_event_date).slice(0, 10)}T12:00:00`)) : "";
        const requestedTime = request.requested_start_time ? new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(`2000-01-01T${String(request.requested_start_time).slice(0, 5)}:00`)) : "";
        const relatedBooking = bookings.find(item => String(item.id) === String(request.booking_id));
        return `<article class="booking-change-request-card booking-change-history-card"><div class="booking-change-request-top"><div><span class="badge">${escapeHtml(kind)}</span><h4>${escapeHtml(relatedBooking?.eventType || "Event")} · ${escapeHtml(relatedBooking?.eventDate || "Date not set")}</h4><p>Booking ${escapeHtml(request.booking_id)} · submitted ${escapeHtml(submitted)}${requestedDate ? ` · requested ${escapeHtml(requestedDate)} at ${escapeHtml(request.requested_time_slot || "")} ${escapeHtml(requestedTime)}` : ""}</p></div><span class="booking-change-history-status ${statusClassName}">${statusLabel}</span></div><div class="booking-change-reason"><strong>Client reason</strong><p>${escapeHtml(request.reason || "No reason recorded")}</p></div>${request.admin_note ? `<div class="booking-change-admin-note"><strong>Admin response</strong><p>${escapeHtml(request.admin_note)}</p></div>` : ""}</article>`;
    }).join("") : '<div class="empty-state">This client has no cancellation or reschedule requests.</div>';
    openModal(`<section class="client-request-history"><header class="client-request-history-header"><span class="eyebrow">CLIENT REQUESTS</span><h3>Request history</h3><p>${escapeHtml(booking.fullName || "Customer")}<span> · </span>${escapeHtml(booking.email || "")}<br><span>${escapeHtml(booking.eventType || "Event")} · ${escapeHtml(booking.eventDate || "Date not set")}</span></p></header><div class="booking-change-request-list booking-change-history-modal-list">${history}</div></section>`);
    document.querySelector("#modal .modal-card")?.classList.add("request-history-modal-card");
}

function openBookingChangeReview(requestId, accepted) {
    const request = bookingChangeRequests.find(item => String(item.id) === String(requestId));
    if (!request) return;
    const actionLabel = accepted ? "Accept request" : "Decline request";
    const isCancellation = request.request_type === "CANCELLATION";
    const effect = accepted
        ? (isCancellation ? "The booking will be cancelled and moved to the archive." : "The approved booking date and time will be changed.")
        : "The customer's original booking will stay unchanged.";
    openModal(`<div class="booking-change-confirmation"><span class="eyebrow">CONFIRM REQUEST</span><h3>Are you sure?</h3><p class="field-help">You are about to ${accepted ? "accept" : "decline"} this ${isCancellation ? "cancellation" : "reschedule"} request. ${effect}${request.reservation_fee_nonrefundable ? " The reservation fee remains non-refundable even if this request is declined." : ""} The customer will be notified by in-app notification and email.</p><div class="modal-field full"><label for="bookingChangeAdminNote">Admin response / note (optional)</label><textarea id="bookingChangeAdminNote" rows="3" maxlength="1000" placeholder="Add a note for the customer"></textarea></div><div class="modal-actions"><button type="button" class="btn secondary" id="cancelBookingChangeReview">Go back</button><button type="button" class="btn primary" id="confirmBookingChangeReview" data-request-id="${escapeAttr(request.id)}" data-accept="${accepted ? "true" : "false"}">Yes, ${accepted ? "accept" : "decline"} request</button></div></div>`);
}

async function submitBookingChangeReview(requestId, accepted) {
    const button = document.getElementById("confirmBookingChangeReview");
    const note = document.getElementById("bookingChangeAdminNote")?.value.trim() || null;
    if (button) { button.disabled = true; button.textContent = "Saving…"; }
    const { error } = await window.supabaseClient.rpc("kq_admin_review_booking_change", {
        p_request_id: requestId,
        p_accept: accepted,
        p_admin_note: note
    });
    if (error) {
        if (button) { button.disabled = false; button.textContent = accepted ? "Accept request" : "Decline request"; }
        showAdminToast(error.message || "Unable to review this request.", "error");
        return;
    }
    const { data: emailResult, error: emailError } = await window.supabaseClient.functions.invoke("send-booking-change-review-email", {
        body: { requestId }
    });
    let emailNotice = "";
    if (emailError) {
        console.warn("Booking change request was reviewed, but the customer email was not sent.", emailError);
        let providerMessage = emailResult?.error;
        const response = emailError.context;
        if (!providerMessage && response && typeof response.clone === "function") {
            try { providerMessage = (await response.clone().json())?.error; } catch { /* Keep the fallback notice. */ }
        }
        if (!providerMessage && Number(response?.status) === 404) providerMessage = "The email function is not deployed to Supabase yet.";
        if (!providerMessage && emailError.name === "FunctionsFetchError") providerMessage = "Could not reach the email service. Check the connection and Supabase function deployment.";
        emailNotice = " The in-app notification was saved, but the email could not be sent" + (providerMessage ? `: ${providerMessage}` : ". Check the Supabase function deployment and Gmail secrets.");
    }
    closeModal();
    await loadBookings();
    await loadBookingChangeRequests();
    showAdminToast((accepted
        ? "Customer request accepted. An in-app notification was sent to the customer."
        : "Customer request declined. An in-app notification was sent to the customer.") + emailNotice, emailNotice ? "error" : "success");
}

async function requireAdmin() {
    if (!window.supabaseClient) {
        alert("Supabase is not connected. Check supabase-config.js.");
        window.location.replace("login.html");
        return false;
    }

    const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
    if (sessionError || !session) {
        window.location.replace("login.html");
        return false;
    }

    const { data: profile, error } = await window.supabaseClient
        .from("profiles")
        .select("role,full_name,contact_number,email")
        .eq("id", session.user.id)
        .single();

    if (error || profile?.role !== "admin") {
        await window.supabaseClient.auth.signOut();
        window.location.replace("login.html");
        return false;
    }

    if (profile.email && session.user.email && profile.email !== session.user.email) {
        const { error: emailSyncError } = await window.supabaseClient
            .from("profiles")
            .update({ email: session.user.email })
            .eq("id", session.user.id);
        if (emailSyncError) console.warn("Unable to sync the confirmed account email:", emailSyncError);
    }

    const adminName = document.querySelector(".admin-user strong");
    const displayName = profile.full_name?.trim() || "Administrator";
    currentAdminProfile = profile;
    currentAdminUser = session.user;
    if (adminName) adminName.textContent = displayName;
    const adminAvatar = document.querySelector(".admin-user .avatar");
    if (adminAvatar) adminAvatar.textContent = displayName.slice(0, 1).toUpperCase();
    const accountName = document.getElementById("settingsAccountName");
    if (accountName) accountName.textContent = displayName;
    const accountEmail = document.getElementById("settingsAccountEmail");
    if (accountEmail) accountEmail.textContent = session.user.email || "Email unavailable";
    const accountAvatar = document.getElementById("settingsAccountAvatar");
    if (accountAvatar) accountAvatar.textContent = displayName.slice(0, 1).toUpperCase();
    return true;
}

function showSection(id) {
    document.querySelectorAll(".page-section").forEach(s => s.classList.toggle("active", s.id === id));
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === id));
    const titles = {
        dashboard: "Admin Dashboard",
        bookings: "Booking Management",
        archive: "Cancelled Bookings Archive",
        quotations: "Quotation Management",
        payments: "Payment Management",
        sales: "Sales Management",
        inventory: "Inventory Management"
    };
    document.getElementById("pageTitle").textContent = titles[id] || "Admin Dashboard";
    renderAll();
}

const mobileNavToggle = document.getElementById("mobileNavToggle");
const adminSidebar = document.querySelector(".sidebar");
function setMobileAdminNav(open) {
    if (!mobileNavToggle || !adminSidebar) return;
    adminSidebar.classList.toggle("is-mobile-nav-open", open);
    mobileNavToggle.setAttribute("aria-expanded", String(open));
    mobileNavToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
mobileNavToggle?.addEventListener("click", () => setMobileAdminNav(!adminSidebar.classList.contains("is-mobile-nav-open")));
document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => {
    showSection(btn.dataset.section);
    if (window.matchMedia("(max-width: 760px)").matches) setMobileAdminNav(false);
}));
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && adminSidebar?.classList.contains("is-mobile-nav-open")) {
        setMobileAdminNav(false);
        mobileNavToggle?.focus();
    }
});
document.addEventListener("click", event => {
    if (window.matchMedia("(max-width: 760px)").matches && adminSidebar?.classList.contains("is-mobile-nav-open") && !adminSidebar.contains(event.target)) {
        setMobileAdminNav(false);
    }
});
function followDashboardShortcut(target) {
    const section = target.dataset.sectionJump;
    const status = target.dataset.statusFilter;
    const paymentStatus = target.dataset.paymentFilter;
    if (section === "bookings" && status) {
        const statusFilter = document.getElementById("bookingStatusFilter");
        const search = document.getElementById("bookingSearch");
        if (statusFilter) statusFilter.value = status;
        if (search) search.value = "";
    }
    if (section === "payments" && paymentStatus) {
        const paymentFilter = document.getElementById("paymentStatusFilter");
        if (paymentFilter) paymentFilter.value = paymentStatus;
    }
    showSection(section);
}
document.querySelectorAll("[data-section-jump]").forEach(target => {
    target.addEventListener("click", () => followDashboardShortcut(target));
    if (target.classList.contains("dashboard-shortcut")) {
        target.addEventListener("keydown", event => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            followDashboardShortcut(target);
        });
    }
});
settingsMenuBtn?.addEventListener("click", () => {
    setAccountMenuOpen(sidebarAccountMenu?.hidden ?? true);
});
window.addEventListener("resize", () => {
    if (sidebarAccountMenu && !sidebarAccountMenu.hidden) setAccountMenuOpen(true);
});
document.addEventListener("click", event => {
    if (accountMenuWrap && !accountMenuWrap.contains(event.target)) setAccountMenuOpen(false);
});
document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || sidebarAccountMenu?.hidden) return;
    setAccountMenuOpen(false);
    settingsMenuBtn?.focus();
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    setAccountMenuOpen(false);
    openModal(`<div class="logout-confirmation">
        <span class="logout-confirmation-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10M14 8l4 4-4 4M8 12h10"></path></svg></span>
        <h3>Sign out of admin?</h3>
        <p>You will need to sign in again to manage KQ Event Styling.</p>
        <div class="modal-actions">
            <button type="button" class="small-btn" id="cancelLogoutBtn">Stay signed in</button>
            <button type="button" class="btn danger" id="confirmLogoutBtn">Sign out</button>
        </div>
    </div>`);
    document.querySelector("#modal .modal-card")?.classList.add("logout-confirmation-card");
    document.getElementById("cancelLogoutBtn")?.addEventListener("click", () => {
        closeModal();
        settingsMenuBtn?.focus();
    });
    document.getElementById("confirmLogoutBtn")?.addEventListener("click", async event => {
        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = "Signing out…";
        try {
            if (window.supabaseClient) {
                const { error } = await window.supabaseClient.auth.signOut();
                if (error) throw error;
            }
            window.location.href = "login.html";
        } catch (error) {
            console.error("Admin sign-out error:", error);
            closeModal();
            showAdminToast("Could not sign out. Please try again.", "error");
            settingsMenuBtn?.focus();
        }
    });
});

document.getElementById("editAccountBtn")?.addEventListener("click", openAccountSettings);

function openAccountSettings() {
    const user = currentAdminUser;
    const profile = currentAdminProfile || {};
    if (!user) {
        showAdminToast("Account details are still loading. Please try again.", "error");
        return;
    }

    const metadata = user.user_metadata || {};
    const fullName = String(profile.full_name || metadata.full_name || "").trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = metadata.first_name || nameParts.shift() || "";
    const lastName = metadata.last_name || nameParts.pop() || "";
    const middleName = metadata.middle_name || nameParts.join(" ");
    const contact = profile.contact_number || metadata.contact_number || "";

    setAccountMenuOpen(false);
    openModal(`<h3>Account details</h3>
        <p class="account-settings-intro">Update the personal information connected to your admin account.</p>
        <form id="accountSettingsForm" novalidate>
            <div class="modal-grid account-settings-grid">
                <div class="modal-field"><label for="accountFirstName">First name</label><input id="accountFirstName" name="firstName" value="${escapeAttr(firstName)}" autocomplete="given-name" required></div>
                <div class="modal-field"><label for="accountMiddleName">Middle name</label><input id="accountMiddleName" name="middleName" value="${escapeAttr(middleName)}" autocomplete="additional-name"></div>
                <div class="modal-field"><label for="accountLastName">Last name</label><input id="accountLastName" name="lastName" value="${escapeAttr(lastName)}" autocomplete="family-name" required></div>
                <div class="modal-field"><label for="accountContactNumber">Contact number</label><input id="accountContactNumber" name="contactNumber" type="tel" value="${escapeAttr(contact)}" placeholder="09XXXXXXXXX" autocomplete="tel" required></div>
                <div class="modal-field full"><label for="accountEmail">Email address</label><input id="accountEmail" name="email" type="email" value="${escapeAttr(user.email || "")}" autocomplete="email" required><small>Email changes may require confirmation through your inbox.</small></div>
                <div class="modal-field"><label for="accountNewPassword">New password</label><input id="accountNewPassword" name="newPassword" type="password" minlength="8" autocomplete="new-password" placeholder="Leave blank to keep current"></div>
                <div class="modal-field"><label for="accountConfirmPassword">Confirm new password</label><input id="accountConfirmPassword" name="confirmPassword" type="password" minlength="8" autocomplete="new-password" placeholder="Re-enter new password"></div>
                <div class="modal-field full"><p id="accountSettingsMessage" class="account-settings-message" aria-live="polite" hidden></p></div>
            </div>
            <div class="modal-actions"><button type="button" class="small-btn" id="cancelAccountSettings">Cancel</button><button type="submit" class="btn primary" id="saveAccountSettings">Save changes</button></div>
        </form>`);

    document.getElementById("cancelAccountSettings").addEventListener("click", closeModal);
    document.getElementById("accountSettingsForm").addEventListener("submit", saveAccountSettings);
}

async function saveAccountSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const firstName = String(values.get("firstName") || "").trim();
    const middleName = String(values.get("middleName") || "").trim();
    const lastName = String(values.get("lastName") || "").trim();
    const contactNumber = String(values.get("contactNumber") || "").trim();
    const email = String(values.get("email") || "").trim();
    const newPassword = String(values.get("newPassword") || "");
    const confirmPassword = String(values.get("confirmPassword") || "");
    const message = document.getElementById("accountSettingsMessage");
    const saveButton = document.getElementById("saveAccountSettings");
    const showError = text => {
        message.textContent = text;
        message.hidden = false;
        message.classList.add("error");
    };

    const phoneDigits = contactNumber.replace(/[\s()-]/g, "");
    if (!firstName || !lastName) return showError("Enter your first name and last name.");
    if (!/^(09\d{9}|\+639\d{9})$/.test(phoneDigits)) return showError("Enter a valid 11-digit mobile number or a +63 mobile number.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("Enter a valid email address.");
    if (newPassword && newPassword.length < 8) return showError("Your new password must contain at least 8 characters.");
    if (newPassword !== confirmPassword) return showError("The new password and confirmation do not match.");

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
    const normalizedContact = phoneDigits.startsWith("09") ? `+63${phoneDigits.slice(1)}` : phoneDigits;
    const emailChanged = email.toLowerCase() !== String(currentAdminUser?.email || "").toLowerCase();
    const profileUpdate = {
        full_name: fullName,
        contact_number: normalizedContact
    };
    const authUpdate = {
        data: {
            full_name: fullName,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            contact_number: normalizedContact
        }
    };
    if (emailChanged) authUpdate.email = email;
    if (newPassword) authUpdate.password = newPassword;

    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    message.hidden = true;
    message.classList.remove("error");

    const { data: updatedProfile, error: profileError } = await window.supabaseClient
        .from("profiles")
        .update(profileUpdate)
        .eq("id", currentAdminUser.id)
        .select("id")
        .maybeSingle();

    if (profileError || !updatedProfile) {
        showError(profileError?.message || "Profile could not be updated. Check the profile table permissions and try again.");
        saveButton.disabled = false;
        saveButton.textContent = "Save changes";
        return;
    }

    const { data: updatedAuth, error: authError } = await window.supabaseClient.auth.updateUser(authUpdate);
    if (authError) {
        currentAdminProfile = { ...currentAdminProfile, ...profileUpdate };
        const adminName = document.querySelector(".admin-user strong");
        if (adminName) adminName.textContent = fullName;
        const adminAvatar = document.querySelector(".admin-user .avatar");
        if (adminAvatar) adminAvatar.textContent = firstName.slice(0, 1).toUpperCase();
        document.getElementById("settingsAccountName").textContent = fullName;
        document.getElementById("settingsAccountAvatar").textContent = firstName.slice(0, 1).toUpperCase();
        showError(`Profile details were saved, but the email or password update failed: ${authError.message}`);
        saveButton.disabled = false;
        saveButton.textContent = "Save changes";
        return;
    }

    currentAdminProfile = { ...currentAdminProfile, ...profileUpdate };
    currentAdminUser = updatedAuth.user || currentAdminUser;
    const adminName = document.querySelector(".admin-user strong");
    if (adminName) adminName.textContent = fullName;
    const adminAvatar = document.querySelector(".admin-user .avatar");
    if (adminAvatar) adminAvatar.textContent = firstName.slice(0, 1).toUpperCase();
    document.getElementById("settingsAccountName").textContent = fullName;
    document.getElementById("settingsAccountEmail").textContent = currentAdminUser.email || email;
    document.getElementById("settingsAccountAvatar").textContent = firstName.slice(0, 1).toUpperCase();
    closeModal();
    showAdminToast(emailChanged ? "Account details saved. Confirm the email change using the message sent to your inbox." : "Account details saved.");
}

function renderDashboard() {
    const pending = bookings.filter(b => b.status === "PENDING").length;
    const approved = bookings.filter(b => b.status === "APPROVED").length;
    const declined = bookings.filter(b => b.status === "DECLINED").length;
    const upcoming = bookings.filter(b => b.status === "APPROVED" && new Date(b.eventDate) >= new Date(new Date().toDateString())).length;
    const unpaid = payments.filter(p => p.status === "NO DOWN PAYMENT").length;
    const partial = payments.filter(p => p.status === "PARTIAL PAYMENT" || p.status === "DOWN PAYMENT MADE").length;
    const paid = payments.filter(p => p.status === "FULLY PAID").length;
    const sales = payments.reduce((sum, p) => sum + Number(p.paid || 0), 0);
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statApproved").textContent = approved;
    document.getElementById("statDeclined").textContent = declined;
    document.getElementById("statUpcoming").textContent = upcoming;
    document.getElementById("statUnpaid").textContent = unpaid;
    document.getElementById("statPartial").textContent = partial;
    document.getElementById("statPaid").textContent = paid;
    document.getElementById("statSales").textContent = money(sales);

    const upcomingItems = bookings.filter(b => b.status === "APPROVED").sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)).slice(0, 5);
    document.getElementById("upcomingList").innerHTML = upcomingItems.length ? upcomingItems.map(b => `<div class="mini-item"><div><strong>${escapeHtml(b.fullName)}</strong><small>${escapeHtml(b.eventType)} • ${escapeHtml(b.eventDate)}</small></div><span class="status APPROVED">APPROVED</span></div>`).join("") : '<div class="empty-state">No upcoming approved events.</div>';

    document.getElementById("dashboardInventory").innerHTML = inventory.map(i => {
        const low = Number(i.quantity) <= Number(i.reorder);
        return `<div class="mini-item"><div><strong>${escapeHtml(i.name)}</strong><small>${i.quantity} ${escapeHtml(i.unit)}</small></div><span class="status ${low ? "CANCELLED" : "APPROVED"}">${low ? "LOW STOCK" : "AVAILABLE"}</span></div>`;
    }).join("");

    const timeline = document.getElementById("bookingTimeline");
    if (timeline) {
        const recent = [...bookings].sort((a, b) => new Date(b.createdAt || b.eventDate || 0) - new Date(a.createdAt || a.eventDate || 0)).slice(0, 6);
        timeline.innerHTML = recent.length ? recent.map(booking => {
            const created = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "Date not recorded";
            return `<div class="booking-timeline-item"><span class="booking-timeline-dot ${statusClass(booking.status)}"></span><div><div class="booking-timeline-heading"><strong>${escapeHtml(booking.fullName || "Client")}</strong><span class="status ${statusClass(booking.status)}">${escapeHtml(booking.status || "PENDING")}</span></div><small>${escapeHtml(booking.eventType || "Event")} · ${escapeHtml(booking.eventDate || "Date not set")}</small><small>Request received ${escapeHtml(created)}</small></div></div>`;
        }).join("") : '<div class="empty-state">Booking activity will appear here.</div>';
    }

    const analytics = document.getElementById("dashboardAnalytics");
    if (analytics) {
        const monthNames = Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(2020, index, 1)));
        const monthly = Array(12).fill(0);
        const datedBookings = bookings.filter(booking => booking.eventDate && !["CANCELLED", "DECLINED"].includes(booking.status));
        datedBookings.forEach(booking => {
            const month = Number(String(booking.eventDate).slice(5, 7)) - 1;
            if (month >= 0 && month < 12) monthly[month]++;
        });
        const maxCount = Math.max(...monthly, 1);
        analytics.innerHTML = monthNames.map((month, index) => {
            const count = monthly[index];
            const height = count ? Math.max(10, Math.round((count / maxCount) * 100)) : 4;
            return `<div class="month-bar" title="${month}: ${count} event${count === 1 ? "" : "s"}"><span class="month-bar-count">${count || ""}</span><i style="height:${height}%"></i><small>${month}</small></div>`;
        }).join("");
        const countLabel = document.getElementById("analyticsBookingCount");
        const insight = document.getElementById("peakSeasonInsight");
        if (countLabel) countLabel.textContent = `${datedBookings.length} event dates`;

        const approvedBookings = bookings.filter(booking => String(booking.status || "").toUpperCase() === "APPROVED");
        const decidedBookings = bookings.filter(booking => ["APPROVED", "DECLINED"].includes(String(booking.status || "").toUpperCase()));
        const approvalRate = decidedBookings.length ? Math.round((approvedBookings.length / decidedBookings.length) * 100) : null;
        const collected = payments.reduce((sum, payment) => sum + (Number(payment.paid) || 0), 0);
        const outstanding = approvedBookings.reduce((sum, booking) => {
            const payment = payments.find(item => item.bookingId === booking.id);
            return sum + Math.max(0, (Number(payment?.total ?? booking.amount) || 0) - (Number(payment?.paid ?? booking.down_payment_amount) || 0));
        }, 0);
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setDate(nextMonth.getDate() + 30);
        const next30Days = approvedBookings.filter(booking => {
            const eventDate = booking.eventDate ? new Date(`${booking.eventDate}T00:00:00`) : null;
            return eventDate && !Number.isNaN(eventDate.getTime()) && eventDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && eventDate <= nextMonth;
        }).length;
        const summary = document.getElementById("dashboardAnalyticsSummary");
        if (summary) summary.innerHTML = `
            <div class="analytics-metric"><span>Approval rate</span><strong>${approvalRate === null ? "—" : `${approvalRate}%`}</strong><small>${decidedBookings.length} decided requests</small></div>
            <div class="analytics-metric"><span>Payments received</span><strong>${money(collected)}</strong><small>Recorded to date</small></div>
            <div class="analytics-metric"><span>Approved balance</span><strong>${money(outstanding)}</strong><small>Remaining on approved bookings</small></div>
            <div class="analytics-metric"><span>Events in 30 days</span><strong>${next30Days}</strong><small>Approved events coming up</small></div>`;

        const statusList = document.getElementById("dashboardStatusAnalytics");
        if (statusList) {
            const statusCounts = ["PENDING", "APPROVED", "DECLINED"].map(status => ({
                status,
                count: bookings.filter(booking => String(booking.status || "").toUpperCase() === status).length
            }));
            const totalStatus = statusCounts.reduce((sum, item) => sum + item.count, 0);
            statusList.innerHTML = statusCounts.map(item => {
                const percent = totalStatus ? Math.round(item.count / totalStatus * 100) : 0;
                return `<div class="analytics-status-row"><span>${item.status}</span><div class="analytics-status-track"><i class="analytics-status-${item.status.toLowerCase()}" style="width:${percent}%"></i></div><strong>${item.count}</strong></div>`;
            }).join("");
        }

        if (insight) {
            const peakCount = Math.max(...monthly);
            const peakIndex = monthly.indexOf(peakCount);
            insight.textContent = datedBookings.length < 3
                ? "Peak season estimate will appear after at least 3 event bookings are recorded."
                : `Busiest recorded month: ${monthNames[peakIndex]} (${peakCount} event${peakCount === 1 ? "" : "s"}). Use this as a planning signal, not a guaranteed forecast.`;
        }
    }
}

function bookingMessageField(message, fieldName) {
    const match = String(message || "").match(new RegExp(`^${fieldName}:\\s*(.*)$`, "im"));
    return match?.[1]?.trim() || "";
}

function bookingClientNotes(message) {
    const text = String(message || "").trim();
    if (!text) return "";
    const requestMatch = text.match(/^Additional requests:\s*([\s\S]*?)(?=\n\s*\n|$)/im);
    if (requestMatch) return requestMatch[1].trim();
    return text.split(/\r?\n/)
        .filter(line => !/^(Selected package|Venue city|Event venue|Estimated travel expense|Theme|Preferred colors|Reservation fee payment reference):/i.test(line.trim()))
        .join("\n")
        .trim();
}

let activeBookingMenuId = null;
let activeBookingMenuTrigger = null;
document.getElementById("bookingActionsPopover")?.addEventListener("toggle", event => {
    if (event.newState === "closed") {
        activeBookingMenuTrigger?.setAttribute("aria-expanded", "false");
        activeBookingMenuTrigger = null;
        activeBookingMenuId = null;
    }
});

function closeBookingActions() {
    const popover = document.getElementById("bookingActionsPopover");
    if (popover?.matches(":popover-open")) popover.hidePopover();
    activeBookingMenuTrigger?.setAttribute("aria-expanded", "false");
    activeBookingMenuTrigger = null;
    activeBookingMenuId = null;
}

// The popover is positioned against the viewport, so dismiss it when its
// trigger can move during a page or nested-container scroll.
window.addEventListener("scroll", closeBookingActions, true);
window.addEventListener("resize", closeBookingActions);

function toggleBookingActions(event, bookingId, trigger) {
    event.preventDefault();
    event.stopPropagation();
    const popover = document.getElementById("bookingActionsPopover");
    if (!popover) return;
    if (popover.matches(":popover-open") && activeBookingMenuId === bookingId) {
        closeBookingActions();
        return;
    }

    closeBookingActions();
    const booking = bookings.find(item => String(item.id) === String(bookingId));
    if (!booking) return;

    const actions = [{ label: "View details", className: "edit", run: () => viewBooking(booking.id) }];
    if (booking.status === "PENDING") {
        actions.push(
            { label: "Approve", className: "approve", run: () => changeStatus(booking.id, "APPROVED") },
            { label: "Decline", className: "decline", run: () => changeStatus(booking.id, "DECLINED") }
        );
    } else if (booking.status === "APPROVED") {
        actions.push(
            { label: "Resend approval email", className: "edit", run: () => resendBookingApprovalEmail(booking.id) },
            { label: "Cancel booking", className: "decline", run: () => requestCancelBooking(booking.id) }
        );
    }

    popover.replaceChildren();
    actions.forEach(action => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `booking-actions-item ${action.className}`;
        button.setAttribute("role", "menuitem");
        button.textContent = action.label;
        button.addEventListener("click", () => {
            closeBookingActions();
            action.run();
        });
        popover.appendChild(button);
    });

    activeBookingMenuId = bookingId;
    activeBookingMenuTrigger = trigger;
    trigger.setAttribute("aria-expanded", "true");
    popover.showPopover();
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = popover.getBoundingClientRect();
    const edge = 8;
    const left = Math.max(edge, Math.min(triggerRect.right - menuRect.width, window.innerWidth - menuRect.width - edge));
    const belowTop = triggerRect.bottom + 6;
    const top = belowTop + menuRect.height <= window.innerHeight - edge
        ? belowTop
        : Math.max(edge, triggerRect.top - menuRect.height - 6);
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
}

function toggleOcularActions(event, requestId, trigger) {
    event.preventDefault();
    event.stopPropagation();
    const popover = document.getElementById("bookingActionsPopover");
    if (!popover) return;

    const menuId = `ocular:${requestId}`;
    if (popover.matches(":popover-open") && activeBookingMenuId === menuId) {
        closeBookingActions();
        return;
    }

    closeBookingActions();
    const request = quotationRequests.find(item => String(item.id) === String(requestId));
    if (!request) return;

    const status = String(request.status || "REQUESTED").toUpperCase();
    const actions = [{ label: "View details", className: "edit", run: () => viewQuotation(request.id) }];
    if (status === "APPROVED") {
        actions.push(
            { label: "Resend approval email", className: "edit", run: () => resendOcularApprovalEmail(request.id) },
            { label: "Cancel", className: "decline", run: () => confirmOcularInspectionStatus(request.id, "CANCELLED") }
        );
    } else if (status === "REQUESTED") {
        actions.push(
            { label: "Approve", className: "approve", run: () => confirmOcularInspectionStatus(request.id, "APPROVED") },
            { label: "Decline", className: "decline", run: () => confirmOcularInspectionStatus(request.id, "DECLINED") }
        );
    }

    popover.replaceChildren();
    actions.forEach(action => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `booking-actions-item ${action.className}`;
        button.setAttribute("role", "menuitem");
        button.textContent = action.label;
        button.addEventListener("click", () => {
            closeBookingActions();
            action.run();
        });
        popover.appendChild(button);
    });

    activeBookingMenuId = menuId;
    activeBookingMenuTrigger = trigger;
    trigger.setAttribute("aria-expanded", "true");
    popover.showPopover();
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = popover.getBoundingClientRect();
    const edge = 8;
    const left = Math.max(edge, Math.min(triggerRect.right - menuRect.width, window.innerWidth - menuRect.width - edge));
    const belowTop = triggerRect.bottom + 6;
    const top = belowTop + menuRect.height <= window.innerHeight - edge
        ? belowTop
        : Math.max(edge, triggerRect.top - menuRect.height - 6);
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
}

function renderBookings() {
    const q = (document.getElementById("bookingSearch").value || "").toLowerCase();
    const f = document.getElementById("bookingStatusFilter").value;
    const rows = bookings.filter(b => {
        const matches = !q || [b.fullName, b.email, b.eventType, b.package, b.id, b.message].join(" ").toLowerCase().includes(q);
        const upcoming = b.status === "APPROVED" && new Date(b.eventDate) >= new Date(new Date().toDateString());
        const matchesStatus = f === "ALL" || (f === "UPCOMING" ? upcoming : b.status === f);
        return matches && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const emptyBookings = document.getElementById("emptyBookings");
    emptyBookings.style.display = rows.length ? "none" : "block";
    if (!rows.length) {
        emptyBookings.textContent = bookings.length
            ? "No bookings match the current search or status filter."
            : "No bookings are visible to this admin account. If Supabase Table Editor shows records, apply the admin booking access policies.";
    }
    document.getElementById("bookingTableBody").innerHTML = rows.map(b =>`
        <tr>
            <td><strong>${escapeHtml(b.fullName)}</strong><br><small>${escapeHtml(b.email)}</small></td>
            <td>${escapeHtml(b.eventType)}</td><td>${escapeHtml(b.eventDate)}</td>
            <td>${escapeHtml(b.package || "Not selected")}</td>
            <td class="booking-style-cell"><span><strong>Theme</strong> ${escapeHtml(bookingMessageField(b.message, "Theme") || "Not specified")}</span><span><strong>Colors</strong> ${escapeHtml(bookingMessageField(b.message, "Preferred colors") || "Not specified")}</span></td>
            <td>${escapeHtml(b.timeSlot || "")} ${escapeHtml(b.startTime || "")}</td>
            <td><span class="status ${statusClass(b.status)}">${escapeHtml(b.status)}</span></td>
            <td class="booking-actions-cell"><button type="button" class="booking-actions-trigger" onclick="toggleBookingActions(event, '${escapeAttr(b.id)}', this)" aria-haspopup="menu" aria-controls="bookingActionsPopover" aria-expanded="false" aria-label="Actions for ${escapeAttr(b.fullName)}" title="More actions"><span aria-hidden="true">⋮</span></button></td>
        </tr>`).join("");
}

function renderArchive() {
    const cancelled = bookings
        .filter(booking => booking.status === "CANCELLED")
        .sort((a, b) => new Date(b.updated_at || b.createdAt || 0) - new Date(a.updated_at || a.createdAt || 0));
    const empty = document.getElementById("emptyArchive");
    if (!empty) return;
    empty.style.display = cancelled.length ? "none" : "block";
    document.getElementById("archiveTableBody").innerHTML = cancelled.map(booking => `
        <tr>
            <td><strong>${escapeHtml(booking.fullName)}</strong><br><small>${escapeHtml(booking.email)}</small></td>
            <td>${escapeHtml(booking.eventType)}</td>
            <td>${escapeHtml(booking.eventDate)}<br><small>${escapeHtml(booking.timeSlot || "")} ${escapeHtml(booking.startTime || "")}</small></td>
            <td>${escapeHtml(booking.package || "Not selected")}</td>
            <td class="archive-record">${escapeHtml(bookingMessageField(booking.adminNotes, "Cancellation reason") || "No cancellation reason recorded")}</td>
            <td><button class="small-btn edit" onclick="viewBooking('${escapeAttr(booking.id)}')">View record</button></td>
        </tr>`).join("");
    const expenseArchiveEmpty = document.getElementById("emptyExpenseArchive");
    if (expenseArchiveEmpty) {
        expenseArchiveEmpty.style.display = archivedExpenses.length ? "none" : "block";
        document.getElementById("archivedExpenseTableBody").innerHTML = archivedExpenses
            .slice()
            .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
            .map(expense => `<tr><td><strong>${escapeHtml(expense.description)}</strong></td><td>${escapeHtml(expense.date || "—")}</td><td>${money(expense.amount)}</td><td>${escapeHtml(expense.archivedAt ? new Date(expense.archivedAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—")}</td></tr>`)
            .join("");
    }
}

function renderPayments() {
    syncPayments();
    const approved = bookings.filter(b => b.status === "APPROVED" || b.status === "CANCELLED");
    const filter = document.getElementById("paymentStatusFilter")?.value || "ALL";
    const contract = approved.reduce((s, b) => s + Number((payments.find(p => p.bookingId === b.id) || {}).total || b.amount || 0), 0);
    const collected = approved.reduce((s, b) => s + Number((payments.find(p => p.bookingId === b.id) || {}).paid || 0), 0);
    document.getElementById("paymentTotal").textContent = money(contract);
    document.getElementById("paymentCollected").textContent = money(collected);
    document.getElementById("paymentOutstanding").textContent = money(contract - collected);
    const visiblePayments = approved.filter(b => {
        const status = (payments.find(p => p.bookingId === b.id) || {}).status || "NO DOWN PAYMENT";
        if (filter === "UNPAID") return status === "NO DOWN PAYMENT";
        if (filter === "PARTIAL") return status === "PARTIAL PAYMENT" || status === "DOWN PAYMENT MADE";
        if (filter === "PAID") return status === "FULLY PAID";
        return true;
    });
    const emptyPayments = document.getElementById("emptyPayments");
    emptyPayments.style.display = visiblePayments.length ? "none" : "block";
    emptyPayments.textContent = approved.length
        ? "No payments match this status filter."
        : "No payment records yet.";
    document.getElementById("paymentTableBody").innerHTML = visiblePayments.map(b => {
        const p = payments.find(x => x.bookingId === b.id) || { total: Number(b.amount) || 0, paid: 0, status: "NO DOWN PAYMENT" };
        return `<tr><td><strong>${escapeHtml(b.fullName)}</strong></td><td>${escapeHtml(b.eventType)}</td><td>${escapeHtml(b.eventDate)}</td><td>${money(p.total)}</td><td>${money(p.paid)}</td><td>${money(Number(p.total) - Number(p.paid))}</td><td><span class="status ${p.status === "FULLY PAID" ? "APPROVED" : p.status === "NO DOWN PAYMENT" ? "PENDING" : "APPROVED"}">${escapeHtml(p.status)}</span></td><td><button class="small-btn edit" onclick="editPayment('${b.id}')">Update</button></td></tr>`;
    }).join("");
}

function renderSales() {
    const revenue = payments.reduce((s, p) => s + Number(p.paid || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthPicker = document.getElementById("salesAnalyticsMonth");
    if (monthPicker && !monthPicker.value) monthPicker.value = currentMonth;
    const selectedMonth = monthPicker?.value || currentMonth;
    const selectedYear = Number(selectedMonth.slice(0, 4)) || now.getFullYear();
    document.getElementById("salesRevenue").textContent = money(revenue);
    document.getElementById("salesExpenses").textContent = money(totalExpenses);
    document.getElementById("salesNet").textContent = money(revenue - totalExpenses);
    document.getElementById("salesTableBody").innerHTML = bookings.filter(b => String(b.status).toUpperCase() === "APPROVED" && payments.some(p => p.bookingId === b.id)).map(b => {
        const p = payments.find(x => x.bookingId === b.id) || {};
        return `<tr><td>${escapeHtml(b.fullName)}</td><td>${escapeHtml(b.eventType)}</td><td>${money(p.total)}</td><td>${money(p.paid)}</td><td>${money(Number(p.total) - Number(p.paid))}</td></tr>`;
    }).join("");
    document.getElementById("expenseList").innerHTML = expenses.length ? expenses.map((e, i) => `<div class="expense-item"><span>${escapeHtml(e.description)}<small> • ${escapeHtml(e.date || "")}</small></span><strong>${money(e.amount)}</strong><div class="expense-actions"><button type="button" class="small-btn edit" onclick="openExpenseForm(${i})">Edit</button><button type="button" class="small-btn" onclick="archiveExpense(${i})">Archive</button></div></div>`).join("") : '<div class="empty-state">No expenses recorded.</div>';
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenseTotals = Array(12).fill(0);
    bookings.forEach(booking => {
        const match = String(booking.eventDate || "").match(/^(\d{4})-(\d{2})/);
        if (!match || Number(match[1]) !== selectedYear || String(booking.status).toUpperCase() !== "APPROVED") return;
        const monthIndex = Number(match[2]) - 1;
        monthlyIncome[monthIndex] += Number(payments.find(payment => payment.bookingId === booking.id)?.paid || 0);
    });
    [...expenses, ...archivedExpenses].forEach(expense => {
        const match = String(expense.date || "").match(/^(\d{4})-(\d{2})/);
        if (!match || Number(match[1]) !== selectedYear) return;
        monthlyExpenseTotals[Number(match[2]) - 1] += Number(expense.amount || 0);
    });
    const monthlyNet = monthlyIncome.map((income, index) => income - monthlyExpenseTotals[index]);
    const peakNet = Math.max(...monthlyNet);
    const peakIndex = monthlyNet.indexOf(peakNet);
    const scale = Math.max(...monthlyNet.map(value => Math.abs(value)), 1);
    const monthNames = Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat("en-PH", { month: "short" }).format(new Date(selectedYear, index, 1)));
    const compactMoney = value => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", notation: "compact", maximumFractionDigits: 1 }).format(value);
    document.getElementById("salesAnalyticsMonthLabel").textContent = `Net income by month for ${selectedYear}`;
    document.getElementById("monthlyNetIncomeChart").innerHTML = monthlyNet.map((value, index) => {
        const height = value === 0 ? 2 : Math.max(4, Math.abs(value) / scale * 100);
        const selected = String(index + 1).padStart(2, "0") === selectedMonth.slice(5, 7);
        const peak = index === peakIndex;
        const chartTitle = `${monthNames[index]} ${selectedYear} · Income ${money(monthlyIncome[index])} · Expenses ${money(monthlyExpenseTotals[index])} · Net ${money(value)}`;
        return `<div class="monthly-net-column${selected ? " is-selected" : ""}${peak ? " is-peak" : ""}" title="${escapeAttr(chartTitle)}" aria-label="${escapeAttr(chartTitle)}"><span class="monthly-net-value">${escapeHtml(compactMoney(value))}</span><span class="monthly-net-bar-track"><i class="monthly-net-bar${value < 0 ? " is-negative" : ""}" style="height:${height}%"></i></span><span class="monthly-net-month">${escapeHtml(monthNames[index])}</span></div>`;
    }).join("");
    const hasYearRecords = monthlyIncome.some(value => value !== 0) || monthlyExpenseTotals.some(value => value !== 0);
    document.getElementById("monthlyNetIncomePeak").textContent = hasYearRecords
        ? `Highest net income: ${monthNames[peakIndex]} ${selectedYear} · ${money(peakNet)}`
        : `No income or expenses recorded for ${selectedYear}.`;
    const monthlyBookingCount = bookings.filter(booking => String(booking.eventDate || "").slice(0, 7) === selectedMonth && String(booking.status).toUpperCase() === "APPROVED").length;
    const monthlyExpenseCount = [...expenses, ...archivedExpenses].filter(expense => String(expense.date || "").slice(0, 7) === selectedMonth).length;
    document.getElementById("monthlyEventsCount").textContent = `${monthlyBookingCount} ${monthlyBookingCount === 1 ? "booking" : "bookings"} · ${monthlyExpenseCount} ${monthlyExpenseCount === 1 ? "expense" : "expenses"}`;
}

function openMonthlyActivityReport() {
    const selectedMonth = document.getElementById("salesAnalyticsMonth")?.value;
    if (!selectedMonth) return;
    const monthDate = new Date(`${selectedMonth}-01T00:00:00`);
    const monthLabel = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(monthDate);
    const reportBookings = bookings
        .filter(booking => String(booking.eventDate || "").slice(0, 7) === selectedMonth && String(booking.status).toUpperCase() === "APPROVED")
        .sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")) || String(a.startTime || "").localeCompare(String(b.startTime || "")));
    const reportExpenses = [...expenses, ...archivedExpenses]
        .filter(expense => String(expense.date || "").slice(0, 7) === selectedMonth)
        .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
    const eventIncome = reportBookings
        .reduce((sum, booking) => sum + Number(payments.find(payment => payment.bookingId === booking.id)?.paid || 0), 0);
    const expenseTotal = reportExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";
    const bookingRows = reportBookings.map(booking => {
        const payment = payments.find(item => item.bookingId === booking.id) || {};
        return `<tr><td>${escapeHtml(dateLabel(booking.eventDate))}<br><small>${escapeHtml(booking.timeSlot || "")} ${escapeHtml(booking.startTime || "")}</small></td><td><strong>${escapeHtml(booking.fullName || "Client")}</strong></td><td>${escapeHtml(booking.eventType || "Event")}<br><small>${escapeHtml(booking.package || "Not selected")} · ${escapeHtml(booking.guests ?? "")} guests</small></td><td><span class="status ${statusClass(booking.status)}">${escapeHtml(booking.status || "UNKNOWN")}</span></td><td>${money(payment.total || booking.amount || 0)}</td><td>${money(payment.paid || 0)}</td></tr>`;
    }).join("");
    const expenseRows = reportExpenses.map(expense => `<tr><td>${escapeHtml(dateLabel(expense.date))}</td><td><strong>${escapeHtml(expense.description)}</strong></td><td>${money(expense.amount)}</td><td><span class="monthly-report-record-status">${expense.archivedAt ? "Archived" : "Recorded"}</span></td></tr>`).join("");
    openModal(`<div class="monthly-activity-report"><div class="monthly-report-header"><span class="badge">MONTHLY REPORT</span><h3>${escapeHtml(monthLabel)} Activity</h3><p>Bookings and expenses recorded for this month.</p></div><div class="monthly-report-summary"><article><span>Event income</span><strong>${money(eventIncome)}</strong></article><article><span>Expenses</span><strong>${money(expenseTotal)}</strong></article><article><span>Net income</span><strong>${money(eventIncome - expenseTotal)}</strong></article></div><section><div class="panel-head"><h4>Bookings (${reportBookings.length})</h4></div><div class="table-wrap"><table><thead><tr><th>Date & time</th><th>Client</th><th>Event</th><th>Status</th><th>Total</th><th>Paid</th></tr></thead><tbody>${bookingRows || ""}</tbody></table></div>${reportBookings.length ? "" : '<div class="empty-state">No bookings for this month.</div>'}</section><section><div class="panel-head"><h4>Expenses (${reportExpenses.length})</h4></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Record</th></tr></thead><tbody>${expenseRows || ""}</tbody></table></div>${reportExpenses.length ? "" : '<div class="empty-state">No expenses for this month.</div>'}</section></div>`);
    document.querySelector("#modal .modal-card").classList.add("monthly-activity-modal-card");
}

function renderInventory() {
    document.getElementById("inventoryTableBody").innerHTML = inventory.map(i => {
        const low = Number(i.quantity) <= Number(i.reorder);
        return `<tr><td><strong>${escapeHtml(i.name)}</strong></td><td>${escapeHtml(i.category)}</td><td>${i.quantity}</td><td>${escapeHtml(i.unit)}</td><td>${money(i.cost)}</td><td>${money(Number(i.quantity) * Number(i.cost))}</td><td><span class="status ${low ? "CANCELLED" : "APPROVED"}">${low ? "LOW STOCK" : "AVAILABLE"}</span></td><td><button class="small-btn edit" onclick="editInventory(${i.id})">Update</button></td></tr>`;
    }).join("");
}

function expenseMonthKey(dateValue) {
    const match = String(dateValue || "").match(/^(\d{4})-(\d{2})/);
    return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null;
}
function archiveExpiredExpenses() {
    const now = new Date();
    const currentMonthKey = now.getFullYear() * 12 + now.getMonth();
    const expired = expenses.filter(expense => {
        const monthKey = expenseMonthKey(expense.date);
        return monthKey !== null && monthKey < currentMonthKey;
    });
    if (!expired.length) return false;
    const expiredSet = new Set(expired);
    const archivedAt = now.toISOString();
    archivedExpenses.push(...expired.map(expense => ({ ...expense, archivedAt })));
    expenses = expenses.filter(expense => !expiredSet.has(expense));
    save();
    return true;
}
function renderAll() {
    archiveExpiredExpenses();
    renderDashboard(); renderBookings(); renderArchive(); renderPayments(); renderSales(); renderInventory();
}
function scheduleExpenseArchive() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 2);
    const untilMonthChange = Math.max(1000, nextMonth.getTime() - now.getTime());
    window.setTimeout(() => {
        if (archiveExpiredExpenses()) { renderArchive(); renderSales(); }
        scheduleExpenseArchive();
    }, Math.min(24 * 60 * 60 * 1000, untilMonthChange));
}

async function changeStatus(id, newStatus) {
    const b = bookings.find(x => x.id === id); if (!b) return;
    const reservationFee = Number(b.required_down_payment) || 0;
    const existingPayment = payments.find(p => p.bookingId === id);
    const verifiedPayment = newStatus === "APPROVED"
        ? Math.max(Number(b.down_payment_amount) || 0, reservationFee, Number(existingPayment?.paid) || 0)
        : Number(b.down_payment_amount) || 0;
    const bookingUpdate = { status: newStatus };
    if (newStatus === "APPROVED" && reservationFee > 0) bookingUpdate.down_payment_amount = verifiedPayment;

    const { error } = await window.supabaseClient
        .from("bookings")
        .update(bookingUpdate)
        .eq("id", id);
    if (error) { showAdminToast(`Unable to update booking status: ${error.message}`, "error"); return; }
    b.status = newStatus;
    if (newStatus === "APPROVED") {
        b.down_payment_amount = verifiedPayment;
        let payment = payments.find(p => p.bookingId === id);
        if (!payment) {
            payment = { bookingId: id, total: Number(b.amount) || 0, paid: verifiedPayment, status: "NO DOWN PAYMENT" };
            payments.push(payment);
        }
        payment.total = Number(b.amount) || Number(payment.total) || 0;
        payment.paid = verifiedPayment;
        payment.status = verifiedPayment <= 0
            ? "NO DOWN PAYMENT"
            : verifiedPayment >= payment.total
                ? "FULLY PAID"
                : "DOWN PAYMENT MADE";
    }
    save(); renderAll();
    let emailNotice = "";
    if (newStatus === "APPROVED") {
        const { data: emailResult, error: emailError } = await window.supabaseClient.functions.invoke("send-booking-approval-email", {
            body: { bookingId: id }
        });
        if (emailError) {
            console.warn("Booking approved, but the customer email was not sent.", emailError);
            let providerMessage = emailResult?.error;
            if (!providerMessage && typeof emailError.context?.clone === "function") {
                try { providerMessage = (await emailError.context.clone().json())?.error; } catch { /* Keep the fallback notice. */ }
            }
            emailNotice = " The account notification was saved, but the customer email was not sent" + (providerMessage ? ": " + providerMessage : ".");
        }
    }
    showAdminToast(`Booking ${id} is now ${newStatus}.${emailNotice}`, emailNotice ? "error" : "success");
}
async function resendBookingApprovalEmail(id) {
    const booking = bookings.find(item => String(item.id) === String(id));
    if (!booking) return;

    const { data, error } = await window.supabaseClient.functions.invoke("send-booking-approval-email", {
        body: { bookingId: id }
    });
    if (error) {
        let message = data?.error;
        if (!message && typeof error.context?.clone === "function") {
            try { message = (await error.context.clone().json())?.error; } catch { /* Use the fallback below. */ }
        }
        showAdminToast(message || "The approval email could not be sent.", "error");
        return;
    }
    showAdminToast(`Approval email sent to ${booking.email || "the customer"}.`);
}

function requestCancelBooking(id) {
    const booking = bookings.find(item => item.id === id);
    if (!booking) return;
    openModal(`<h3>Cancel booking</h3>
        <p class="field-help">Add the reason for cancellation. The booking record and reason will be kept in the Archive.</p>
        <div class="modal-field full"><label for="cancellationReason">Cancellation reason</label><textarea id="cancellationReason" rows="4" maxlength="1000" placeholder="Enter the reason for cancellation"></textarea></div>
        <div class="modal-actions"><button class="btn primary" onclick="confirmCancelBooking('${escapeAttr(id)}')">Confirm cancellation</button></div>`);
}

async function confirmCancelBooking(id) {
    const booking = bookings.find(item => item.id === id);
    const reason = document.getElementById("cancellationReason")?.value.trim() || "";
    if (!booking || !reason) {
        showAdminToast("Enter a cancellation reason to keep with the archived booking.", "error");
        return;
    }
    const loggedAt = new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
    const cancellationEntry = `Cancellation reason: ${reason}\nCancelled by admin on: ${loggedAt}`;
    const notes = [cancellationEntry, booking.adminNotes].filter(Boolean).join("\n\n");
    const { error } = await window.supabaseClient
        .from("bookings")
        .update({ status: "CANCELLED", admin_notes: notes })
        .eq("id", id);
    if (error) {
        showAdminToast(error.message || "Unable to cancel this booking.", "error");
        return;
    }
    booking.status = "CANCELLED";
    booking.adminNotes = notes;
    closeModal();
    renderAll();
    showAdminToast("Booking cancelled and saved in the Archive.");
}

async function deleteBooking(id) {
    if (!confirm("Delete this cancelled booking?")) return;
    const { error } = await window.supabaseClient.from("bookings").delete().eq("id", id);
    if (error) { alert(`Unable to delete booking: ${error.message}`); return; }
    bookings = bookings.filter(b => b.id !== id); payments = payments.filter(p => p.bookingId !== id); save(); renderAll();
}

async function viewBooking(id) {
    const b = bookings.find(x => x.id === id); if (!b) return;
    const recordField = (label, value) => `<div class="booking-record-field"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "—")}</dd></div>`;
    const status = String(b.status || "PENDING").toLowerCase().replace(/\s+/g, "-");
    const clientNotes = bookingClientNotes(b.message);
    openModal(`<div class="booking-record">
        <header class="booking-record-header">
            <div class="booking-record-brand"><img src="kqlogo.png" alt="KQ Event Styling official logo"><span>OFFICIAL BOOKING RECORD</span></div>
            <div class="booking-record-heading"><div><span class="booking-record-kicker">CLIENT SERVICE RECORD</span><h3>Booking Details</h3></div><span class="booking-status-chip status-${escapeAttr(status)}">${escapeHtml(b.status || "PENDING")}</span></div>
            <div class="booking-record-reference"><span>REFERENCE NO.</span><strong>${escapeHtml(b.id || "—")}</strong></div>
        </header>
        <section class="booking-record-section"><div class="booking-record-section-title"><span>01</span><h4>Client Information</h4></div><dl class="booking-record-grid">
            ${recordField("Client name", b.fullName)}${recordField("Email address", b.email)}${recordField("Contact number", b.phone)}
        </dl></section>
        <section class="booking-record-section"><div class="booking-record-section-title"><span>02</span><h4>Event Details</h4></div><dl class="booking-record-grid">
            ${recordField("Event type", b.eventType)}${recordField("Event date", b.eventDate)}${recordField("Guest count", b.guests)}${recordField("Time preference", b.timeSlot)}${recordField("Start time", b.startTime)}${recordField("Package", b.package)}${recordField("Theme", bookingMessageField(b.message, "Theme") || "Not provided")}${recordField("Preferred colors", bookingMessageField(b.message, "Preferred colors") || "Not provided")}
        </dl></section>
        <section class="booking-record-section"><div class="booking-record-section-title"><span>03</span><h4>Package & Payment</h4></div><div class="booking-payment-summary">
            <div><span>Agreed total</span><strong>${money(b.amount)}</strong></div><div><span>Reservation fee (30%)</span><strong>${money(b.required_down_payment)}</strong></div><div><span>Payment received</span><strong>${money(b.down_payment_amount)}</strong></div>
        </div>${b.ai_estimated_package ? `<p class="booking-record-footnote">AI package suggestion: ${escapeHtml(b.ai_estimated_package)} — ${money(b.ai_estimated_price)}</p>` : ""}</section>
        <section class="booking-record-section"><div class="booking-record-section-title"><span>04</span><h4>Client Notes & Requests</h4><span class="booking-record-readonly-label">Read only</span></div><div class="booking-record-message">${clientNotes ? escapeHtml(clientNotes).replace(/\n/g, "<br>") : "No additional notes were provided by the client."}</div></section>
        ${b.design_image_path ? `<section class="booking-record-section"><div class="booking-record-section-title"><span>05</span><h4>Customer Design Reference</h4></div><p id="adminDesignImageStatus" class="field-help">Loading private design image…</p><img id="adminDesignImage" class="admin-design-preview" alt="Customer-uploaded design reference" hidden></section>` : ""}
        ${Array.isArray(b.ai_detected_features) && b.ai_detected_features.length ? `<section class="booking-record-section"><div class="booking-record-section-title"><span>06</span><h4>Design Estimate Notes</h4></div><p>${escapeHtml(b.ai_estimate_explanation || "Estimated from the visible design features.")}</p><ul class="admin-design-features">${b.ai_detected_features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}</ul><small class="field-help">AI estimate only; confirm final package and price with the customer.</small></section>` : ""}
        ${b.adminNotes ? `<section class="booking-record-section booking-record-notes"><div class="booking-record-section-title"><span>✎</span><h4>Internal Notes</h4><span class="booking-record-readonly-label">Admin only</span></div><p class="booking-record-message">${escapeHtml(b.adminNotes).replace(/\n/g, "<br>")}</p></section>` : ""}
        <footer class="booking-record-footer"><span>Keep this reference number for booking inquiries.</span><button type="button" class="btn primary" onclick="closeModal()">Okay</button></footer>
    </div>`);
    document.querySelector("#modal .modal-card")?.classList.add("booking-record-modal-card");
    if (b.design_image_path) {
        const { data, error } = await window.supabaseClient.storage
            .from("booking-designs")
            .createSignedUrl(b.design_image_path, 60 * 10);
        const image = document.getElementById("adminDesignImage");
        const imageStatus = document.getElementById("adminDesignImageStatus");
        if (error || !data?.signedUrl || !image || !imageStatus) {
            if (imageStatus) imageStatus.textContent = "The private design image could not be opened. Check the Supabase storage policies.";
        } else {
            image.src = data.signedUrl;
            image.hidden = false;
            imageStatus.remove();
        }
    }
}

function editPayment(id) {
    const b = bookings.find(x => x.id === id), p = payments.find(x => x.bookingId === id); if (!b || !p) return;
    openModal(`<h3>Update Payment</h3>
        <div class="modal-grid">
            <div class="modal-field"><label>Client</label><input value="${escapeAttr(b.fullName)}" readonly></div>
            <div class="modal-field"><label>Total Amount</label><input value="${money(p.total)}" readonly></div>
            <div class="modal-field"><label>Amount Paid</label><input type="number" id="paymentPaid" min="0" max="${Number(p.total)}" value="${Number(p.paid)}"></div>
            <div class="modal-field"><label>Payment Status</label>
                <select id="paymentStatus">
                    <option value="" selected disabled>Choose status</option>
                    <option value="FULLY PAID">FULLY PAID</option>
                </select>
                <small class="field-help">Current status: ${escapeHtml(p.status || "DOWN PAYMENT MADE")}</small>
            </div>
        </div>
        <div class="modal-actions"><button class="btn primary" onclick="savePayment('${id}')">Save Payment</button></div>`);
    const paidInput = document.getElementById("paymentPaid");
    const statusSelect = document.getElementById("paymentStatus");
    statusSelect.addEventListener("change", () => {
        if (statusSelect.value === "FULLY PAID") paidInput.value = Number(p.total);
    });
}

async function savePayment(id) {
    const p = payments.find(x => x.bookingId === id); if (!p) return;
    const selected = document.getElementById("paymentStatus").value;
    if (selected !== "FULLY PAID") {
        showAdminToast("Choose FULLY PAID to save this payment update.", "error");
        return;
    }
    const paid = Number(p.total);
    const status = "FULLY PAID";
    const { error } = await window.supabaseClient.from("bookings").update({ down_payment_amount: paid }).eq("id", id);
    if (error) { showAdminToast(error.message || "Unable to save payment update.", "error"); return; }
    p.paid = paid;
    p.status = status;
    p.updatedAt = new Date().toISOString();
    const booking = bookings.find(item => item.id === id);
    if (booking) { booking.down_payment_amount = paid; booking.payment_status = status; }
    save(); closeModal(); renderAll(); showAdminToast("Payment update saved.");
}

document.getElementById("addExpenseBtn").addEventListener("click", () => {
    openExpenseForm();
});
document.getElementById("salesAnalyticsMonth")?.addEventListener("change", renderSales);
document.getElementById("monthlyActivityView")?.addEventListener("click", openMonthlyActivityReport);
function openExpenseForm(index = null) {
    const expense = index === null ? null : expenses[index];
    if (index !== null && !expense) return;
    openModal(`<h3>${expense ? "Edit" : "Add"} Expense</h3><div class="modal-grid">
        <div class="modal-field full"><label>Description</label><input id="expenseDescription" value="${escapeAttr(expense?.description || "")}" placeholder="e.g. Balloons / Transportation"></div>
        <div class="modal-field"><label>Amount</label><input id="expenseAmount" type="number" min="0" step="0.01" value="${expense ? Number(expense.amount) : ""}" placeholder="0"></div>
        <div class="modal-field"><label>Date</label><input id="expenseDate" type="date" value="${escapeAttr(expense?.date || new Date().toISOString().slice(0, 10))}"></div>
    </div><div class="modal-actions"><button class="btn primary" onclick="saveExpense(${index === null ? "null" : index})">${expense ? "Save Changes" : "Add Expense"}</button></div>`);
}
function saveExpense(index = null) {
    const description = document.getElementById("expenseDescription").value.trim(), amount = Number(document.getElementById("expenseAmount").value) || 0, date = document.getElementById("expenseDate").value;
    if (!description || amount <= 0) { alert("Please enter a description and valid amount."); return }
    const expense = { description, amount, date };
    if (Number.isInteger(index) && expenses[index]) expenses[index] = expense;
    else expenses.push(expense);
    save(); closeModal(); renderAll();
}
function archiveExpense(i) {
    const expense = expenses[i];
    if (!expense) return;
    expenses.splice(i, 1);
    archivedExpenses.push({ ...expense, archivedAt: new Date().toISOString() });
    save(); renderAll();
}

document.getElementById("addInventoryBtn").addEventListener("click", () => openInventoryForm());
function openInventoryForm(item = null) {
    openModal(`<h3>${item ? "Update" : "Add"} Material</h3><div class="modal-grid">
        <div class="modal-field"><label>Material Name</label><input id="invName" value="${escapeAttr(item?.name || "")}"></div>
        <div class="modal-field"><label>Category</label><input id="invCategory" value="${escapeAttr(item?.category || "")}"></div>
        <div class="modal-field"><label>Quantity</label><input id="invQty" type="number" min="0" value="${item?.quantity ?? ""}"></div>
        <div class="modal-field"><label>Unit</label><input id="invUnit" value="${escapeAttr(item?.unit || "pcs")}"></div>
        <div class="modal-field"><label>Cost per Item</label><input id="invCost" type="number" min="0" value="${item?.cost ?? ""}"></div>
        <div class="modal-field"><label>Low Stock Threshold</label><input id="invReorder" type="number" min="0" value="${item?.reorder ?? 5}"></div>
    </div><div class="modal-actions"><button class="btn primary" onclick="saveInventory(${item?.id || "null"})">Save Material</button></div>`);
}
function saveInventory(id) {
    const data = { name: document.getElementById("invName").value.trim(), category: document.getElementById("invCategory").value.trim(), quantity: Number(document.getElementById("invQty").value) || 0, unit: document.getElementById("invUnit").value.trim(), cost: Number(document.getElementById("invCost").value) || 0, reorder: Number(document.getElementById("invReorder").value) || 0 };
    if (!data.name) { alert("Material name is required."); return }
    if (id) { const i = inventory.find(x => x.id === id); Object.assign(i, data) } else inventory.push({ id: Date.now(), ...data });
    save(); closeModal(); renderAll();
}
function editInventory(id) { openInventoryForm(inventory.find(x => x.id === id)) }

let modalReturnFocus = null;
function openModal(html) { const modal = document.getElementById("modal"); modalReturnFocus = document.activeElement instanceof HTMLElement && !modal.contains(document.activeElement) ? document.activeElement : modalReturnFocus; document.querySelector("#modal .modal-card").classList.remove("calendar-modal-card", "logout-confirmation-card", "booking-record-modal-card", "monthly-activity-modal-card", "request-history-modal-card", "ocular-request-modal-card", "ocular-action-confirmation-card"); document.getElementById("modalContent").innerHTML = html; modal.classList.remove("hidden"); modal.setAttribute("aria-hidden", "false") }
function closeModal() { const modal = document.getElementById("modal"); if (modal.contains(document.activeElement)) document.activeElement.blur(); modal.classList.add("hidden"); modal.setAttribute("aria-hidden", "true"); document.querySelector("#modal .modal-card").classList.remove("calendar-modal-card", "logout-confirmation-card", "booking-record-modal-card", "monthly-activity-modal-card", "ocular-action-confirmation-card"); const returnFocus = modalReturnFocus; modalReturnFocus = null; if (returnFocus?.isConnected) returnFocus.focus() }
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal() });

document.getElementById("bookingSearch").addEventListener("input", renderBookings);
document.getElementById("bookingStatusFilter").addEventListener("change", renderBookings);
document.getElementById("paymentStatusFilter").addEventListener("change", renderPayments);

function renderAdminCalendar(calendarType) {
    const now = new Date(), year = now.getFullYear(), month = now.getMonth(), first = new Date(year, month, 1), last = new Date(year, month + 1, 0);
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const isOcular = calendarType === "ocular";
    const calendarItems = isOcular
        ? quotationRequests
            .filter(request => String(request.status || "").toUpperCase() === "APPROVED" && request.inspection_date)
            .map(request => ({ name: request.customer_name, date: request.inspection_date, time: request.inspection_time || "Time not set", label: "Ocular inspection" }))
        : bookings
            .filter(booking => String(booking.status || "").toUpperCase() === "APPROVED")
            .map(booking => ({ name: booking.fullName, date: booking.eventDate, time: booking.startTime || booking.timeSlot || "Time not set", label: booking.eventType || "Event" }));
    const monthlyCount = calendarItems.filter(item => item.date?.startsWith(monthPrefix)).length;
    const calendarTitle = isOcular ? "OCULAR INSPECTION SCHEDULE" : "EVENT BOOKING SCHEDULE";
    const itemLabel = isOcular ? "ocular inspection" : "event booking";
    let html = `<div class="calendar-heading"><div><span class="calendar-eyebrow">${calendarTitle}</span><h3>${now.toLocaleString("en-US", { month: "long" })} ${year}</h3></div><span class="calendar-count">${monthlyCount} ${itemLabel}${monthlyCount === 1 ? "" : "s"} this month</span></div><div class="calendar-grid">`;
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => html += `<div class="calendar-weekday">${d}</div>`);
    for (let i = 0; i < first.getDay(); i++) html += `<div class="calendar-day calendar-day-empty" aria-hidden="true"></div>`;
    for (let d = 1; d <= last.getDate(); d++) {
        const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const events = calendarItems.filter(item => item.date === iso).sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));
        const localToday = new Date();
        const todayIso = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, "0")}-${String(localToday.getDate()).padStart(2, "0")}`;
        const today = iso === todayIso;
        html += `<div class="calendar-day${today ? " calendar-day-today" : ""}${events.length ? " calendar-day-booked" : ""}"><span class="calendar-date">${d}</span>${events.length ? `<div class="calendar-events">${events.map(item => `<div class="calendar-event${isOcular ? " calendar-event-ocular" : ""}"><strong>${escapeHtml(item.name || "Client")}</strong><span>${escapeHtml(item.time)}</span><span class="calendar-event-type">${escapeHtml(item.label)}</span><span class="calendar-event-status">APPROVED</span></div>`).join("")}</div>` : `<span class="calendar-open-label">Available</span>`}</div>`;
    }
    for (let i = 0, trailing = (7 - ((first.getDay() + last.getDate()) % 7)) % 7; i < trailing; i++) html += `<div class="calendar-day calendar-day-empty" aria-hidden="true"></div>`;
    html += `</div><p class="calendar-note"><span class="calendar-legend-dot${isOcular ? " calendar-legend-ocular" : ""}"></span> Only approved ${itemLabel}s are shown in this calendar.</p>`;
    openModal(html);
    document.querySelector("#modal .modal-card").classList.add("calendar-modal-card");
}

document.getElementById("calendarBtn").addEventListener("click", () => renderAdminCalendar("booking"));
document.getElementById("ocularCalendarBtn").addEventListener("click", () => renderAdminCalendar("ocular"));

function escapeHtml(v) { return String(v ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])) }
function escapeAttr(v) { return escapeHtml(v) }

renderAll();

// ========================================
// QUOTATION REQUEST MANAGEMENT
// SUPABASE
// ========================================

let quotationRequests = [];

const ADMIN_NOTIFICATION_READ_KEY = "kqAdminReadNotifications:v2";
let adminNotificationItems = [];
function getReadAdminNotificationKeys() {
    try { return new Set(JSON.parse(localStorage.getItem(ADMIN_NOTIFICATION_READ_KEY) || "[]")); }
    catch { return new Set(); }
}
function saveReadAdminNotificationKeys(keys) {
    try { localStorage.setItem(ADMIN_NOTIFICATION_READ_KEY, JSON.stringify([...keys])); }
    catch { /* Keep notification interactions usable if storage is unavailable. */ }
}
function markAdminNotificationRead(key) {
    if (!key) return;
    const readKeys = getReadAdminNotificationKeys();
    readKeys.add(key);
    saveReadAdminNotificationKeys(readKeys);
    updateAdminNotifications();
}
function formatAdminNotificationTime(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(date)
        : "New";
}
function updateAdminNotifications() {
    const button = document.getElementById("adminNotificationBtn");
    const countBadge = document.getElementById("adminNotificationCount");
    const summary = document.getElementById("adminNotificationSummary");
    const list = document.getElementById("adminNotificationsList");
    if (!button || !countBadge || !list) return;
    adminNotificationItems = [
        ...bookings.filter(item => item.status === "PENDING").map(item => ({
            key: `booking:${item.id || `${item.fullName || "Client"}:${item.eventDate || ""}:${item.eventType || ""}`}`,
            bookingId: item.id,
            kind: "booking",
            section: "bookings",
            notificationType: "New booking",
            title: `Booking request from ${item.fullName || "Client"}`,
            detail: `${item.eventType || "Event"} · ${item.eventDate || "Date not set"}`,
            createdAt: item.createdAt
        })),
        ...bookingChangeRequests.filter(item => String(item.status || "").toUpperCase() === "PENDING").map(item => {
            const booking = bookings.find(bookingItem => String(bookingItem.id) === String(item.booking_id));
            const isCancellation = String(item.request_type || "").toUpperCase() === "CANCELLATION";
            return {
                key: `change-request:${item.id}`,
                bookingId: item.booking_id,
                kind: "change-request",
                section: "bookings",
                notificationType: `${isCancellation ? "Cancellation" : "Reschedule"} request`,
                title: `${isCancellation ? "Cancellation" : "Reschedule"} request from ${booking?.fullName || "Client"}`,
                detail: `${booking?.eventType || "Event"} · ${isCancellation ? "Needs review" : `Requested ${item.requested_event_date || "new date"}`}`,
                createdAt: item.created_at
            };
        }),
        ...quotationRequests.filter(item => String(item.status || "").toUpperCase() === "REQUESTED").map(item => ({
            key: `ocular:${item.id || `${item.customer_name || "Client"}:${item.inspection_date || ""}:${item.venue_name || ""}`}`,
            kind: "ocular",
            section: "quotations",
            notificationType: "Ocular inspection",
            title: `Ocular inspection from ${item.customer_name || "Client"}`,
            detail: `${item.venue_name || "Venue not set"} · ${item.inspection_date || "Date not set"}`,
            createdAt: item.created_at
        }))
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const activeKeys = new Set(adminNotificationItems.map(item => item.key));
    const readKeys = getReadAdminNotificationKeys();
    const prunedReadKeys = new Set([...readKeys].filter(key => activeKeys.has(key)));
    if (prunedReadKeys.size !== readKeys.size) saveReadAdminNotificationKeys(prunedReadKeys);
    const unreadCount = adminNotificationItems.filter(item => !prunedReadKeys.has(item.key)).length;
    countBadge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
    countBadge.hidden = unreadCount === 0;
    button.setAttribute("aria-label", unreadCount ? `${unreadCount} unread admin notifications` : "No unread admin notifications");
    if (summary) summary.textContent = unreadCount
        ? `${unreadCount} unread · ${adminNotificationItems.length} awaiting review`
        : `${adminNotificationItems.length ? "All caught up · " : ""}${adminNotificationItems.length} awaiting review`;
    list.innerHTML = adminNotificationItems.length
        ? adminNotificationItems.map(item => {
            const isUnread = !prunedReadKeys.has(item.key);
            return `<button type="button" class="admin-notification-item${isUnread ? " is-unread" : " is-read"}" data-admin-notification-key="${escapeAttr(item.key)}" data-admin-notification-section="${item.section}" data-admin-notification-kind="${item.kind}" data-admin-notification-id="${escapeAttr(item.bookingId || "")}" aria-label="${isUnread ? "Unread: " : "Read: "}${escapeAttr(item.title)}. ${escapeAttr(item.detail)}"><span class="admin-notification-copy"><span class="admin-notification-meta"><span class="admin-notification-type">${escapeHtml(item.notificationType)}</span><time>${escapeHtml(formatAdminNotificationTime(item.createdAt))}</time></span><strong>${escapeHtml(item.title)}</strong><span class="admin-notification-detail">${escapeHtml(item.detail)}</span></span><span class="admin-notification-unread-dot" aria-hidden="true"></span></button>`;
        }).join("")
        : '<p class="admin-notification-empty">You are all caught up.</p>';
}

const adminNotificationBtn = document.getElementById("adminNotificationBtn");
const adminNotificationPanel = document.getElementById("adminNotificationPanel");
const adminNotificationWrap = document.querySelector(".admin-notification-wrap");
function closeAdminNotificationPanel() {
    if (!adminNotificationPanel || !adminNotificationBtn) return;
    adminNotificationPanel.hidden = true;
    adminNotificationBtn.setAttribute("aria-expanded", "false");
}
adminNotificationBtn?.addEventListener("click", () => {
    const isOpen = adminNotificationPanel.hidden;
    adminNotificationPanel.hidden = !isOpen;
    adminNotificationBtn.setAttribute("aria-expanded", String(isOpen));
});
document.getElementById("closeAdminNotifications")?.addEventListener("click", closeAdminNotificationPanel);
adminNotificationPanel?.addEventListener("click", event => {
    const target = event.target.closest("[data-admin-notification-section]");
    if (!target) return;
    const itemKey = target.dataset.adminNotificationKey;
    const section = target.dataset.adminNotificationSection;
    const kind = target.dataset.adminNotificationKind;
    const notificationId = target.dataset.adminNotificationId;
    markAdminNotificationRead(itemKey);
    showSection(section);
    closeAdminNotificationPanel();
    if (kind === "change-request") {
        document.getElementById("bookingChangeRequestList")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (section === "bookings" && notificationId) {
        viewBooking(notificationId);
    }
});
document.addEventListener("click", event => {
    if (adminNotificationPanel && !adminNotificationPanel.hidden && !adminNotificationWrap?.contains(event.target)) {
        closeAdminNotificationPanel();
    }
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && adminNotificationPanel && !adminNotificationPanel.hidden) {
        closeAdminNotificationPanel();
    }
});
let adminToastTimer;
function showAdminToast(message, type = "success") {
    let toast = document.getElementById("adminToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "adminToast";
        document.body.appendChild(toast);
    }

    window.clearTimeout(adminToastTimer);
    toast.className = `admin-toast ${type === "error" ? "is-error" : "is-success"}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    adminToastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 4000);
}


// ========================================
// LOAD QUOTATIONS
// ========================================

async function loadQuotationRequests() {

    if (!window.supabaseClient) {

        console.error(
            "Supabase client is not available."
        );

        return;

    }


    try {

        const {
            data,
            error
        } = await window.supabaseClient

            .from("ocular_inspection_requests")

            .select("*")

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        quotationRequests =
            data || [];


        renderQuotationRequests();
        updateAdminNotifications();


        console.log(
            "Quotation requests loaded:",
            quotationRequests
        );


    } catch (error) {

        console.error(
            "Quotation loading error:",
            error
        );

        const table =
            document.getElementById(
                "quotationTableBody"
            );

        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="8">
                        Unable to load ocular inspection requests.
                    </td>
                </tr>
            `;

        }

    }

}


// ========================================
// RENDER QUOTATIONS
// ========================================

function renderQuotationRequests() {

    const table =
        document.getElementById(
            "quotationTableBody"
        );

    const empty =
        document.getElementById(
            "emptyQuotations"
        );


    if (!table) return;


    const searchInput =
        document.getElementById(
            "quotationSearch"
        );


    const statusFilter =
        document.getElementById(
            "quotationStatusFilter"
        );


    const search =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();


    const status =
        statusFilter?.value || "ALL";


    const rows =
        quotationRequests.filter(
            request => {

                const searchable = [
                    request.request_code,
                    request.customer_name,
                    request.customer_email,
                    request.customer_contact,
                    request.venue_name,
                    request.inspection_city,
                    request.inspection_province,
                    request.inspection_region,
                    request.inspection_address,
                    request.inspection_date,
                    request.payment_reference,
                    request.additional_request
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(search);


                const matchesStatus =
                    status === "ALL" ||
                    request.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    if (empty) {

        empty.style.display =
            rows.length
                ? "none"
                : "block";

    }


    table.innerHTML =
        rows.map(request => {
            return `

                <tr>

                    <td>
                        <strong>${escapeHtml(request.request_code || `#${request.id}`)}</strong>
                    </td>

                    <td>
                        <strong>${escapeHtml(request.customer_name || "Customer")}</strong>

                        <br>

                        <small>${escapeHtml(request.customer_email || request.customer_contact || "Contact not provided")}</small>
                    </td>


                    <td>

                        <strong>Ocular Inspection</strong>

                        <br>

                        <small>${escapeHtml(request.inspection_date || "Date not set")} ${escapeHtml(request.inspection_time || "")}</small>

                    </td>


                    <td>

                        ${money(request.inspection_fee)}

                    </td>


                    <td>

                        ${escapeHtml(request.payment_reference || request.additional_request || "Not provided")}

                    </td>

                    <td>
                        <span class="status ${statusClass(request.status)}">${escapeHtml(request.status || "REQUESTED")}</span>
                    </td>


                    <td class="booking-actions-cell">
                        <button type="button" class="booking-actions-trigger" onclick="toggleOcularActions(event, '${escapeAttr(request.id)}', this)" aria-haspopup="menu" aria-controls="bookingActionsPopover" aria-expanded="false" aria-label="Actions for ocular request ${escapeAttr(request.request_code || request.id)}" title="More actions"><span aria-hidden="true">⋮</span></button>

                    </td>

                </tr>

            `;

        }).join("");

}


function confirmOcularInspectionStatus(id, status) {
    const isDeclining = status === "DECLINED";
    const isCancelling = status === "CANCELLED";
    const action = isDeclining ? "decline" : isCancelling ? "cancel" : "approve";
    const effect = isDeclining
        ? "The customer will be notified that the request was declined."
        : isCancelling
            ? "The approved inspection will be cancelled."
            : "The customer will be notified that the request was approved.";
    openModal(`<section class="booking-change-confirmation ocular-status-confirmation"><span class="eyebrow">OCULAR INSPECTION</span><h3>Are you sure?</h3><p class="field-help">Do you want to ${action} this ocular inspection request? ${effect}</p><div class="modal-actions"><button type="button" class="btn secondary" id="cancelOcularStatusReview">Go back</button><button type="button" class="btn ${isDeclining || isCancelling ? "danger" : "primary"}" id="confirmOcularStatusReview" data-request-id="${escapeAttr(id)}" data-status="${escapeAttr(status)}">Yes, ${action}</button></div></section>`);
    document.querySelector("#modal .modal-card")?.classList.add("ocular-action-confirmation-card");
}

async function setOcularInspectionStatus(id, status) {

    try {
        const result = status === "APPROVED"
            ? await window.supabaseClient.rpc("kq_accept_ocular_inspection_request", { p_request_id: String(id) })
            : await window.supabaseClient
                .from("ocular_inspection_requests")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", id);
        const { error } = result;
        if (error) throw error;

        let emailNotice = "";
        if (status === "APPROVED" || status === "DECLINED") {
            const emailResult = await sendOcularStatusEmail(id);
            if (!emailResult.sent) emailNotice = ` Email was not sent: ${emailResult.error}`;
            else {
                const recipient = quotationRequests.find(item => String(item.id) === String(id))?.customer_email || "the customer";
                emailNotice = ` Email sent to ${recipient}.`;
            }
        }

        await loadQuotationRequests();
        const message = isDeclining
            ? "Ocular inspection request declined."
            : isCancelling
                ? "Ocular inspection request cancelled."
                : "Ocular inspection request accepted.";
        const toastType = emailNotice.startsWith(" Email was not sent:") || isDeclining ? "error" : "success";
        showAdminToast(`${message}${emailNotice}`, toastType);
    } catch (error) {
        console.error("Ocular inspection status update failed:", error);
        showAdminToast(error.message || "Unable to update ocular inspection request.", "error");
    }
}

async function sendOcularStatusEmail(id) {
    try {
        const { data, error } = await window.supabaseClient.functions.invoke("send-ocular-approval-email", {
            body: { requestId: String(id) }
        });
        if (!error) return { sent: true, error: "" };

        let message = data?.error;
        if (!message && typeof error.context?.clone === "function") {
            try {
                const responseText = await error.context.clone().text();
                try { message = JSON.parse(responseText)?.error; }
                catch { message = responseText.trim().slice(0, 300); }
            } catch { /* Fall back to the invocation error below. */ }
        }
        console.error("Ocular status email failed:", error);
        return { sent: false, error: message || error.message || "The customer email could not be sent." };
    } catch (error) {
        console.error("Ocular status email request failed:", error);
        return { sent: false, error: error?.message || "The customer email could not be sent." };
    }
}

async function resendOcularApprovalEmail(id) {
    const request = quotationRequests.find(item => String(item.id) === String(id));
    if (!request || String(request.status || "").toUpperCase() !== "APPROVED") return;

    const result = await sendOcularStatusEmail(id);
    if (!result.sent) {
        showAdminToast(result.error, "error");
        return;
    }
    showAdminToast(`Approval email sent to ${request.customer_email || "the customer"}.`);
}


// ========================================
// VIEW QUOTATION
// ========================================

async function viewQuotation(id) {

    const request =
        quotationRequests.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!request) return;


    const rawInspectionDate = String(request.inspection_date || "");
    const inspectionDateHasTime = /[T ]\d{2}:\d{2}/.test(rawInspectionDate);
    const requestDate = rawInspectionDate
        ? inspectionDateHasTime
            ? new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeStyle: "short" }).format(new Date(rawInspectionDate))
            : new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(new Date(`${rawInspectionDate.slice(0, 10)}T12:00:00`))
        : "Date not selected";
    const purposeLabel = request.request_purpose === "OCULAR_INSPECTION" ? "Ocular / venue inspection" : "Additional request";
    openModal(`
        <div class="ocular-request-modal">
            <header class="ocular-request-header">
                <span class="eyebrow">OCULAR INSPECTION</span>
                <h3>Request details</h3>
                <p>Request <strong>${escapeHtml(request.request_code || `#${request.id}`)}</strong><span class="ocular-status-pill">${escapeHtml(request.status || "REQUESTED")}</span></p>
            </header>

            <section class="ocular-detail-section" aria-labelledby="ocularCustomerDetailsTitle">
                <h4 id="ocularCustomerDetailsTitle">Customer information</h4>
                <div class="quotation-detail-list">
                    <div class="quotation-detail-row"><span>Customer name</span><strong>${escapeHtml(request.customer_name || "Not provided")}</strong></div>
                    <div class="quotation-detail-row"><span>Contact number</span><strong>${escapeHtml(request.customer_contact || "Not provided")}</strong></div>
                    <div class="quotation-detail-row is-wide"><span>Email address</span><strong>${escapeHtml(request.customer_email || "Not provided")}</strong></div>
                </div>
            </section>

            <section class="ocular-detail-section" aria-labelledby="ocularVenueDetailsTitle">
                <h4 id="ocularVenueDetailsTitle">Inspection details</h4>
                <div class="quotation-detail-list">
                    <div class="quotation-detail-row is-wide"><span>Preferred date and time</span><strong>${escapeHtml(requestDate)}${request.inspection_time && !inspectionDateHasTime ? ` · ${escapeHtml(request.inspection_time)}` : ""}</strong></div>
                    <div class="quotation-detail-row"><span>Venue name</span><strong>${escapeHtml(request.venue_name || "Not provided")}</strong></div>
                    <div class="quotation-detail-row"><span>Purpose</span><strong>${escapeHtml(purposeLabel)}</strong></div>
                    <div class="quotation-detail-row is-wide"><span>City / municipality</span><strong>${escapeHtml([request.inspection_city, request.inspection_province, request.inspection_region].filter(Boolean).join(" — ") || "Not provided")}</strong></div>
                    <div class="quotation-detail-row is-wide"><span>Venue address</span><strong>${escapeHtml(request.inspection_address || "Not provided")}</strong></div>
                    ${request.inspection_fee != null ? `<div class="quotation-detail-row"><span>Current inspection fee</span><strong>${money(request.inspection_fee)}</strong></div>` : ""}
                    ${request.inspection_distance_km != null ? `<div class="quotation-detail-row"><span>Recorded distance</span><strong>${escapeHtml(request.inspection_distance_km)} km</strong></div>` : ""}
                    ${request.design_estimate_package ? `<div class="quotation-detail-row is-wide"><span>Image-matched suggestion</span><strong>${escapeHtml(request.design_estimate_package)} — ${money(request.design_estimate_price)}</strong></div>` : ""}
                </div>
            </section>

            ${request.design_image_path ? `<section class="ocular-detail-section"><h4>Customer design moodboard</h4><p id="adminQuotationImageStatus" class="field-help">Loading private design image…</p><img id="adminQuotationDesignImage" class="admin-design-preview" alt="Customer-uploaded design moodboard" hidden>${Array.isArray(request.design_estimate_features) && request.design_estimate_features.length ? `<p>${escapeHtml(request.design_estimate_explanation || "Free preliminary visual estimate.")}</p><ul class="admin-design-features">${request.design_estimate_features.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}<small class="field-help">Preliminary estimate only; confirm package and final price with the customer.</small></section>` : ""}

            <section class="ocular-detail-section ocular-edit-section" aria-labelledby="ocularAdminUpdateTitle">
                <h4 id="ocularAdminUpdateTitle">Admin update</h4>
                <div class="ocular-edit-grid">
                    <div class="modal-field"><label for="inspectionDistanceKm">Confirmed route distance (km)</label><input id="inspectionDistanceKm" type="number" min="0" step="0.1" value="${request.inspection_distance_km ?? ""}" placeholder="Enter route distance"></div>
                    <div class="modal-field"><label for="inspectionFeeInput">Inspection fee (₱)</label><input id="inspectionFeeInput" type="number" min="0" step="100" value="${request.inspection_fee ?? ""}" placeholder="System-calculated fee"></div>
                </div>
                <small class="field-help">System-calculated inspection fees are rounded up to the nearest ₱100.</small>
                <div class="modal-field full ocular-additional-request"><label for="ocularAdditionalRequest">${request.request_purpose === "OCULAR_INSPECTION" ? "Payment reference" : "Additional request"}</label><textarea id="ocularAdditionalRequest" readonly>${escapeHtml(request.payment_reference || request.additional_request || "No additional request.")}</textarea></div>
                <div class="modal-field full"><label for="quotationAdminNotes">Admin notes</label><textarea id="quotationAdminNotes" placeholder="Add notes or instructions for this customer...">${escapeHtml(request.admin_notes || "")}</textarea></div>
                <div class="modal-field full"><label for="quotationStatus">Request status</label><select id="quotationStatus">
                    <option value="REQUESTED" ${request.status === "REQUESTED" ? "selected" : ""}>Requested</option>
                    <option value="REVIEWING" ${request.status === "REVIEWING" ? "selected" : ""}>Reviewing</option>
                    <option value="APPROVED" ${request.status === "APPROVED" ? "selected" : ""}>Approved</option>
                    <option value="REVISION" ${request.status === "REVISION" ? "selected" : ""}>Revision required</option>
                    <option value="DECLINED" ${request.status === "DECLINED" ? "selected" : ""}>Declined</option>
                    <option value="CANCELLED" ${request.status === "CANCELLED" ? "selected" : ""}>Cancelled</option>
                    <option value="CONVERTED" ${request.status === "CONVERTED" ? "selected" : ""}>Converted to booking</option>
                </select></div>
            </section>
            <div class="modal-actions ocular-modal-actions"><button class="btn primary" onclick="updateQuotation('${request.id}')">Save changes</button></div>
        </div>
    `);
    document.querySelector("#modal .modal-card")?.classList.add("ocular-request-modal-card");

    const inspectionDistanceInput = document.getElementById('inspectionDistanceKm');
    const inspectionFeeInput = document.getElementById('inspectionFeeInput');
    const recalculateInspectionFee = () => {
        const distance = Number(inspectionDistanceInput?.value);
        if (inspectionDistanceInput?.value !== '' && Number.isFinite(distance) && distance >= 0 && inspectionFeeInput) {
            inspectionFeeInput.value = String(Math.ceil((1500 + (distance * 20)) / 100) * 100);
        }
    };
    inspectionDistanceInput?.addEventListener('input', recalculateInspectionFee);
    if (!request.inspection_fee && request.inspection_distance_km != null) recalculateInspectionFee();

    if (request.design_image_path) {
        const { data, error } = await window.supabaseClient.storage
            .from("booking-designs")
            .createSignedUrl(request.design_image_path, 60 * 10);
        const image = document.getElementById("adminQuotationDesignImage");
        const imageStatus = document.getElementById("adminQuotationImageStatus");
        if (error || !data?.signedUrl || !image || !imageStatus) {
            if (imageStatus) imageStatus.textContent = "The private design image could not be opened. Check the Supabase storage policies.";
        } else {
            image.src = data.signedUrl;
            image.hidden = false;
            imageStatus.remove();
        }
    }

}


// ========================================
// UPDATE QUOTATION
// ========================================

async function updateQuotation(id) {

    const status =
        document.getElementById(
            "quotationStatus"
        )?.value;


    const adminNotes =
        document.getElementById(
            "quotationAdminNotes"
        )?.value.trim();

    const feeValue = document.getElementById("inspectionFeeInput")?.value;
    const distanceValue = document.getElementById("inspectionDistanceKm")?.value;
    const inspectionFee = feeValue === "" || feeValue == null ? null : Number(feeValue);
    const inspectionDistanceKm = distanceValue === "" || distanceValue == null ? null : Number(distanceValue);

    if ((inspectionFee != null && (!Number.isFinite(inspectionFee) || inspectionFee < 0)) ||
        (inspectionDistanceKm != null && (!Number.isFinite(inspectionDistanceKm) || inspectionDistanceKm < 0))) {
        alert("Enter a valid non-negative travel fee and distance.");
        return;
    }


    if (!status) return;

    const previousStatus = String(quotationRequests.find(item => String(item.id) === String(id))?.status || "").toUpperCase();


    try {

        const updateValues = {
            inspection_fee: inspectionFee,
            inspection_distance_km: inspectionDistanceKm,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString()
        };
        if (status !== "APPROVED") updateValues.status = status;

        const { error } = await window.supabaseClient

            .from("ocular_inspection_requests")

            .update(updateValues)

            .eq(
                "id",
                id
            );


        if (error) {

            throw error;

        }

        if (status === "APPROVED") {
            const { error: acceptError } = await window.supabaseClient.rpc(
                "kq_accept_ocular_inspection_request",
                { p_request_id: String(id) }
            );
            if (acceptError) throw acceptError;
        }

        let emailNotice = "";
        if (String(status).toUpperCase() !== previousStatus && ["APPROVED", "DECLINED"].includes(String(status).toUpperCase())) {
            const emailResult = await sendOcularStatusEmail(id);
            if (!emailResult.sent) emailNotice = ` Email was not sent: ${emailResult.error}`;
            else emailNotice = ` A status email was sent to ${quotationRequests.find(item => String(item.id) === String(id))?.customer_email || "the customer"}.`;
        }


        closeModal();


        await loadQuotationRequests();


        const resultStatus = String(status).toUpperCase();
        const toastType = emailNotice.startsWith(" Email was not sent:") || resultStatus === "DECLINED" ? "error" : "success";
        showAdminToast(`Ocular inspection request updated successfully.${emailNotice}`, toastType);


    } catch (error) {

        console.error(
            "Quotation update error:",
            error
        );


        showAdminToast(error.message || "Unable to update ocular inspection request.", "error");

    }

}


// ========================================
// QUOTATION FILTERS
// ========================================

const quotationSearch =
    document.getElementById(
        "quotationSearch"
    );


if (quotationSearch) {

    quotationSearch.addEventListener(
        "input",
        renderQuotationRequests
    );

}


const quotationStatusFilter =
    document.getElementById(
        "quotationStatusFilter"
    );


if (quotationStatusFilter) {

    quotationStatusFilter.addEventListener(
        "change",
        renderQuotationRequests
    );

}


// ========================================
// ADD QUOTATIONS TO RENDER ALL
// ========================================

const originalRenderAll =
    renderAll;


renderAll = function () {

    originalRenderAll();

    renderQuotationRequests();
    updateAdminNotifications();

};


// ========================================
// INITIAL QUOTATION LOAD
// ========================================

let adminNotificationChannel = null;
function subscribeToAdminRequestUpdates() {
    if (!window.supabaseClient || adminNotificationChannel) return;
    adminNotificationChannel = window.supabaseClient
        .channel("admin-request-notifications")
        .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => void loadBookings())
        .on("postgres_changes", { event: "*", schema: "public", table: "booking_change_requests" }, () => void loadBookingChangeRequests())
        .on("postgres_changes", { event: "*", schema: "public", table: "ocular_inspection_requests" }, () => void loadQuotationRequests())
        .subscribe();
}

async function initializeAdmin() {
    try {
        if (!(await requireAdmin())) return;
        await loadBookings();
        await loadBookingChangeRequests();
        await loadQuotationRequests();
        subscribeToAdminRequestUpdates();
        // Refresh periodically so new customer submissions appear without a manual reload.
        window.setInterval(async () => {
            await loadBookings();
            await loadBookingChangeRequests();
            await loadQuotationRequests();
        }, 30000);
    } catch (error) {
        console.error("Admin initialization error:", error);
        const emptyState = document.getElementById("emptyBookings");
        if (emptyState) {
            emptyState.textContent = "Unable to connect to the admin data. Please refresh and try again.";
            emptyState.style.display = "block";
        }
    }
}

document.getElementById("refreshBookingChangeRequests")?.addEventListener("click", () => void loadBookingChangeRequests());
document.getElementById("bookingChangeRequestList")?.addEventListener("click", event => {
    const button = event.target.closest("[data-change-review]");
    if (button) {
        const menu = button.closest("details");
        if (menu) menu.open = false;
        openBookingChangeReview(button.dataset.requestId, button.dataset.changeReview === "accept");
        return;
    }
    const viewButton = event.target.closest("[data-view-change-request]");
    if (viewButton) {
        const menu = viewButton.closest("details");
        if (menu) menu.open = false;
        const request = bookingChangeRequests.find(item => String(item.id) === String(viewButton.dataset.viewChangeRequest));
        if (request) openCustomerRequestHistory(request.booking_id);
    }
});
document.getElementById("modalContent")?.addEventListener("click", event => {
    if (event.target.closest("#cancelOcularStatusReview")) {
        closeModal();
        return;
    }
    const ocularStatusButton = event.target.closest("#confirmOcularStatusReview");
    if (ocularStatusButton) {
        const { requestId, status } = ocularStatusButton.dataset;
        closeModal();
        void setOcularInspectionStatus(requestId, status);
        return;
    }
    if (event.target.closest("#cancelBookingChangeReview")) {
        closeModal();
        return;
    }
    const button = event.target.closest("#confirmBookingChangeReview");
    if (!button) return;
    void submitBookingChangeReview(button.dataset.requestId, button.dataset.accept === "true");
});

initializeAdmin();
scheduleExpenseArchive();
