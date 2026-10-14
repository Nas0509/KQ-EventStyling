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
            payments.push({ bookingId: b.id, total: Number(b.amount) || 0, paid: 0, status: "NO DOWN PAYMENT" });
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
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (error || profile?.role !== "admin") {
        await window.supabaseClient.auth.signOut();
        window.location.replace("login.html");
        return false;
    }

    const adminEmail = document.querySelector(".admin-user strong");
    if (adminEmail) adminEmail.textContent = session.user.email || "Administrator";
    return true;
}

function showSection(id) {
    document.querySelectorAll(".page-section").forEach(s => s.classList.toggle("active", s.id === id));
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === id));
    const titles = {
        dashboard: "Admin Dashboard",
        bookings: "Booking Management",
        quotations: "Quotation Management",
        payments: "Payment Management",
        sales: "Sales Management",
        inventory: "Inventory Management"
    };
    document.getElementById("pageTitle").textContent = titles[id] || "Admin Dashboard";
    renderAll();
}

document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.section)));
document.querySelectorAll("[data-section-jump]").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.sectionJump)));
document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (window.supabaseClient) await window.supabaseClient.auth.signOut();
    window.location.href = "login.html";
});

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
}

function renderBookings() {
    const q = (document.getElementById("bookingSearch").value || "").toLowerCase();
    const f = document.getElementById("bookingStatusFilter").value;
    const rows = bookings.filter(b => {
        const matches = !q || [b.fullName, b.email, b.eventType, b.package, b.id].join(" ").toLowerCase().includes(q);
        return matches && (f === "ALL" || b.status === f);
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
            <td>${escapeHtml(b.package || "Not selected")}</td><td>${escapeHtml(b.timeSlot || "")} ${escapeHtml(b.startTime || "")}</td>
            <td><span class="status ${statusClass(b.status)}">${escapeHtml(b.status)}</span></td>
            <td><div class="action-group">
                <button class="small-btn edit" onclick="viewBooking('${b.id}')">View</button>
                ${b.status === "PENDING" ? `<button class="small-btn approve" onclick="changeStatus('${b.id}','APPROVED')">Approve</button><button class="small-btn decline" onclick="changeStatus('${b.id}','DECLINED')">Decline</button>` : ""}
                ${b.status === "APPROVED" ? `<button class="small-btn edit" onclick="changeStatus('${b.id}','CANCELLED')">Cancel</button>` : ""}
                ${b.status === "CANCELLED" ? `<button class="small-btn delete" onclick="deleteBooking('${b.id}')">Delete</button>` : ""}
            </div></td>
        </tr>`).join("");
}

function renderPayments() {
    syncPayments();
    const approved = bookings.filter(b => b.status === "APPROVED" || b.status === "CANCELLED");
    const contract = approved.reduce((s, b) => s + Number((payments.find(p => p.bookingId === b.id) || {}).total || b.amount || 0), 0);
    const collected = approved.reduce((s, b) => s + Number((payments.find(p => p.bookingId === b.id) || {}).paid || 0), 0);
    document.getElementById("paymentTotal").textContent = money(contract);
    document.getElementById("paymentCollected").textContent = money(collected);
    document.getElementById("paymentOutstanding").textContent = money(contract - collected);
    document.getElementById("emptyPayments").style.display = approved.length ? "none" : "block";
    document.getElementById("paymentTableBody").innerHTML = approved.map(b => {
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

function renderAll() { renderDashboard(); renderBookings(); renderPayments(); renderSales(); renderInventory(); }

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

async function deleteBooking(id) {
    if (!confirm("Delete this cancelled booking?")) return;
    const { error } = await window.supabaseClient.from("bookings").delete().eq("id", id);
    if (error) { alert(`Unable to delete booking: ${error.message}`); return; }
    bookings = bookings.filter(b => b.id !== id); payments = payments.filter(p => p.bookingId !== id); save(); renderAll();
}

function viewBooking(id) {
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
            <div class="modal-field"><label>Total Amount</label><input value="${money(b.amount)}" readonly></div>
            <div class="modal-field"><label>20% Reservation Fee</label><input value="${money(b.required_down_payment)}" readonly></div>
            <div class="modal-field"><label>Reservation Payment Received</label><input value="${money(b.down_payment_amount)}" readonly></div>
            <div class="modal-field"><label>Payment Check</label><input value="${Number(b.down_payment_amount) >= Number(b.required_down_payment) && Number(b.required_down_payment) > 0 ? "VERIFIED" : "PENDING VERIFICATION"}" readonly></div>
            <div class="modal-field full"><label>Client Request</label><textarea readonly>${escapeHtml(b.message || "")}</textarea></div>
            <div class="modal-field full"><label>Admin Notes / Reminders</label><textarea id="adminNotes">${escapeHtml(b.adminNotes || "")}</textarea></div>
        </div>
        <div class="modal-actions">
            ${Number(b.required_down_payment) > 0 && Number(b.down_payment_amount) < Number(b.required_down_payment) ? `<button class="btn primary" onclick="verifyReservationFee('${escapeAttr(b.id)}')">Mark 20% Fee Verified</button>` : ""}
            <button class="btn primary" onclick="saveNotes('${escapeAttr(b.id)}')">Save Notes</button>
        </div>
        ${Number(b.required_down_payment) > 0 && Number(b.down_payment_amount) < Number(b.required_down_payment) ? '<small class="field-help">Only mark this after checking the transaction reference in your payment account.</small>' : ""}`);
}

async function verifyReservationFee(id) {
    const booking = bookings.find(item => item.id === id);
    if (!booking) return;
    const fee = Number(booking.required_down_payment) || 0;
    if (!fee) { alert("This booking has no reservation fee recorded."); return; }
    if (!confirm(`Have you verified the client's payment? This will record ${money(fee)} as received.`)) return;

    const { error } = await window.supabaseClient
        .from("bookings")
        .update({ down_payment_amount: fee })
        .eq("id", id);
    if (error) { alert(`Unable to record the verified payment: ${error.message}`); return; }

    booking.down_payment_amount = fee;
    save();
    renderAll();
    viewBooking(id);
}

function saveNotes(id) {
    const b = bookings.find(x => x.id === id); if (!b) return;
    b.adminNotes = document.getElementById("adminNotes").value; save(); closeModal(); renderAll(); alert("Admin notes saved.");
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

function savePayment(id) {
    const p = payments.find(x => x.bookingId === id); if (!p) return;
    p.paid = Math.max(0, Math.min(Number(p.total), Number(document.getElementById("paymentPaid").value) || 0));
    const selected = document.getElementById("paymentStatus").value;
    p.status = p.paid <= 0 ? "NO DOWN PAYMENT" : p.paid >= Number(p.total) ? "FULLY PAID" : selected === "DOWN PAYMENT MADE" && p.paid > 0 ? "DOWN PAYMENT MADE" : "PARTIAL PAYMENT";
    p.updatedAt = new Date().toISOString(); save(); closeModal(); renderAll(); alert("Payment status updated.");
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

function openModal(html) { document.getElementById("modalContent").innerHTML = html; document.getElementById("modal").classList.remove("hidden") }
function closeModal() { document.getElementById("modal").classList.add("hidden") }
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal() });

document.getElementById("bookingSearch").addEventListener("input", renderBookings);
document.getElementById("bookingStatusFilter").addEventListener("change", renderBookings);

document.getElementById("calendarBtn").addEventListener("click", () => {
    const now = new Date(), year = now.getFullYear(), month = now.getMonth(), first = new Date(year, month, 1), last = new Date(year, month + 1, 0);
    let html = `<h3>${now.toLocaleString("en-US", { month: "long" })} ${year}</h3><div class="calendar-grid">`;
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => html += `<div><strong>${d}</strong></div>`);
    for (let i = 0; i < first.getDay(); i++)html += "<div></div>";
    for (let d = 1; d <= last.getDate(); d++) {
        const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const events = bookings.filter(b => b.eventDate === iso && b.status !== "CANCELLED");
        html += `<div class="calendar-day"><strong>${d}</strong>${events.map(b => `<span class="calendar-event">${escapeHtml(b.fullName)}<br>${escapeHtml(b.status)}</span>`).join("")}</div>`;
    }
    html += "</div>"; openModal(html);
});

function escapeHtml(v) { return String(v ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])) }
function escapeAttr(v) { return escapeHtml(v) }

renderAll();

// ========================================
// QUOTATION REQUEST MANAGEMENT
// SUPABASE
// ========================================

let quotationRequests = [];


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

            .from("quotation_requests")

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
                        Unable to load quotation requests.
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

                    request.package_name,

                    request.event_type,

                    request.celebrant_name,

                    request.theme,

                    request.color,

                    request.character,

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

            const color =
                request.color || "";


            const colorDisplay =
                color.startsWith("#")

                    ? `
                        <span class="quotation-color">
                            <span
                                class="quotation-color-circle"
                                style="background:${escapeAttr(color)}">
                            </span>

                            ${escapeHtml(color)}
                        </span>
                    `

                    : escapeHtml(
                        color || "Not specified"
                    );


            return `

                <tr>

                    <td>
                        <strong>
                            Customer
                        </strong>

                        <br>

                        <small>
                            ${escapeHtml(
                request.user_id
            )}
                        </small>
                    </td>


                    <td>

                        <strong>
                            ${escapeHtml(
                request.event_type
            )}
                        </strong>

                        <br>

                        <small>
                            ${escapeHtml(
                request.celebrant_name ||
                "No name"
            )}
                        </small>

                    </td>


                    <td>

                        ${escapeHtml(
                request.package_name
            )}

                    </td>


                    <td>

                        ${money(
                request.package_price
            )}

                    </td>


                    <td>

                        ${escapeHtml(
                request.theme ||
                "Not specified"
            )}

                    </td>


                    <td>

                        ${colorDisplay}

                    </td>


                    <td>

                        <span
                            class="status ${statusClass(
                request.status
            )}">

                            ${escapeHtml(
                request.status
            )}

                        </span>

                    </td>


                    <td>

                        <div class="action-group">

                            <button
                                class="small-btn edit"
                                onclick="viewQuotation('${request.id}')">

                                View

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

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


    const color =
        request.color || "Not specified";


    const colorPreview =
        color.startsWith("#")

            ? `
                <span class="quotation-color">
                    <span
                        class="quotation-color-circle"
                        style="background:${escapeAttr(color)}">
                    </span>

                    ${escapeHtml(color)}
                </span>
            `

            : escapeHtml(color);


    openModal(`

        <h3>
            Styling Quotation Request
        </h3>


        <div class="quotation-detail-list">


            <div class="quotation-detail-row">
                <span>Request ID</span>
                <strong>
                    #${escapeHtml(request.id)}
                </strong>
            </div>


            <div class="quotation-detail-row">
                <span>Event Type</span>
                <strong>
                    ${escapeHtml(
        request.event_type
    )}
                </strong>
            </div>


            <div class="quotation-detail-row">
                <span>Celebrant / Couple</span>
                <strong>
                    ${escapeHtml(
        request.celebrant_name ||
        "Not specified"
    )}
                </strong>
            </div>


            <div class="quotation-detail-row">
                <span>Styling Category</span>
                <strong>
                    ${escapeHtml(
        request.category
    )}
                </strong>
            </div>


            <div class="quotation-detail-row">
                <span>Package</span>
                <strong>
                    ${escapeHtml(
        request.package_name
    )}
                </strong>
            </div>


            <div class="quotation-detail-row">
                <span>Estimated Price</span>
                <strong>
                    ${money(
        request.package_price
    )}
                </strong>
            </div>


            <div class="quotation-detail-row">
                <span>Theme / Concept</span>
                <strong>
                    ${escapeHtml(
        request.theme ||
        "Not specified"
    )}
                </strong>
            </div>


            <div class="quotation-detail-row">
                <span>Preferred Color</span>
                <strong>
                    ${colorPreview}
                </strong>
            </div>


            <div class="quotation-detail-row">
                <span>Character / Reference</span>
                <strong>
                    ${escapeHtml(
        request.character ||
        "Not specified"
    )}
                </strong>
            </div>


        </div>


        <div class="modal-field full"
             style="margin-top:18px;">

            <label>
                Additional Request
            </label>

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


    if (!status) return;


    try {

        const {
            error
        } = await window.supabaseClient

            .from("quotation_requests")

            .update({

                status:
                    status,

                admin_notes:
                    adminNotes,

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                id
            );


        if (error) {

            throw error;

        }


        closeModal();


        await loadQuotationRequests();


        alert(
            "Quotation request updated successfully."
        );


    } catch (error) {

        console.error(
            "Quotation update error:",
            error
        );


        alert(
            error.message ||
            "Unable to update quotation request."
        );

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
        window.setInterval(loadBookings, 30000);
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
