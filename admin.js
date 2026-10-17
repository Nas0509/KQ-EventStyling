const STORAGE_KEY = "kqBookings";
const PAYMENT_KEY = "kqPayments";
const EXPENSE_KEY = "kqExpenses";
const INVENTORY_KEY = "kqInventory";

const defaultInventory = [
    { id: 1, name: "Balloons", category: "Decoration", quantity: 200, unit: "pcs", cost: 5, reorder: 50 },
    { id: 2, name: "Table Covers", category: "Table Styling", quantity: 20, unit: "pcs", cost: 150, reorder: 10 },
    { id: 3, name: "LED Lights", category: "Lighting", quantity: 5, unit: "pcs", cost: 500, reorder: 5 }
];

let bookings = [];
let payments = JSON.parse(localStorage.getItem(PAYMENT_KEY) || "[]");
let expenses = JSON.parse(localStorage.getItem(EXPENSE_KEY) || "[]");
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
    return {
        ...row,
        fullName: row.full_name || "",
        eventType: row.event_type || "",
        eventDate: row.event_date || "",
        startTime: row.start_time || "",
        timeSlot: row.time_slot || "",
        package: row.package || row.package_type || "",
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

document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.section)));
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
            <td><div class="action-group">
                <button class="small-btn edit" onclick="viewBooking('${b.id}')">View</button>
                ${b.status === "PENDING" ? `<button class="small-btn approve" onclick="changeStatus('${b.id}','APPROVED')">Approve</button><button class="small-btn decline" onclick="changeStatus('${b.id}','DECLINED')">Decline</button>` : ""}
                ${b.status === "APPROVED" ? `<button class="small-btn decline" onclick="requestCancelBooking('${b.id}')">Cancel</button>` : ""}
            </div></td>
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
    document.getElementById("salesRevenue").textContent = money(revenue);
    document.getElementById("salesExpenses").textContent = money(totalExpenses);
    document.getElementById("salesNet").textContent = money(revenue - totalExpenses);
    document.getElementById("salesTableBody").innerHTML = bookings.filter(b => payments.some(p => p.bookingId === b.id)).map(b => {
        const p = payments.find(x => x.bookingId === b.id) || {};
        return `<tr><td>${escapeHtml(b.fullName)}</td><td>${escapeHtml(b.eventType)}</td><td>${money(p.total)}</td><td>${money(p.paid)}</td><td>${money(Number(p.total) - Number(p.paid))}</td></tr>`;
    }).join("");
    document.getElementById("expenseList").innerHTML = expenses.length ? expenses.map((e, i) => `<div class="expense-item"><span>${escapeHtml(e.description)}<small> • ${escapeHtml(e.date || "")}</small></span><strong>${money(e.amount)}</strong><button class="small-btn delete" onclick="deleteExpense(${i})">×</button></div>`).join("") : '<div class="empty-state">No expenses recorded.</div>';
}

function renderInventory() {
    document.getElementById("inventoryTableBody").innerHTML = inventory.map(i => {
        const low = Number(i.quantity) <= Number(i.reorder);
        return `<tr><td><strong>${escapeHtml(i.name)}</strong></td><td>${escapeHtml(i.category)}</td><td>${i.quantity}</td><td>${escapeHtml(i.unit)}</td><td>${money(i.cost)}</td><td>${money(Number(i.quantity) * Number(i.cost))}</td><td><span class="status ${low ? "CANCELLED" : "APPROVED"}">${low ? "LOW STOCK" : "AVAILABLE"}</span></td><td><button class="small-btn edit" onclick="editInventory(${i.id})">Update</button></td></tr>`;
    }).join("");
}

function renderAll() { renderDashboard(); renderBookings(); renderArchive(); renderPayments(); renderSales(); renderInventory(); }

async function changeStatus(id, newStatus) {
    const b = bookings.find(x => x.id === id); if (!b) return;
    const { error } = await window.supabaseClient
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);
    if (error) { alert(`Unable to update booking status: ${error.message}`); return; }
    b.status = newStatus;
    if (newStatus === "APPROVED" && !payments.find(p => p.bookingId === id)) payments.push({ bookingId: id, total: Number(b.amount) || 0, paid: 0, status: "NO DOWN PAYMENT" });
    save(); renderAll();
    alert(`Booking ${id} is now ${newStatus}.`);
}

async function verifyReservationFee(id) {
    const booking = bookings.find(item => item.id === id);
    if (!booking) return;
    const fee = Number(booking.required_down_payment) || 0;
    if (!fee) { alert("This booking has no reservation fee recorded."); return; }
    if (!confirm(`Have you verified the client's payment? This will record ${money(fee)} as received.`)) return;

    const { error } = await window.supabaseClient
        .from("bookings")
        .update({ down_payment_amount: fee, payment_status: "DOWN PAYMENT MADE" })
        .eq("id", id);
    if (error) { alert(`Unable to record the verified payment: ${error.message}`); return; }

    booking.down_payment_amount = fee;
    booking.payment_status = "DOWN PAYMENT MADE";
    save();
    renderAll();
    viewBooking(id);
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
    openModal(`<h3>Booking Details</h3>
        <div class="modal-grid">
            <div class="modal-field"><label>Booking ID</label><input value="${escapeAttr(b.id)}" readonly></div>
            <div class="modal-field"><label>Status</label><input value="${escapeAttr(b.status)}" readonly></div>
            <div class="modal-field"><label>Client</label><input value="${escapeAttr(b.fullName)}" readonly></div>
            <div class="modal-field"><label>Email</label><input value="${escapeAttr(b.email)}" readonly></div>
            <div class="modal-field"><label>Contact</label><input value="${escapeAttr(b.phone)}" readonly></div>
            <div class="modal-field"><label>Event Type</label><input value="${escapeAttr(b.eventType)}" readonly></div>
            <div class="modal-field"><label>Event Date</label><input value="${escapeAttr(b.eventDate)}" readonly></div>
            <div class="modal-field"><label>Guests</label><input value="${escapeAttr(b.guests)}" readonly></div>
            <div class="modal-field"><label>Time Preference</label><input value="${escapeAttr(b.timeSlot || "")}" readonly></div>
            <div class="modal-field"><label>Start Time</label><input value="${escapeAttr(b.startTime || "")}" readonly></div>
            <div class="modal-field"><label>Package</label><input value="${escapeAttr(b.package || "")}" readonly></div>
            <div class="modal-field"><label>Theme</label><input value="${escapeAttr(bookingMessageField(b.message, "Theme") || "Not specified")}" readonly></div>
            <div class="modal-field"><label>Preferred Colors</label><input value="${escapeAttr(bookingMessageField(b.message, "Preferred colors") || "Not specified")}" readonly></div>
            <div class="modal-field"><label>Total Amount</label><input value="${money(b.amount)}" readonly></div>
            <div class="modal-field"><label>30% Reservation Fee</label><input value="${money(b.required_down_payment)}" readonly></div>
            <div class="modal-field"><label>Reservation Payment Received</label><input value="${money(b.down_payment_amount)}" readonly></div>
            ${b.ai_estimated_package ? `<div class="modal-field"><label>AI Suggested Package</label><input value="${escapeAttr(b.ai_estimated_package)} — ${money(b.ai_estimated_price)}" readonly></div>` : ""}
            ${b.design_image_path ? `<div class="modal-field full"><label>Customer Design Reference</label><p id="adminDesignImageStatus" class="field-help">Loading private design image…</p><img id="adminDesignImage" class="admin-design-preview" alt="Customer-uploaded design reference" hidden></div>` : ""}
            ${Array.isArray(b.ai_detected_features) && b.ai_detected_features.length ? `<div class="modal-field full"><label>AI Estimate Notes</label><p>${escapeHtml(b.ai_estimate_explanation || "Estimated from the visible design features.")}</p><ul class="admin-design-features">${b.ai_detected_features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}</ul><small class="field-help">AI estimate only; confirm final package and price with the customer.</small></div>` : ""}
            <div class="modal-field full"><label>Additional Requests & Booking Information</label><textarea readonly>${escapeHtml(b.message || "")}</textarea></div>
            <div class="modal-field full"><label>Admin Notes / Reminders</label><textarea id="adminNotes">${escapeHtml(b.adminNotes || "")}</textarea></div>
        </div>
        <div class="modal-actions">
            ${Number(b.required_down_payment) > 0 && Number(b.down_payment_amount) < Number(b.required_down_payment) ? `<button class="btn primary" onclick="verifyReservationFee('${escapeAttr(b.id)}')">Mark 30% Fee Verified</button>` : ""}
            <button class="btn primary" onclick="saveNotes('${escapeAttr(b.id)}')">Save Notes</button>
        </div>
        ${Number(b.required_down_payment) > 0 && Number(b.down_payment_amount) < Number(b.required_down_payment) ? '<small class="field-help">Only mark this after checking the transaction reference in your payment account.</small>' : ""}`);

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

async function saveNotes(id) {
    const b = bookings.find(x => x.id === id); if (!b) return;
    const notes = document.getElementById("adminNotes").value;
    const { error } = await window.supabaseClient.from("bookings").update({ admin_notes: notes }).eq("id", id);
    if (error) { showAdminToast(error.message || "Unable to save admin notes.", "error"); return; }
    b.adminNotes = notes; save(); closeModal(); renderAll(); showAdminToast("Admin notes saved.");
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
                    <option ${p.status === "NO DOWN PAYMENT" ? "selected" : ""}>NO DOWN PAYMENT</option>
                    <option ${p.status === "DOWN PAYMENT MADE" ? "selected" : ""}>DOWN PAYMENT MADE</option>
                    <option ${p.status === "PARTIAL PAYMENT" ? "selected" : ""}>PARTIAL PAYMENT</option>
                    <option ${p.status === "FULLY PAID" ? "selected" : ""}>FULLY PAID</option>
                </select>
            </div>
        </div>
        <div class="modal-actions"><button class="btn primary" onclick="savePayment('${id}')">Save Payment</button></div>`);
}

async function savePayment(id) {
    const p = payments.find(x => x.bookingId === id); if (!p) return;
    const paid = Math.max(0, Math.min(Number(p.total), Number(document.getElementById("paymentPaid").value) || 0));
    const selected = document.getElementById("paymentStatus").value;
    const status = paid <= 0 ? "NO DOWN PAYMENT" : paid >= Number(p.total) ? "FULLY PAID" : selected === "DOWN PAYMENT MADE" && paid > 0 ? "DOWN PAYMENT MADE" : "PARTIAL PAYMENT";
    const { error } = await window.supabaseClient.from("bookings").update({ down_payment_amount: paid, payment_status: status }).eq("id", id);
    if (error) { showAdminToast(error.message || "Unable to save payment update.", "error"); return; }
    p.paid = paid;
    p.status = status;
    p.updatedAt = new Date().toISOString();
    const booking = bookings.find(item => item.id === id);
    if (booking) { booking.down_payment_amount = paid; booking.payment_status = status; }
    save(); closeModal(); renderAll(); showAdminToast("Payment update saved.");
}

document.getElementById("addExpenseBtn").addEventListener("click", () => {
    openModal(`<h3>Add Expense</h3><div class="modal-grid">
        <div class="modal-field full"><label>Description</label><input id="expenseDescription" placeholder="e.g. Balloons / Transportation"></div>
        <div class="modal-field"><label>Amount</label><input id="expenseAmount" type="number" min="0" placeholder="0"></div>
        <div class="modal-field"><label>Date</label><input id="expenseDate" type="date" value="${new Date().toISOString().slice(0, 10)}"></div>
    </div><div class="modal-actions"><button class="btn primary" onclick="saveExpense()">Add Expense</button></div>`);
});
function saveExpense() {
    const description = document.getElementById("expenseDescription").value.trim(), amount = Number(document.getElementById("expenseAmount").value) || 0, date = document.getElementById("expenseDate").value;
    if (!description || amount <= 0) { alert("Please enter a description and valid amount."); return }
    expenses.push({ description, amount, date }); save(); closeModal(); renderAll();
}
function deleteExpense(i) { if (confirm("Delete this expense?")) { expenses.splice(i, 1); save(); renderAll() } }

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

function openModal(html) { document.querySelector("#modal .modal-card").classList.remove("calendar-modal-card", "logout-confirmation-card"); document.getElementById("modalContent").innerHTML = html; document.getElementById("modal").classList.remove("hidden") }
function closeModal() { document.getElementById("modal").classList.add("hidden"); document.querySelector("#modal .modal-card").classList.remove("calendar-modal-card", "logout-confirmation-card") }
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

function updateAdminNotifications() {
    const button = document.getElementById("adminNotificationBtn");
    const countBadge = document.getElementById("adminNotificationCount");
    const list = document.getElementById("adminNotificationsList");
    if (!button || !countBadge || !list) return;
    const items = [
        ...bookings.filter(item => item.status === "PENDING").map(item => ({
            section: "bookings",
            title: `Booking request from ${item.fullName || "Client"}`,
            detail: `${item.eventType || "Event"} · ${item.eventDate || "Date not set"}`
        })),
        ...quotationRequests.filter(item => String(item.status || "").toUpperCase() === "REQUESTED").map(item => ({
            section: "quotations",
            title: `Ocular inspection from ${item.customer_name || "Client"}`,
            detail: `${item.venue_name || "Venue not set"} · ${item.inspection_date || "Date not set"}`
        }))
    ];
    countBadge.textContent = items.length > 99 ? "99+" : String(items.length);
    countBadge.hidden = items.length === 0;
    button.setAttribute("aria-label", items.length ? `${items.length} pending admin notifications` : "No pending admin notifications");
    list.innerHTML = items.length
        ? items.slice(0, 8).map(item => `<button type="button" class="admin-notification-item" data-admin-notification-section="${item.section}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></button>`).join("")
        : '<p class="admin-notification-empty">You are all caught up.</p>';
}

const adminNotificationBtn = document.getElementById("adminNotificationBtn");
const adminNotificationPanel = document.getElementById("adminNotificationPanel");
adminNotificationBtn?.addEventListener("click", () => {
    const isOpen = adminNotificationPanel.hidden;
    adminNotificationPanel.hidden = !isOpen;
    adminNotificationBtn.setAttribute("aria-expanded", String(isOpen));
});
document.getElementById("closeAdminNotifications")?.addEventListener("click", () => {
    adminNotificationPanel.hidden = true;
    adminNotificationBtn.setAttribute("aria-expanded", "false");
});
adminNotificationPanel?.addEventListener("click", event => {
    const target = event.target.closest("[data-admin-notification-section]");
    if (!target) return;
    showSection(target.dataset.adminNotificationSection);
    adminNotificationPanel.hidden = true;
    adminNotificationBtn.setAttribute("aria-expanded", "false");
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

                        <strong>${escapeHtml(request.venue_name || "Venue not provided")}</strong><br>
                        <small>${escapeHtml(request.inspection_address || "")}</small>

                    </td>


                    <td>

                        ${money(request.inspection_fee)}

                    </td>


                    <td>

                        ${escapeHtml([request.inspection_city, request.inspection_province, request.inspection_region].filter(Boolean).join(", ") || "Not specified")}

                    </td>


                    <td>

                        ${escapeHtml(request.additional_request || "Not provided")}

                    </td>


                    <td>

                        <div class="action-group ocular-action-group ${request.status === "REQUESTED" ? "is-pending" : "is-processed"}">

                            <button
                                class="small-btn edit ocular-view-action"
                                onclick="viewQuotation('${request.id}')">

                                View

                            </button>

                            ${request.status === "REQUESTED" ? `
                                <button class="small-btn approve" onclick="setOcularInspectionStatus('${request.id}', 'APPROVED')">Accept</button>
                                <button class="small-btn decline" onclick="setOcularInspectionStatus('${request.id}', 'DECLINED')">Decline</button>
                            ` : ""}

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


async function setOcularInspectionStatus(id, status) {
    const isDeclining = status === "DECLINED";
    if (isDeclining && !window.confirm("Decline this ocular inspection request?")) return;

    try {
        const result = status === "APPROVED"
            ? await window.supabaseClient.rpc("kq_accept_ocular_inspection_request", { p_request_id: String(id) })
            : await window.supabaseClient
                .from("ocular_inspection_requests")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", id);
        const { error } = result;
        if (error) throw error;

        await loadQuotationRequests();
        showAdminToast(isDeclining ? "Ocular inspection request declined." : "Ocular inspection request accepted.");
    } catch (error) {
        console.error("Ocular inspection status update failed:", error);
        showAdminToast(error.message || "Unable to update ocular inspection request.", "error");
    }
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


    openModal(`

        <h3>
            Ocular Inspection Request
        </h3>


        <div class="quotation-detail-list">


            <div class="quotation-detail-row">
                <span>Request ID</span>
                <strong>
                    ${escapeHtml(request.request_code || `#${request.id}`)}
                </strong>
            </div>

            <div class="quotation-detail-row"><span>Customer Name</span><strong>${escapeHtml(request.customer_name || "Not provided")}</strong></div>
            <div class="quotation-detail-row"><span>Email</span><strong>${escapeHtml(request.customer_email || "Not provided")}</strong></div>
            <div class="quotation-detail-row"><span>Contact Number</span><strong>${escapeHtml(request.customer_contact || "Not provided")}</strong></div>
            <div class="quotation-detail-row"><span>Preferred Inspection</span><strong>${escapeHtml(request.inspection_date || "Date not selected")} ${escapeHtml(request.inspection_time || "")}</strong></div>
            <div class="quotation-detail-row"><span>Venue Name</span><strong>${escapeHtml(request.venue_name || "Not provided")}</strong></div>
            <div class="quotation-detail-row"><span>City / Municipality</span><strong>${escapeHtml([request.inspection_city, request.inspection_province, request.inspection_region].filter(Boolean).join(" — ") || "Not provided / estimate skipped")}</strong></div>
            <div class="quotation-detail-row"><span>Venue Address</span><strong>${escapeHtml(request.inspection_address || "Not provided")}</strong></div>
            <div class="quotation-detail-row"><span>Inspection Fee</span><strong>${request.inspection_fee == null ? "Not calculated" : money(request.inspection_fee)}</strong></div>
            <div class="quotation-detail-row"><span>Distance from North Caloocan</span><strong>${request.inspection_distance_km == null ? "Not calculated" : `${escapeHtml(request.inspection_distance_km)} km`}</strong></div>


            <div class="quotation-detail-row">
                <span>Request Purpose</span>
                <strong>Ocular / Venue Inspection</strong>
            </div>

            <div class="quotation-detail-row">
                <span>Inspection Venue</span>
                <strong>${escapeHtml(request.inspection_address || "Not specified")}</strong>
            </div>


            ${request.design_estimate_package ? `<div class="quotation-detail-row"><span>Image-Matched Suggestion</span><strong>${escapeHtml(request.design_estimate_package)} — ${money(request.design_estimate_price)}</strong></div>` : ""}

            ${request.design_image_path ? `<div class="modal-field full"><label>Customer Design Moodboard</label><p id="adminQuotationImageStatus" class="field-help">Loading private design image…</p><img id="adminQuotationDesignImage" class="admin-design-preview" alt="Customer-uploaded design moodboard" hidden>${Array.isArray(request.design_estimate_features) && request.design_estimate_features.length ? `<p>${escapeHtml(request.design_estimate_explanation || "Free preliminary visual estimate.")}</p><ul class="admin-design-features">${request.design_estimate_features.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}<small class="field-help">Preliminary estimate only; confirm package and final price with the customer.</small></div>` : ""}


        </div>


        <div class="modal-field full"
             style="margin-top:18px;">

            <label for="inspectionDistanceKm">Confirmed Route Distance from North Caloocan (km)</label>
            <input id="inspectionDistanceKm" type="number" min="0" step="0.1" value="${request.inspection_distance_km ?? ""}" placeholder="Enter route distance">

            <label for="inspectionFeeInput" style="margin-top:10px;">Inspection Fee (₱)</label>
            <input id="inspectionFeeInput" type="number" min="0" step="100" value="${request.inspection_fee ?? ""}" placeholder="System-calculated fee">
            <small class="field-help">System-calculated inspection fees are rounded up to the nearest ₱100.</small>

            <label>${request.request_purpose === "OCULAR_INSPECTION" ? "Payment Reference" : "Additional Request"}</label>

            <textarea readonly>${escapeHtml(
        request.additional_request ||
        "No additional request."
    )}</textarea>

        </div>


        <div class="modal-field full"
             style="margin-top:15px;">

            <label>
                Admin Notes
            </label>

            <textarea
                id="quotationAdminNotes"
                placeholder="Add notes or instructions for this customer..."
            >${escapeHtml(
        request.admin_notes || ""
    )}</textarea>

        </div>


        <div class="modal-field full"
             style="margin-top:15px;">

            <label>
                Quotation Status
            </label>

            <select id="quotationStatus">

                <option
                    value="REQUESTED"
                    ${request.status === "REQUESTED"
            ? "selected"
            : ""}>
                    Requested
                </option>

                <option
                    value="REVIEWING"
                    ${request.status === "REVIEWING"
            ? "selected"
            : ""}>
                    Reviewing
                </option>

                <option
                    value="APPROVED"
                    ${request.status === "APPROVED"
            ? "selected"
            : ""}>
                    Approved
                </option>

                <option
                    value="REVISION"
                    ${request.status === "REVISION"
            ? "selected"
            : ""}>
                    Revision Required
                </option>

                <option
                    value="DECLINED"
                    ${request.status === "DECLINED"
            ? "selected"
            : ""}>
                    Declined
                </option>

                <option
                    value="CONVERTED"
                    ${request.status === "CONVERTED"
            ? "selected"
            : ""}>
                    Converted to Booking
                </option>

            </select>

        </div>


        <div class="modal-actions">

            <button
                class="btn primary"
                onclick="updateQuotation('${request.id}')">

                Save Changes

            </button>

        </div>

    `);

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


        closeModal();


        await loadQuotationRequests();


        showAdminToast("Ocular inspection request updated successfully.");


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

async function initializeAdmin() {
    try {
        if (!(await requireAdmin())) return;
        await loadBookings();
        await loadQuotationRequests();
        // Refresh periodically so new customer submissions appear without a manual reload.
        window.setInterval(async () => {
            await loadBookings();
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

initializeAdmin();
