const money = n =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2
    }).format(Number(n) || 0);


function statusClass(status) {

    return String(status || "")
        .toUpperCase()
        .replace(/\s+/g, "_");

}


// ========================================
// GLOBAL DATA
// ========================================

let bookings = [];
let payments = [];
let expenses = [];
let inventory = [];


// ========================================
// CHECK ADMIN
// ========================================

async function checkAdmin() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if (!user) {

        window.location.href =
            "login.html";

        return false;
    }


    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .single();


    if (error || !profile) {

        alert(
            "Unable to verify your account."
        );

        await supabaseClient.auth.signOut();

        window.location.href =
            "login.html";

        return false;
    }


    if (profile.role !== "admin") {

        alert(
            "Access denied. Admin account required."
        );

        window.location.href =
            "index.html";

        return false;
    }


    return true;

}


// ========================================
// LOAD DATA
// ========================================

async function loadBookings() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("bookings")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Bookings error:",
            error
        );

        return;

    }


    bookings = data || [];

}


async function loadPayments() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("payments")
            .select("*");


    if (error) {

        console.error(
            "Payments error:",
            error
        );

        return;

    }


    payments = data || [];

}


async function loadExpenses() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("expenses")
            .select("*")
            .order(
                "expense_date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Expenses error:",
            error
        );

        return;

    }


    expenses = data || [];

}


async function loadInventory() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("inventory")
            .select("*")
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Inventory error:",
            error
        );

        return;

    }


    inventory = data || [];

}


// ========================================
// LOAD EVERYTHING
// ========================================

async function loadAllData() {

    await Promise.all([

        loadBookings(),

        loadPayments(),

        loadExpenses(),

        loadInventory()

    ]);

}


// ========================================
// PAYMENT SYNC
// ========================================

async function syncPayments() {

    for (const booking of bookings) {

        const existing =
            payments.find(
                p =>
                    p.booking_id ===
                    booking.id
            );


        if (!existing) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("payments")
                    .insert({

                        booking_id:
                            booking.id,

                        total:
                            Number(
                                booking.amount
                            ) || 0,

                        paid:
                            0,

                        status:
                            "NO DOWN PAYMENT"

                    })
                    .select()
                    .single();


            if (!error && data) {
                payments.push(data);
            }

        }

    }

}


// ========================================
// NAVIGATION
// ========================================

function showSection(id) {

    document
        .querySelectorAll(".page-section")
        .forEach(function (section) {

            section.classList.toggle(
                "active",
                section.id === id
            );

        });


    document
        .querySelectorAll(".nav-item")
        .forEach(function (button) {

            button.classList.toggle(
                "active",
                button.dataset.section === id
            );

        });


    const titles = {

        dashboard:
            "Admin Dashboard",

        bookings:
            "Booking Management",

        payments:
            "Payment Management",

        sales:
            "Sales Management",

        inventory:
            "Inventory Management"

    };


    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    if (pageTitle) {

        pageTitle.textContent =
            titles[id] ||
            "Admin Dashboard";

    }


    renderAll();

}


// ========================================
// NAV BUTTONS
// ========================================

document
    .querySelectorAll(".nav-item")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                showSection(
                    button.dataset.section
                );

            }
        );

    });


document
    .querySelectorAll("[data-section-jump]")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                showSection(
                    button.dataset.sectionJump
                );

            }
        );

    });


// ========================================
// LOGOUT
// ========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

        }
    );

}


// ========================================
// DASHBOARD
// ========================================

function renderDashboard() {

    const pending =
        bookings.filter(
            b =>
                b.status ===
                "PENDING"
        ).length;


    const approved =
        bookings.filter(
            b =>
                b.status ===
                "APPROVED"
        ).length;


    const declined =
        bookings.filter(
            b =>
                b.status ===
                "DECLINED"
        ).length;


    const today =
        new Date(
            new Date().toDateString()
        );


    const upcoming =
        bookings.filter(
            b =>
                b.status ===
                "APPROVED" &&
                new Date(
                    b.event_date
                ) >= today
        ).length;


    const unpaid =
        payments.filter(
            p =>
                p.status ===
                "NO DOWN PAYMENT"
        ).length;


    const partial =
        payments.filter(
            p =>
                p.status ===
                "PARTIAL PAYMENT" ||
                p.status ===
                "DOWN PAYMENT MADE"
        ).length;


    const paid =
        payments.filter(
            p =>
                p.status ===
                "FULLY PAID"
        ).length;


    const sales =
        payments.reduce(
            (sum, p) =>
                sum +
                Number(p.paid || 0),
            0
        );


    setText(
        "statPending",
        pending
    );

    setText(
        "statApproved",
        approved
    );

    setText(
        "statDeclined",
        declined
    );

    setText(
        "statUpcoming",
        upcoming
    );

    setText(
        "statUnpaid",
        unpaid
    );

    setText(
        "statPartial",
        partial
    );

    setText(
        "statPaid",
        paid
    );

    setText(
        "statSales",
        money(sales)
    );


    const upcomingItems =
        bookings
            .filter(
                b =>
                    b.status ===
                    "APPROVED"
            )
            .sort(
                (a, b) =>
                    new Date(
                        a.event_date
                    ) -
                    new Date(
                        b.event_date
                    )
            )
            .slice(0, 5);


    const upcomingList =
        document.getElementById(
            "upcomingList"
        );


    if (upcomingList) {

        upcomingList.innerHTML =
            upcomingItems.length

                ? upcomingItems.map(
                    b => `
                    <div class="mini-item">
                        <div>
                            <strong>
                                ${escapeHtml(b.full_name)}
                            </strong>

                            <small>
                                ${escapeHtml(b.event_type || "")}
                                •
                                ${escapeHtml(b.event_date || "")}
                            </small>
                        </div>

                        <span class="status APPROVED">
                            APPROVED
                        </span>
                    </div>
                `
                ).join("")

                : `
                    <div class="empty-state">
                        No upcoming approved events.
                    </div>
                `;

    }


    const dashboardInventory =
        document.getElementById(
            "dashboardInventory"
        );


    if (dashboardInventory) {

        dashboardInventory.innerHTML =
            inventory.map(
                i => {

                    const low =
                        Number(i.quantity) <=
                        Number(i.reorder);


                    return `
                        <div class="mini-item">

                            <div>

                                <strong>
                                    ${escapeHtml(i.name)}
                                </strong>

                                <small>
                                    ${i.quantity}
                                    ${escapeHtml(i.unit)}
                                </small>

                            </div>

                            <span class="status ${low
                            ? "CANCELLED"
                            : "APPROVED"
                        }">

                                ${low
                            ? "LOW STOCK"
                            : "AVAILABLE"
                        }

                            </span>

                        </div>
                    `;

                }
            ).join("");

    }

}


// ========================================
// BOOKINGS
// ========================================

function renderBookings() {

    const searchInput =
        document.getElementById(
            "bookingSearch"
        );


    const filterInput =
        document.getElementById(
            "bookingStatusFilter"
        );


    const q =
        searchInput
            ? searchInput.value
                .toLowerCase()
            : "";


    const f =
        filterInput
            ? filterInput.value
            : "ALL";


    const rows =
        bookings
            .filter(function (b) {

                const matches =
                    !q ||
                    [
                        b.full_name,
                        b.email,
                        b.event_type,
                        b.package,
                        b.id
                    ]
                        .join(" ")
                        .toLowerCase()
                        .includes(q);


                return (
                    matches &&
                    (
                        f === "ALL" ||
                        b.status === f
                    )
                );

            })
            .sort(
                (a, b) =>
                    new Date(
                        b.created_at || 0
                    ) -
                    new Date(
                        a.created_at || 0
                    )
            );


    const emptyBookings =
        document.getElementById(
            "emptyBookings"
        );


    const tableBody =
        document.getElementById(
            "bookingTableBody"
        );


    if (emptyBookings) {

        emptyBookings.style.display =
            rows.length
                ? "none"
                : "block";

    }


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        rows.map(
            b => `

            <tr>

                <td>

                    <strong>
                        ${escapeHtml(b.full_name)}
                    </strong>

                    <br>

                    <small>
                        ${escapeHtml(b.email)}
                    </small>

                </td>


                <td>
                    ${escapeHtml(b.event_type || "")}
                </td>


                <td>
                    ${escapeHtml(b.event_date || "")}
                </td>


                <td>
                    ${escapeHtml(
                b.package ||
                "Not selected"
            )}
                </td>


                <td>
                    ${escapeHtml(
                b.time_slot || ""
            )}

                    ${escapeHtml(
                b.start_time || ""
            )}
                </td>


                <td>

                    <span class="status ${statusClass(
                b.status
            )
                }">

                        ${escapeHtml(
                    b.status
                )}

                    </span>

                </td>


                <td>

                    <div class="action-group">

                        <button
                            class="small-btn edit"
                            onclick="viewBooking('${escapeAttr(b.id)}')"
                        >
                            View
                        </button>


                        ${b.status ===
                    "PENDING"

                    ? `

                            <button
                                class="small-btn approve"
                                onclick="changeStatus('${escapeAttr(b.id)}','APPROVED')"
                            >
                                Approve
                            </button>

                            <button
                                class="small-btn decline"
                                onclick="changeStatus('${escapeAttr(b.id)}','DECLINED')"
                            >
                                Decline
                            </button>

                            `

                    : ""
                }


                        ${b.status ===
                    "APPROVED"

                    ? `

                            <button
                                class="small-btn edit"
                                onclick="changeStatus('${escapeAttr(b.id)}','CANCELLED')"
                            >
                                Cancel
                            </button>

                            `

                    : ""
                }


                        ${b.status ===
                    "CANCELLED"

                    ? `

                            <button
                                class="small-btn delete"
                                onclick="deleteBooking('${escapeAttr(b.id)}')"
                            >
                                Delete
                            </button>

                            `

                    : ""
                }

                    </div>

                </td>

            </tr>

        `
        ).join("");

}


// ========================================
// PAYMENTS
// ========================================

function renderPayments() {

    const approved =
        bookings.filter(
            b =>
                b.status ===
                "APPROVED" ||
                b.status ===
                "CANCELLED"
        );


    const contract =
        approved.reduce(
            (sum, b) => {

                const p =
                    payments.find(
                        x =>
                            x.booking_id ===
                            b.id
                    );


                return sum +
                    Number(
                        p?.total ||
                        b.amount ||
                        0
                    );

            },
            0
        );


    const collected =
        approved.reduce(
            (sum, b) => {

                const p =
                    payments.find(
                        x =>
                            x.booking_id ===
                            b.id
                    );


                return sum +
                    Number(
                        p?.paid ||
                        0
                    );

            },
            0
        );


    setText(
        "paymentContract",
        money(contract)
    );

    setText(
        "paymentCollected",
        money(collected)
    );

    setText(
        "paymentBalance",
        money(
            contract -
            collected
        )
    );


    const emptyPayments =
        document.getElementById(
            "emptyPayments"
        );


    if (emptyPayments) {

        emptyPayments.style.display =
            approved.length
                ? "none"
                : "block";

    }


    const tableBody =
        document.getElementById(
            "paymentTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        approved.map(
            b => {

                const p =
                    payments.find(
                        x =>
                            x.booking_id ===
                            b.id
                    ) ||
                    {
                        total:
                            Number(
                                b.amount
                            ) || 0,

                        paid: 0,

                        status:
                            "NO DOWN PAYMENT"
                    };


                return `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(
                    b.full_name
                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                    b.event_type || ""
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    b.event_date || ""
                )}
                        </td>

                        <td>
                            ${money(p.total)}
                        </td>

                        <td>
                            ${money(p.paid)}
                        </td>

                        <td>
                            ${money(
                    Number(p.total) -
                    Number(p.paid)
                )}
                        </td>

                        <td>

                            <span class="status ${p.status ===
                        "FULLY PAID"

                        ? "APPROVED"

                        : p.status ===
                            "NO DOWN PAYMENT"

                            ? "PENDING"

                            : "APPROVED"
                    }">

                                ${escapeHtml(
                        p.status
                    )}

                            </span>

                        </td>

                        <td>

                            <button
                                class="small-btn edit"
                                onclick="editPayment('${escapeAttr(b.id)}')"
                            >
                                Update
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ========================================
// SALES
// ========================================

function renderSales() {

    const revenue =
        payments.reduce(
            (sum, p) =>
                sum +
                Number(p.paid || 0),
            0
        );


    const totalExpenses =
        expenses.reduce(
            (sum, e) =>
                sum +
                Number(e.amount || 0),
            0
        );


    setText(
        "salesRevenue",
        money(revenue)
    );

    setText(
        "salesExpenses",
        money(totalExpenses)
    );

    setText(
        "salesNet",
        money(
            revenue -
            totalExpenses
        )
    );


    const salesTableBody =
        document.getElementById(
            "salesTableBody"
        );


    if (salesTableBody) {

        salesTableBody.innerHTML =
            bookings
                .filter(
                    b =>
                        payments.some(
                            p =>
                                p.booking_id ===
                                b.id
                        )
                )
                .map(
                    b => {

                        const p =
                            payments.find(
                                x =>
                                    x.booking_id ===
                                    b.id
                            ) || {};


                        return `

                            <tr>

                                <td>
                                    ${escapeHtml(
                            b.full_name
                        )}
                                </td>

                                <td>
                                    ${escapeHtml(
                            b.event_type || ""
                        )}
                                </td>

                                <td>
                                    ${money(
                            p.total
                        )}
                                </td>

                                <td>
                                    ${money(
                            p.paid
                        )}
                                </td>

                                <td>
                                    ${money(
                            Number(
                                p.total
                            ) -
                            Number(
                                p.paid
                            )
                        )}
                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

    }


    const expenseList =
        document.getElementById(
            "expenseList"
        );


    if (expenseList) {

        expenseList.innerHTML =
            expenses.length

                ? expenses.map(
                    e => `

                        <div class="expense-item">

                            <span>

                                ${escapeHtml(
                        e.description
                    )}

                                <small>
                                    •
                                    ${escapeHtml(
                        e.expense_date ||
                        ""
                    )}
                                </small>

                            </span>


                            <strong>
                                ${money(e.amount)}
                            </strong>


                            <button
                                class="small-btn delete"
                                onclick="deleteExpense(${e.id})"
                            >
                                ×
                            </button>

                        </div>

                    `
                ).join("")

                : `
                    <div class="empty-state">
                        No expenses recorded.
                    </div>
                `;

    }

}


// ========================================
// INVENTORY
// ========================================

function renderInventory() {

    const tableBody =
        document.getElementById(
            "inventoryTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        inventory.map(
            i => {

                const low =
                    Number(i.quantity) <=
                    Number(i.reorder);


                return `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(i.name)}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                    i.category || ""
                )}
                        </td>

                        <td>
                            ${i.quantity}
                        </td>

                        <td>
                            ${escapeHtml(
                    i.unit || ""
                )}
                        </td>

                        <td>
                            ${money(i.cost)}
                        </td>

                        <td>
                            ${money(
                    Number(i.quantity) *
                    Number(i.cost)
                )}
                        </td>

                        <td>

                            <span class="status ${low
                        ? "CANCELLED"
                        : "APPROVED"
                    }">

                                ${low
                        ? "LOW STOCK"
                        : "AVAILABLE"
                    }

                            </span>

                        </td>

                        <td>

                            <button
                                class="small-btn edit"
                                onclick="editInventory(${i.id})"
                            >
                                Update
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ========================================
// RENDER ALL
// ========================================

function renderAll() {

    renderDashboard();

    renderBookings();

    renderPayments();

    renderSales();

    renderInventory();

}


// ========================================
// CHANGE BOOKING STATUS
// ========================================

async function changeStatus(
    id,
    newStatus
) {

    const booking =
        bookings.find(
            b =>
                b.id === id
        );


    if (!booking) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("bookings")
            .update({

                status:
                    newStatus,

                status_updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Unable to update booking.\n\n" +
            error.message
        );

        return;
    }


    // Create payment record when approved

    if (
        newStatus ===
        "APPROVED"
    ) {

        const existing =
            payments.find(
                p =>
                    p.booking_id ===
                    id
            );


        if (!existing) {

            const {
                error:
                paymentError
            } =
                await supabaseClient
                    .from("payments")
                    .insert({

                        booking_id:
                            id,

                        total:
                            Number(
                                booking.amount
                            ) || 0,

                        paid:
                            0,

                        status:
                            "NO DOWN PAYMENT"

                    });


            if (paymentError) {

                console.error(
                    paymentError
                );

            }

        }

    }


    await loadAllData();

    await syncPayments();

    renderAll();


    alert(
        `Booking ${id} is now ${newStatus}.`
    );

}


// ========================================
// DELETE BOOKING
// ========================================

async function deleteBooking(id) {

    if (
        !confirm(
            "Delete this cancelled booking?"
        )
    ) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("bookings")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Unable to delete booking.\n\n" +
            error.message
        );

        return;
    }


    await loadAllData();

    renderAll();

}


// ========================================
// VIEW BOOKING
// ========================================

function viewBooking(id) {

    const b =
        bookings.find(
            x =>
                x.id === id
        );


    if (!b) {
        return;
    }


    openModal(`

        <h3>
            Booking Details
        </h3>


        <div class="modal-grid">


            <div class="modal-field">

                <label>
                    Booking ID
                </label>

                <input
                    value="${escapeAttr(b.id)}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Status
                </label>

                <input
                    value="${escapeAttr(b.status)}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Client
                </label>

                <input
                    value="${escapeAttr(b.full_name)}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Email
                </label>

                <input
                    value="${escapeAttr(b.email)}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Contact
                </label>

                <input
                    value="${escapeAttr(b.phone || "")}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Event Type
                </label>

                <input
                    value="${escapeAttr(b.event_type || "")}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Event Date
                </label>

                <input
                    value="${escapeAttr(b.event_date || "")}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Guests
                </label>

                <input
                    value="${escapeAttr(b.guests || "")}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Time Preference
                </label>

                <input
                    value="${escapeAttr(b.time_slot || "")}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Start Time
                </label>

                <input
                    value="${escapeAttr(b.start_time || "")}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Package
                </label>

                <input
                    value="${escapeAttr(b.package || "")}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Total Amount
                </label>

                <input
                    value="${money(b.amount)}"
                    readonly
                >

            </div>


            <div class="modal-field full">

                <label>
                    Client Request
                </label>

                <textarea readonly>
${escapeHtml(b.message || "")}
                </textarea>

            </div>


            <div class="modal-field full">

                <label>
                    Admin Notes / Reminders
                </label>

                <textarea id="adminNotes">${escapeHtml(
        b.admin_notes || ""
    )}</textarea>

            </div>


        </div>


        <div class="modal-actions">

            <button
                class="btn primary"
                onclick="saveNotes('${escapeAttr(b.id)}')"
            >
                Save Notes
            </button>

        </div>

    `);

}


// ========================================
// SAVE ADMIN NOTES
// ========================================

async function saveNotes(id) {

    const booking =
        bookings.find(
            x =>
                x.id === id
        );


    if (!booking) {
        return;
    }


    const notes =
        document.getElementById(
            "adminNotes"
        ).value;


    const {
        error
    } =
        await supabaseClient
            .from("bookings")
            .update({

                admin_notes:
                    notes

            })
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Unable to save notes.\n\n" +
            error.message
        );

        return;
    }


    closeModal();

    await loadBookings();

    renderAll();

}


// ========================================
// EDIT PAYMENT
// ========================================

function editPayment(id) {

    const booking =
        bookings.find(
            x =>
                x.id === id
        );


    const payment =
        payments.find(
            x =>
                x.booking_id === id
        );


    if (!booking || !payment) {
        return;
    }


    openModal(`

        <h3>
            Update Payment
        </h3>


        <div class="modal-grid">


            <div class="modal-field">

                <label>
                    Client
                </label>

                <input
                    value="${escapeAttr(
        booking.full_name
    )}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Total Amount
                </label>

                <input
                    value="${money(payment.total)}"
                    readonly
                >

            </div>


            <div class="modal-field">

                <label>
                    Amount Paid
                </label>

                <input
                    type="number"
                    id="paymentPaid"
                    min="0"
                    max="${Number(payment.total)}"
                    value="${Number(payment.paid)}"
                >

            </div>


            <div class="modal-field">

                <label>
                    Payment Status
                </label>


                <select id="paymentStatus">

                    <option ${payment.status ===
            "NO DOWN PAYMENT"
            ? "selected"
            : ""
        }>
                        NO DOWN PAYMENT
                    </option>


                    <option ${payment.status ===
            "DOWN PAYMENT MADE"
            ? "selected"
            : ""
        }>
                        DOWN PAYMENT MADE
                    </option>


                    <option ${payment.status ===
            "PARTIAL PAYMENT"
            ? "selected"
            : ""
        }>
                        PARTIAL PAYMENT
                    </option>


                    <option ${payment.status ===
            "FULLY PAID"
            ? "selected"
            : ""
        }>
                        FULLY PAID
                    </option>

                </select>

            </div>


        </div>


        <div class="modal-actions">

            <button
                class="btn primary"
                onclick="savePayment('${escapeAttr(id)}')"
            >
                Save Payment
            </button>

        </div>

    `);

}


// ========================================
// SAVE PAYMENT
// ========================================

async function savePayment(id) {

    const payment =
        payments.find(
            x =>
                x.booking_id === id
        );


    if (!payment) {
        return;
    }


    const paid =
        Math.max(
            0,
            Math.min(
                Number(payment.total),
                Number(
                    document.getElementById(
                        "paymentPaid"
                    ).value
                ) || 0
            )
        );


    const selected =
        document.getElementById(
            "paymentStatus"
        ).value;


    let status;


    if (paid <= 0) {

        status =
            "NO DOWN PAYMENT";

    } else if (
        paid >=
        Number(payment.total)
    ) {

        status =
            "FULLY PAID";

    } else if (
        selected ===
        "DOWN PAYMENT MADE"
    ) {

        status =
            "DOWN PAYMENT MADE";

    } else {

        status =
            "PARTIAL PAYMENT";

    }


    const {
        error
    } =
        await supabaseClient
            .from("payments")
            .update({

                paid:
                    paid,

                status:
                    status,

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                payment.id
            );


    if (error) {

        alert(
            "Unable to update payment.\n\n" +
            error.message
        );

        return;
    }


    closeModal();

    await loadPayments();

    renderAll();


    alert(
        "Payment status updated."
    );

}


// ========================================
// ADD EXPENSE
// ========================================

const addExpenseBtn =
    document.getElementById(
        "addExpenseBtn"
    );


if (addExpenseBtn) {

    addExpenseBtn.addEventListener(
        "click",
        function () {

            openModal(`

                <h3>
                    Add Expense
                </h3>


                <div class="modal-grid">


                    <div class="modal-field full">

                        <label>
                            Description
                        </label>

                        <input
                            id="expenseDescription"
                            placeholder="e.g. Balloons / Transportation"
                        >

                    </div>


                    <div class="modal-field">

                        <label>
                            Amount
                        </label>

                        <input
                            id="expenseAmount"
                            type="number"
                            min="0"
                            placeholder="0"
                        >

                    </div>


                    <div class="modal-field">

                        <label>
                            Date
                        </label>

                        <input
                            id="expenseDate"
                            type="date"
                            value="${new Date()
                    .toISOString()
                    .slice(0, 10)
                }"
                        >

                    </div>


                </div>


                <div class="modal-actions">

                    <button
                        class="btn primary"
                        onclick="saveExpense()"
                    >
                        Add Expense
                    </button>

                </div>

            `);

        }
    );

}


// ========================================
// SAVE EXPENSE
// ========================================

async function saveExpense() {

    const description =
        document.getElementById(
            "expenseDescription"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            ).value
        ) || 0;


    const date =
        document.getElementById(
            "expenseDate"
        ).value;


    if (
        !description ||
        amount <= 0
    ) {

        alert(
            "Please enter a description and valid amount."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("expenses")
            .insert({

                description:
                    description,

                amount:
                    amount,

                expense_date:
                    date

            });


    if (error) {

        alert(
            "Unable to add expense.\n\n" +
            error.message
        );

        return;
    }


    closeModal();

    await loadExpenses();

    renderAll();

}


// ========================================
// DELETE EXPENSE
// ========================================

async function deleteExpense(id) {

    if (
        !confirm(
            "Delete this expense?"
        )
    ) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("expenses")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Unable to delete expense.\n\n" +
            error.message
        );

        return;
    }


    await loadExpenses();

    renderAll();

}


// ========================================
// INVENTORY FORM
// ========================================

const addInventoryBtn =
    document.getElementById(
        "addInventoryBtn"
    );


if (addInventoryBtn) {

    addInventoryBtn.addEventListener(
        "click",
        function () {

            openInventoryForm();

        }
    );

}


function openInventoryForm(item = null) {

    openModal(`

        <h3>
            ${item ? "Update" : "Add"} Material
        </h3>


        <div class="modal-grid">


            <div class="modal-field">

                <label>
                    Material Name
                </label>

                <input
                    id="invName"
                    value="${escapeAttr(
        item?.name || ""
    )}"
                >

            </div>


            <div class="modal-field">

                <label>
                    Category
                </label>

                <input
                    id="invCategory"
                    value="${escapeAttr(
        item?.category || ""
    )}"
                >

            </div>


            <div class="modal-field">

                <label>
                    Quantity
                </label>

                <input
                    id="invQty"
                    type="number"
                    min="0"
                    value="${item?.quantity ??
        ""
        }"
                >

            </div>


            <div class="modal-field">

                <label>
                    Unit
                </label>

                <input
                    id="invUnit"
                    value="${escapeAttr(
            item?.unit ||
            "pcs"
        )}"
                >

            </div>


            <div class="modal-field">

                <label>
                    Cost per Item
                </label>

                <input
                    id="invCost"
                    type="number"
                    min="0"
                    value="${item?.cost ??
        ""
        }"
                >

            </div>


            <div class="modal-field">

                <label>
                    Low Stock Threshold
                </label>

                <input
                    id="invReorder"
                    type="number"
                    min="0"
                    value="${item?.reorder ??
        5
        }"
                >

            </div>


        </div>


        <div class="modal-actions">

            <button
                class="btn primary"
                onclick="saveInventory(${item?.id ||
        "null"
        })"
            >
                Save Material
            </button>

        </div>

    `);

}


// ========================================
// SAVE INVENTORY
// ========================================

async function saveInventory(id) {

    const data = {

        name:
            document.getElementById(
                "invName"
            ).value.trim(),

        category:
            document.getElementById(
                "invCategory"
            ).value.trim(),

        quantity:
            Number(
                document.getElementById(
                    "invQty"
                ).value
            ) || 0,

        unit:
            document.getElementById(
                "invUnit"
            ).value.trim(),

        cost:
            Number(
                document.getElementById(
                    "invCost"
                ).value
            ) || 0,

        reorder:
            Number(
                document.getElementById(
                    "invReorder"
                ).value
            ) || 0

    };


    if (!data.name) {

        alert(
            "Material name is required."
        );

        return;
    }


    let error;


    if (id) {

        const result =
            await supabaseClient
                .from("inventory")
                .update(data)
                .eq(
                    "id",
                    id
                );

        error =
            result.error;

    } else {

        const result =
            await supabaseClient
                .from("inventory")
                .insert(data);

        error =
            result.error;

    }


    if (error) {

        alert(
            "Unable to save inventory.\n\n" +
            error.message
        );

        return;
    }


    closeModal();

    await loadInventory();

    renderAll();

}


// ========================================
// EDIT INVENTORY
// ========================================

function editInventory(id) {

    const item =
        inventory.find(
            x =>
                x.id === id
        );


    if (item) {

        openInventoryForm(item);

    }

}


// ========================================
// MODAL
// ========================================

function openModal(html) {

    const content =
        document.getElementById(
            "modalContent"
        );

    const modal =
        document.getElementById(
            "modal"
        );


    if (content) {
        content.innerHTML = html;
    }


    if (modal) {
        modal.classList.remove(
            "hidden"
        );
    }

}


function closeModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


const modalClose =
    document.getElementById(
        "modalClose"
    );


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


const modal =
    document.getElementById(
        "modal"
    );


if (modal) {

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target.id ===
                "modal"
            ) {

                closeModal();

            }

        }
    );

}


// ========================================
// SEARCH
// ========================================

const bookingSearch =
    document.getElementById(
        "bookingSearch"
    );


if (bookingSearch) {

    bookingSearch.addEventListener(
        "input",
        renderBookings
    );

}


const bookingStatusFilter =
    document.getElementById(
        "bookingStatusFilter"
    );


if (bookingStatusFilter) {

    bookingStatusFilter.addEventListener(
        "change",
        renderBookings
    );

}


// ========================================
// CALENDAR
// ========================================

const calendarBtn =
    document.getElementById(
        "calendarBtn"
    );


if (calendarBtn) {

    calendarBtn.addEventListener(
        "click",
        function () {

            const now =
                new Date();


            const year =
                now.getFullYear();


            const month =
                now.getMonth();


            const first =
                new Date(
                    year,
                    month,
                    1
                );


            const last =
                new Date(
                    year,
                    month + 1,
                    0
                );


            let html = `

                <h3>
                    ${now.toLocaleString(
                "en-US",
                {
                    month: "long"
                }
            )}
                    ${year}
                </h3>

                <div class="calendar-grid">

            `;


            [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat"
            ].forEach(
                day => {

                    html += `
                        <div>
                            <strong>
                                ${day}
                            </strong>
                        </div>
                    `;

                }
            );


            for (
                let i = 0;
                i < first.getDay();
                i++
            ) {

                html +=
                    "<div></div>";

            }


            for (
                let d = 1;
                d <= last.getDate();
                d++
            ) {

                const iso =
                    `${year}-${String(
                        month + 1
                    ).padStart(
                        2,
                        "0"
                    )}-${String(
                        d
                    ).padStart(
                        2,
                        "0"
                    )}`;


                const events =
                    bookings.filter(
                        b =>
                            b.event_date ===
                            iso &&
                            b.status !==
                            "CANCELLED"
                    );


                html += `

                    <div class="calendar-day">

                        <strong>
                            ${d}
                        </strong>

                        ${events.map(
                    b => `

                                    <span class="calendar-event">

                                        ${escapeHtml(
                        b.full_name
                    )}

                                        <br>

                                        ${escapeHtml(
                        b.status
                    )}

                                    </span>

                                `
                ).join("")
                    }

                    </div>

                `;

            }


            html +=
                "</div>";


            openModal(html);

        }
    );

}


// ========================================
// HELPERS
// ========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


function escapeHtml(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        function (match) {

            return {

                "&":
                    "&amp;",

                "<":
                    "&lt;",

                ">":
                    "&gt;",

                '"':
                    "&quot;",

                "'":
                    "&#039;"

            }[match];

        }
    );

}


function escapeAttr(value) {

    return escapeHtml(value);

}


// ========================================
// INITIALIZE ADMIN
// ========================================

(async function initializeAdmin() {

    const allowed =
        await checkAdmin();

            
    if (!allowed) {
        return;
    }


    await loadAllData();


    await syncPayments();


    renderAll();

})();