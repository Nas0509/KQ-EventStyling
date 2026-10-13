// ========================================
// KQ EVENT STYLING
// CUSTOMER BOOKING SYSTEM
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    console.log("✅ CUSTOMER user-booking.js LOADED");


    // ========================================
    // ELEMENTS
    // ========================================

    const bookingForm =
        document.getElementById("bookingForm");

    const packageButtons =
        document.querySelectorAll(".package-button");

    const eventDate =
        document.getElementById("eventDate");

    const timeSection =
        document.getElementById("timeSection");

    const timeSlot =
        document.getElementById("timeSlot");

    const startTime =
        document.getElementById("startTime");

    const loginModal =
        document.getElementById("loginRequiredModal");

    const notNowBtn =
        document.getElementById("notNowBtn");

    const loginRequiredBtn =
        document.getElementById("loginRequiredBtn");


    // ========================================
    // SELECTED PACKAGE
    // ========================================

    let selectedPackage =
        sessionStorage.getItem(
            "kqSelectedPackage"
        ) || "";


    // ========================================
    // CHECK BOOKING FORM
    // ========================================

    if (!bookingForm) {

        console.warn(
            "⚠️ bookingForm was not found."
        );

        return;
    }


    // ========================================
    // PACKAGE SELECTION
    // ========================================

    packageButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    selectedPackage =
                        button.dataset.package || "";


                    sessionStorage.setItem(
                        "kqSelectedPackage",
                        selectedPackage
                    );


                    packageButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    console.log(
                        "📦 Selected package:",
                        selectedPackage
                    );

                }
            );


            // Restore selected package

            if (
                button.dataset.package ===
                selectedPackage
            ) {

                button.classList.add(
                    "selected"
                );

            }

        }
    );


    // ========================================
    // EVENT DATE / TIME
    // ========================================

    if (eventDate) {

        const today =
            new Date();


        const localToday =
            [
                today.getFullYear(),

                String(
                    today.getMonth() + 1
                ).padStart(2, "0"),

                String(
                    today.getDate()
                ).padStart(2, "0")

            ].join("-");


        eventDate.min =
            localToday;


        function updateTimeSection() {

            if (!timeSection) {
                return;
            }


            if (eventDate.value) {

                timeSection.style.display =
                    "block";


                if (timeSlot) {

                    timeSlot.required =
                        true;

                }


                if (startTime) {

                    startTime.required =
                        true;

                }

            } else {

                timeSection.style.display =
                    "none";


                if (timeSlot) {

                    timeSlot.required =
                        false;

                }


                if (startTime) {

                    startTime.required =
                        false;

                }

            }

        }


        eventDate.addEventListener(
            "change",
            updateTimeSection
        );


        updateTimeSection();

    }


    // ========================================
    // LOGIN REQUIRED MODAL
    // ========================================

    function showLoginRequiredModal() {

        console.log(
            "🔐 Login required modal requested."
        );


        if (!loginModal) {

            console.error(
                "❌ loginRequiredModal was not found in index.html."
            );


            alert(
                "Please login first before submitting your booking."
            );

            return;
        }


        loginModal.classList.add(
            "show"
        );


        loginModal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";

    }


    // ========================================
    // CLOSE LOGIN REQUIRED MODAL
    // ========================================

    function closeLoginRequiredModal() {

        if (!loginModal) {
            return;
        }


        loginModal.classList.remove(
            "show"
        );


        loginModal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";

    }


    // ========================================
    // NOT NOW
    // ========================================

    if (notNowBtn) {

        notNowBtn.addEventListener(
            "click",
            function () {

                closeLoginRequiredModal();

            }
        );

    }


    // ========================================
    // LOGIN NOW
    // ========================================

    if (loginRequiredBtn) {

        loginRequiredBtn.addEventListener(
            "click",
            function () {

                console.log(
                    "➡️ Login Now clicked."
                );


                // ========================================
                // SAVE BOOKING FORM
                // ========================================

                const draft = {};


                new FormData(
                    bookingForm
                ).forEach(
                    function (
                        value,
                        key
                    ) {

                        draft[key] =
                            value;

                    }
                );


                sessionStorage.setItem(
                    "kqBookingFormDraft",
                    JSON.stringify(
                        draft
                    )
                );


                // ========================================
                // SAVE PACKAGE
                // ========================================

                sessionStorage.setItem(
                    "kqSelectedPackage",
                    selectedPackage
                );


                // ========================================
                // SAVE RETURN PAGE
                // ========================================

                sessionStorage.setItem(
                    "kqReturnAfterLogin",
                    "index.html#booking"
                );


                // ========================================
                // GO LOGIN
                // ========================================

                window.location.href =
                    "login.html";

            }
        );

    }


    // ========================================
    // CLOSE MODAL WHEN CLICKING OUTSIDE
    // ========================================

    if (loginModal) {

        loginModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    loginModal
                ) {

                    closeLoginRequiredModal();

                }

            }
        );

    }


    // ========================================
    // ESC KEY
    // ========================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                loginModal &&
                loginModal.classList.contains("show")
            ) {

                closeLoginRequiredModal();

            }

        }
    );


    // ========================================
    // RESTORE BOOKING DRAFT
    // ========================================

    const savedDraft =
        sessionStorage.getItem(
            "kqBookingFormDraft"
        );


    if (
        savedDraft &&
        bookingForm
    ) {

        try {

            const draft =
                JSON.parse(
                    savedDraft
                );


            Object.keys(
                draft
            ).forEach(
                function (key) {

                    const field =
                        bookingForm.elements.namedItem(
                            key
                        );


                    if (!field) {
                        return;
                    }


                    // Checkbox

                    if (
                        field.type ===
                        "checkbox"
                    ) {

                        field.checked =
                            draft[key] ===
                            "on" ||
                            draft[key] ===
                            true;

                    }


                    // Other inputs

                    else {

                        field.value =
                            draft[key];

                    }

                }
            );


            if (eventDate) {

                eventDate.dispatchEvent(
                    new Event(
                        "change"
                    )
                );

            }


            console.log(
                "✅ Booking draft restored."
            );


        } catch (error) {

            console.error(
                "❌ Unable to restore booking draft:",
                error
            );

        }

    }


    // ========================================
    // SUCCESS MODAL
    // ========================================

    function showBookingSuccessModal() {

        const existingModal =
            document.getElementById(
                "bookingSuccessModal"
            );


        if (existingModal) {

            existingModal.remove();

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "bookingSuccessModal";


        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 20px;
        `;


        modal.innerHTML = `

            <div style="
                width: 100%;
                max-width: 430px;
                background: white;
                border-radius: 20px;
                padding: 35px 25px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            ">

                <div style="
                    font-size: 52px;
                    margin-bottom: 15px;
                ">
                    🎉
                </div>


                <h2 style="
                    margin-bottom: 12px;
                    color: #173b55;
                ">
                    Booking Submitted!
                </h2>


                <p style="
                    line-height: 1.7;
                    color: #52636e;
                ">
                    Your booking request has been
                    submitted successfully.

                    KQ Event Styling will review
                    your request.
                </p>


                <button
                    type="button"
                    id="closeBookingSuccess"
                    style="
                        margin-top: 22px;
                        width: 100%;
                        padding: 14px;
                        border: none;
                        border-radius: 12px;
                        background: #249bd3;
                        color: white;
                        font-size: 15px;
                        font-weight: bold;
                        cursor: pointer;
                    "
                >
                    Done
                </button>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document.body.style.overflow =
            "hidden";


        const closeButton =
            document.getElementById(
                "closeBookingSuccess"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function () {

                    modal.remove();

                    document.body.style.overflow =
                        "";

                }
            );

        }

    }


    // ========================================
    // SUBMIT BOOKING
    // ========================================

    bookingForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            console.log(
                "📋 BOOKING SUBMIT CLICKED"
            );


            const submitButton =
                bookingForm.querySelector(
                    'button[type="submit"]'
                );


            const originalText =
                submitButton
                    ? submitButton.textContent
                    : "Submit Booking Request";


            try {

                // ========================================
                // CHECK SUPABASE
                // ========================================

                if (
                    !window.supabaseClient
                ) {

                    throw new Error(
                        "Supabase is not connected."
                    );

                }


                // ========================================
                // CHECK SESSION
                // ========================================

                console.log(
                    "🔎 Checking Supabase session..."
                );


                const {
                    data: {
                        session
                    },
                    error: sessionError
                } =
                    await window.supabaseClient
                        .auth
                        .getSession();


                if (sessionError) {

                    console.error(
                        "Session error:",
                        sessionError
                    );

                }


                // ========================================
                // GUEST
                // ========================================

                if (!session) {

                    console.log(
                        "👤 User is NOT logged in."
                    );


                    // SAVE DRAFT

                    const draft = {};


                    new FormData(
                        bookingForm
                    ).forEach(
                        function (
                            value,
                            key
                        ) {

                            draft[key] =
                                value;

                        }
                    );


                    sessionStorage.setItem(
                        "kqBookingFormDraft",
                        JSON.stringify(
                            draft
                        )
                    );


                    sessionStorage.setItem(
                        "kqSelectedPackage",
                        selectedPackage
                    );


                    // SHOW MODAL

                    showLoginRequiredModal();


                    return;

                }


                // ========================================
                // LOGGED IN
                // ========================================

                const user =
                    session.user;


                console.log(
                    "✅ Logged in user:",
                    user.email
                );


                // ========================================
                // DISABLE SUBMIT
                // ========================================

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Submitting...";

                }


                // ========================================
                // GET FORM VALUES
                // ========================================

                const fullName =
                    document.getElementById(
                        "fullName"
                    )?.value.trim() || "";


                const email =
                    document.getElementById(
                        "email"
                    )?.value.trim() || "";


                const phone =
                    document.getElementById(
                        "phone"
                    )?.value.trim() || "";


                const eventType =
                    document.getElementById(
                        "eventType"
                    )?.value || "";


                const selectedDate =
                    document.getElementById(
                        "eventDate"
                    )?.value || "";


                const guests =
                    Number(
                        document.getElementById(
                            "guests"
                        )?.value
                    ) || 0;


                const selectedTimeSlot =
                    timeSlot
                        ? timeSlot.value
                        : "";


                const selectedStartTime =
                    startTime
                        ? startTime.value
                        : "";


                const message =
                    document.getElementById(
                        "message"
                    )?.value.trim() || "";


                // ========================================
                // VALIDATION
                // ========================================

                if (!fullName) {

                    throw new Error(
                        "Please enter your full name."
                    );

                }


                if (!email) {

                    throw new Error(
                        "Please enter your email."
                    );

                }


                if (!eventType) {

                    throw new Error(
                        "Please select your event type."
                    );

                }


                if (!selectedDate) {

                    throw new Error(
                        "Please select your event date."
                    );

                }


                // ========================================
                // CALCULATE PACKAGE AMOUNT
                // ========================================

                let amount =
                    0;


                if (selectedPackage) {

                    const priceMatch =
                        selectedPackage.match(
                            /₱\s*([\d,]+(?:\.\d+)?)/
                        );


                    if (priceMatch) {

                        amount =
                            Number(
                                priceMatch[1]
                                    .replace(
                                        /,/g,
                                        ""
                                    )
                            ) || 0;

                    }

                }


                console.log(
                    "💰 Package:",
                    selectedPackage
                );


                console.log(
                    "💰 Amount:",
                    amount
                );


                // ========================================
                // GET PROFILE
                // ========================================

                const {
                    data: profile,
                    error: profileError
                } =
                    await window.supabaseClient
                        .from("profiles")
                        .select(
                            "full_name,email,contact_number"
                        )
                        .eq(
                            "id",
                            user.id
                        )
                        .single();


                if (
                    profileError &&
                    profileError.code !==
                    "PGRST116"
                ) {

                    console.warn(
                        "Profile lookup warning:",
                        profileError
                    );

                }


                // ========================================
                // BOOKING ID
                // ========================================

                const bookingId =
                    "KQ-" +
                    crypto.randomUUID()
                        .replace(
                            /-/g,
                            ""
                        )
                        .substring(
                            0,
                            12
                        );


                // ========================================
                // BOOKING DATA
                // ========================================

                const bookingData = {

                    id:
                        bookingId,

                    user_id:
                        user.id,

                    full_name:
                        fullName ||
                        profile?.full_name ||
                        "",

                    email:
                        email ||
                        profile?.email ||
                        user.email ||
                        "",

                    phone:
                        phone ||
                        profile?.contact_number ||
                        "",

                    event_type:
                        eventType,

                    event_date:
                        selectedDate,

                    guests:
                        guests,

                    time_slot:
                        selectedTimeSlot,

                    start_time:
                        selectedStartTime,

                    message:
                        message,

                    package:
                        selectedPackage ||
                        "Not selected",

                    amount:
                        amount,

                    status:
                        "PENDING"

                };


                console.log(
                    "📦 Booking data:",
                    bookingData
                );


                // ========================================
                // INSERT TO SUPABASE
                // ========================================

                const {
                    data: booking,
                    error: bookingError
                } =
                    await window.supabaseClient
                        .from("bookings")
                        .insert(
                            bookingData
                        )
                        .select()
                        .single();


                if (bookingError) {

                    console.error(
                        "❌ Supabase booking error:",
                        bookingError
                    );


                    throw bookingError;

                }


                console.log(
                    "✅ BOOKING CREATED:",
                    booking
                );


                // ========================================
                // CLEAR SAVED DATA
                // ========================================

                sessionStorage.removeItem(
                    "kqBookingFormDraft"
                );


                sessionStorage.removeItem(
                    "kqSelectedPackage"
                );


                sessionStorage.removeItem(
                    "kqReturnAfterLogin"
                );


                selectedPackage =
                    "";


                packageButtons.forEach(
                    function (button) {

                        button.classList.remove(
                            "selected"
                        );

                    }
                );


                // ========================================
                // RESET FORM
                // ========================================

                bookingForm.reset();


                if (timeSection) {

                    timeSection.style.display =
                        "none";

                }


                if (timeSlot) {

                    timeSlot.required =
                        false;

                }


                if (startTime) {

                    startTime.required =
                        false;

                }


                // ========================================
                // SUCCESS MODAL
                // ========================================

                showBookingSuccessModal();


            } catch (error) {

                console.error(
                    "❌ BOOKING SUBMISSION ERROR:",
                    error
                );


                alert(
                    "Unable to submit booking.\n\n" +
                    (
                        error.message ||
                        "Please try again."
                    )
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalText;

                }

            }

        }
    );


    // ========================================
    // INITIALIZATION COMPLETE
    // ========================================

    console.log(
        "✅ Customer booking system ready."
    );

});