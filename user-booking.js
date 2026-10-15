// ========================================
// KQ EVENT STYLING
// CUSTOMER BOOKING SYSTEM
// ========================================

document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ CUSTOMER user-booking.js LOADED");

    // ========================================
    // ELEMENTS
    // ========================================

    const bookingForm = document.getElementById("bookingForm");
    const packageButtons = document.querySelectorAll(".package-button");
    const eventDate = document.getElementById("eventDate");
    const timeSection = document.getElementById("timeSection");
    const startTime = document.getElementById("startTime");
    const paymentReferenceInput = document.getElementById("paymentReference");
    const packageAmountText = document.getElementById("packageAmount");
    const reservationFeeText = document.getElementById("reservationFeeAmount");
    const remainingBalanceText = document.getElementById("remainingBalanceAmount");

    const loginModal = document.getElementById("loginRequiredModal");
    const notNowBtn = document.getElementById("notNowBtn");
    const loginRequiredBtn = document.getElementById("loginRequiredBtn");

    // ========================================
    // SELECTED PACKAGE
    // ========================================

    let selectedPackage = sessionStorage.getItem("kqSelectedPackage") || "";

    const pesoFormat = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0
    });

    function getPackageAmount(packageName) {
        const priceMatch = String(packageName || "").match(/₱\s*([\d,]+(?:\.\d+)?)/);
        return priceMatch ? Number(priceMatch[1].replace(/,/g, "")) || 0 : 0;
    }

    // The existing booking table stores package_type as SMALL or BIG.
    function getDatabasePackageType(packageName) {
        const amount = getPackageAmount(packageName);
        const selectedButton = Array.from(packageButtons).find(button => button.dataset.package === packageName);
        const category = selectedButton?.dataset.packageCategory || (amount === 6500 ? "simple" : amount >= 7900 ? "venue" : "");
        if (category === "simple") return "SMALL";
        if (["venue", "full"].includes(category)) return "BIG";
        return "";
    }

    function updateReservationPayment() {
        const total = getPackageAmount(selectedPackage);
        const fee = Math.round(total * 0.3);

        if (packageAmountText) packageAmountText.textContent = total ? pesoFormat.format(total) : "Select a package";
        if (reservationFeeText) reservationFeeText.textContent = total ? pesoFormat.format(fee) : "—";
        if (remainingBalanceText) remainingBalanceText.textContent = total ? pesoFormat.format(total - fee) : "—";
        if (paymentReferenceInput) paymentReferenceInput.disabled = !total;

        return { total, fee };
    }

    function updateSelectedPackageCard(packageName) {
        const selectedPackageLabel = document.getElementById("bookingSelectedPackage");
        const title = selectedPackageLabel?.querySelector("strong");
        const description = selectedPackageLabel?.querySelector("p");
        const editLink = selectedPackageLabel?.querySelector("a");

        if (!packageName) {
            if (title) title.textContent = "Package selection";
            if (description) description.textContent = "Choose your package from the Packages section above.";
            if (editLink) {
                editLink.href = "#packages";
                editLink.textContent = "View packages";
            }
            return;
        }

        if (title) title.textContent = packageName.split(" - ₱")[0];
        if (description) description.textContent = "Crew meal and transportation are not included. Price may vary by venue; ocular inspection is required.";
        if (editLink) {
            editLink.href = "#packages";
            editLink.textContent = "View package details";
        }
    }

    // ========================================
    // CHECK BOOKING FORM
    // ========================================

    if (!bookingForm) {
        console.warn("⚠️ bookingForm was not found.");
        return;
    }

    // ========================================
    // PACKAGE SELECTION
    // ========================================

    packageButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            selectedPackage = button.dataset.package || "";

            sessionStorage.setItem("kqSelectedPackage", selectedPackage);

            updateSelectedPackageCard(selectedPackage);

            packageButtons.forEach(function (btn) {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");
            updateReservationPayment();

            console.log("📦 Selected package:", selectedPackage);
        });

        if (button.dataset.package === selectedPackage) {
            button.classList.add("selected");
        }
    });

    updateSelectedPackageCard(selectedPackage);
    updateReservationPayment();

    // ========================================
    // EVENT DATE MINIMUM
    // ========================================

    const calendarMonthLabel = document.getElementById("calendarMonthLabel");
    const calendarDays = document.getElementById("calendarDays");
    const calendarHelp = document.getElementById("calendarHelp");
    const calendarPrevious = document.getElementById("calendarPrevious");
    const calendarNext = document.getElementById("calendarNext");
    const bookingTimeSlots = document.getElementById("bookingTimeSlots");
    const timeSlotInput = document.getElementById("timeSlot");
    const slotButtons = Array.from(document.querySelectorAll(".time-slot-option"));
    const today = new Date();
    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
    const displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (eventDate?.value) {
        const restoredDateParts = eventDate.value.split("-").map(Number);
        if (restoredDateParts.length === 3 && restoredDateParts.every(Number.isFinite)) {
            displayedMonth.setFullYear(restoredDateParts[0], restoredDateParts[1] - 1, 1);
        }
    }
    let availabilityByDate = new Map();
    let availabilityLoaded = false;
    let selectedTimeSlot = "";

    if (eventDate) eventDate.min = localToday;

    function dateToLocalIso(year, monthIndex, day) {
        return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    function getSlotForTime(value) {
        const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
        if (!match) return "";
        const minutes = Number(match[1]) * 60 + Number(match[2]);
        if (minutes >= 360 && minutes < 720) return "MORNING";
        if (minutes >= 720 && minutes < 1080) return "AFTERNOON";
        if (minutes >= 1080 && minutes < 1440) return "NIGHT";
        return "";
    }

    function slotLabel(slot) {
        return ({ MORNING: "Morning", AFTERNOON: "Afternoon", NIGHT: "Night" })[slot] || "";
    }

    function updateSelectedDateSlots() {
        if (!bookingTimeSlots || !eventDate?.value) {
            if (bookingTimeSlots) bookingTimeSlots.hidden = true;
            return;
        }

        const availability = availabilityByDate.get(eventDate.value);
        if (!availability || !availabilityLoaded) {
            bookingTimeSlots.hidden = true;
            return;
        }

        bookingTimeSlots.hidden = false;
        slotButtons.forEach(button => {
            const slot = button.dataset.slot;
            const taken = Boolean(availability[slot]);
            const status = button.querySelector("small");
            button.disabled = taken;
            button.classList.toggle("selected", selectedTimeSlot === slot);
            if (status) status.textContent = taken ? "Already booked" : "Available";
        });
    }

    function renderBookingCalendar() {
        if (!calendarMonthLabel || !calendarDays) return;
        const year = displayedMonth.getFullYear();
        const month = displayedMonth.getMonth();
        calendarMonthLabel.textContent = new Intl.DateTimeFormat("en", {
            month: "long", year: "numeric"
        }).format(displayedMonth);
        calendarDays.innerHTML = "";

        const firstWeekday = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let blank = 0; blank < firstWeekday; blank++) {
            const empty = document.createElement("span");
            empty.className = "booking-calendar-day outside-month";
            empty.setAttribute("aria-hidden", "true");
            calendarDays.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const iso = dateToLocalIso(year, month, day);
            const date = new Date(year, month, day);
            const data = availabilityByDate.get(iso);
            const isFull = data && data.MORNING && data.AFTERNOON && data.NIGHT;
            const past = iso < localToday;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "booking-calendar-day";
            button.textContent = String(day);
            button.setAttribute("role", "gridcell");
            button.setAttribute("aria-label", `${new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(date)}${isFull ? ", fully booked" : data && (data.MORNING || data.AFTERNOON || data.NIGHT) ? ", some time slots taken" : ", all time slots available"}`);
            if (data && !isFull && (data.MORNING || data.AFTERNOON || data.NIGHT)) button.classList.add("partial");
            if (isFull) button.classList.add("full");
            if (eventDate?.value === iso) button.classList.add("selected");
            button.disabled = past || !availabilityLoaded || !data || isFull;
            button.addEventListener("click", () => {
                if (!eventDate) return;
                eventDate.value = iso;
                selectedTimeSlot = "";
                if (timeSlotInput) timeSlotInput.value = "";
                if (startTime) startTime.value = "";
                if (selectedTimeText) selectedTimeText.textContent = "Choose event time";
                renderBookingCalendar();
                updateSelectedDateSlots();
                if (calendarHelp) {
                    calendarHelp.textContent = `${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date)} selected. Choose one available time slot.`;
                }
            });
            calendarDays.appendChild(button);
        }
    }

    async function loadAvailabilityForMonth() {
        if (!calendarDays || !window.supabaseClient) {
            availabilityLoaded = false;
            if (calendarHelp) calendarHelp.textContent = "Calendar availability is unavailable. Please refresh or try again later.";
            renderBookingCalendar();
            return;
        }

        availabilityLoaded = false;
        if (calendarHelp) calendarHelp.textContent = "Loading date availability…";
        renderBookingCalendar();
        const start = dateToLocalIso(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
        const end = dateToLocalIso(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth(),
            new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate()
        );
        const { data, error } = await window.supabaseClient.rpc("kq_booking_slot_availability", {
            p_start_date: start,
            p_end_date: end
        });

        if (error) {
            console.error("Booking calendar availability error:", error);
            availabilityLoaded = false;
            if (calendarHelp) calendarHelp.textContent = "Availability setup is not active yet. Run booking-slot-availability.sql in the Supabase SQL Editor, then refresh.";
            renderBookingCalendar();
            updateSelectedDateSlots();
            return;
        }

        availabilityByDate = new Map((data || []).map(row => [row.event_date, {
            MORNING: Boolean(row.morning_booked),
            AFTERNOON: Boolean(row.afternoon_booked),
            NIGHT: Boolean(row.night_booked)
        }]));
        availabilityLoaded = true;
        renderBookingCalendar();
        updateSelectedDateSlots();
        if (calendarHelp && !eventDate?.value) calendarHelp.textContent = "Approved event bookings and accepted ocular inspections reserve one morning, afternoon, or night slot. Pending requests do not hold it.";
        if (eventDate?.value && calendarHelp) {
            calendarHelp.textContent = `${eventDate.value} selected. Choose one available time slot.`;
        }
    }

    calendarPrevious?.addEventListener("click", () => {
        if (displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth()) return;
        displayedMonth.setMonth(displayedMonth.getMonth() - 1);
        loadAvailabilityForMonth();
    });
    calendarNext?.addEventListener("click", () => {
        displayedMonth.setMonth(displayedMonth.getMonth() + 1);
        loadAvailabilityForMonth();
    });

    slotButtons.forEach(button => button.addEventListener("click", () => {
        if (button.disabled) return;
        selectedTimeSlot = button.dataset.slot || "";
        if (timeSlotInput) timeSlotInput.value = selectedTimeSlot;
        if (startTime && getSlotForTime(startTime.value) !== selectedTimeSlot) startTime.value = "";
        if (selectedTimeText && !startTime?.value) selectedTimeText.textContent = `Choose a time in the ${slotLabel(selectedTimeSlot)} slot`;
        updateSelectedDateSlots();
    }));

    renderBookingCalendar();
    loadAvailabilityForMonth().then(() => {
        if (eventDate?.value) {
            const restoredSlot = timeSlotInput?.value || "";
            selectedTimeSlot = restoredSlot;
            updateSelectedDateSlots();
        }
    });
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) loadAvailabilityForMonth();
    });
    window.setInterval(() => {
        if (!document.hidden) loadAvailabilityForMonth();
    }, 30000);

    // ========================================
    // LOGIN REQUIRED MODAL
    // ========================================

    function showLoginRequiredModal() {
        console.log("🔐 Login required modal requested.");

        if (!loginModal) {
            console.error("❌ loginRequiredModal was not found in index.html.");
            alert("Please login first before submitting your booking.");
            return;
        }

        loginModal.classList.add("show");
        loginModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeLoginRequiredModal() {
        if (!loginModal) return;

        loginModal.classList.remove("show");
        loginModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    // ========================================
    // NOT NOW
    // ========================================

    if (notNowBtn) {
        notNowBtn.addEventListener("click", function () {
            closeLoginRequiredModal();
        });
    }

    // ========================================
    // LOGIN NOW
    // ========================================

    if (loginRequiredBtn) {
        loginRequiredBtn.addEventListener("click", function () {
            console.log("➡️ Login Now clicked.");

            const draft = {};

            new FormData(bookingForm).forEach(function (value, key) {
                draft[key] = value;
            });

            sessionStorage.setItem(
                "kqBookingFormDraft",
                JSON.stringify(draft)
            );

            sessionStorage.setItem("kqSelectedPackage", selectedPackage);
            sessionStorage.setItem("kqReturnAfterLogin", "index.html#booking");

            window.location.href = "login.html";
        });
    }

    // ========================================
    // CLOSE MODAL WHEN CLICKING OUTSIDE
    // ========================================

    if (loginModal) {
        loginModal.addEventListener("click", function (event) {
            if (event.target === loginModal) {
                closeLoginRequiredModal();
            }
        });
    }

    // ========================================
    // ESC KEY
    // ========================================

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            loginModal &&
            loginModal.classList.contains("show")
        ) {
            closeLoginRequiredModal();
        }

    });

    // ========================================
    // RESTORE BOOKING DRAFT
    // ========================================

    const savedDraft = sessionStorage.getItem("kqBookingFormDraft");

    if (savedDraft && bookingForm) {
        try {
            const draft = JSON.parse(savedDraft);

            Object.keys(draft).forEach(function (key) {
                const field = bookingForm.elements.namedItem(key);

                if (!field) return;

                if (field.type === "checkbox") {
                    field.checked =
                        draft[key] === "on" || draft[key] === true;
                } else {
                    field.value = draft[key];
                }
            });

            if (eventDate) {
                eventDate.dispatchEvent(new Event("change"));
            }

            console.log("✅ Booking draft restored.");
        } catch (error) {
            console.error("❌ Unable to restore booking draft:", error);
        }
    }

    // ========================================
    // CUSTOM ROUND CLOCK PICKER
    // ========================================

    const timeDisplay = document.getElementById("startTimeDisplay");
    const selectedTimeText = document.getElementById("selectedTimeText");
    const clockPicker = document.getElementById("clockPicker");
    const clockFace = document.getElementById("clockFace");
    const hourText = document.getElementById("clockHourText");
    const minuteText = document.getElementById("clockMinuteText");
    const periodText = document.getElementById("clockPeriodText");
    const hoursTab = document.getElementById("clockHoursTab");
    const minutesTab = document.getElementById("clockMinutesTab");
    const amButton = document.getElementById("clockAM");
    const pmButton = document.getElementById("clockPM");
    const doneButton = document.getElementById("clockDone");
    const cancelButton = document.getElementById("clockCancel");

    let clockHour = 12;
    let clockMinute = 0;
    let clockPeriod = "PM";
    let clockMode = "hour";

    function updateClockDisplay() {
        if (
            !hourText || !minuteText || !periodText ||
            !hoursTab || !minutesTab || !amButton || !pmButton
        ) return;

        hourText.textContent = String(clockHour).padStart(2, "0");
        minuteText.textContent = String(clockMinute).padStart(2, "0");
        periodText.textContent = clockPeriod;

        hoursTab.classList.toggle("active", clockMode === "hour");
        minutesTab.classList.toggle("active", clockMode === "minute");
        amButton.classList.toggle("active", clockPeriod === "AM");
        pmButton.classList.toggle("active", clockPeriod === "PM");

        renderClockFace();
    }

    function renderClockFace() {
        if (!clockFace) return;

        clockFace.innerHTML = "";

        if (clockMode === "period") {
            const prompt = document.createElement("div");
            prompt.className = "clock-period-prompt";
            prompt.textContent = "Choose AM or PM";
            clockFace.appendChild(prompt);
            return;
        }

        const hand = document.createElement("div");
        hand.className = "clock-hand";

        const center = document.createElement("div");
        center.className = "clock-center";

        const selectedValue =
            clockMode === "hour" ? clockHour : clockMinute;

        const selectedAngle =
            clockMode === "hour"
                ? (clockHour % 12) * 30
                : clockMinute * 6;

        hand.style.transform = `rotate(${selectedAngle}deg)`;
        clockFace.appendChild(hand);

        const values = clockMode === "hour"
            ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            : Array.from({ length: 12 }, (_, i) => i * 5);

        values.forEach((value, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "clock-number";

            button.textContent = clockMode === "hour"
                ? String(value)
                : String(value).padStart(2, "0");

            const angle = (index * 30 - 90) * Math.PI / 180;
            const radius = 40;

            button.style.left =
                `${50 + radius * Math.cos(angle)}%`;

            button.style.top =
                `${50 + radius * Math.sin(angle)}%`;

            if (value === selectedValue) {
                button.classList.add("selected");
            }

            button.addEventListener("click", function () {
                if (clockMode === "hour") {
                    clockHour = value;
                    clockMode = "minute";
                } else {
                    clockMinute = value;
                    clockMode = "period";
                }

                updateClockDisplay();
            });

            clockFace.appendChild(button);
        });

        clockFace.appendChild(center);
    }

    function openClock() {
        if (!clockPicker || !timeDisplay || !startTime) return;

        if (!eventDate?.value) {
            alert("Please choose an event date first.");
            return;
        }
        if (!selectedTimeSlot) {
            alert("Please choose an available time slot first.");
            return;
        }

        if (startTime.value) {
            const parts = startTime.value.split(":");
            const totalHour = Number(parts[0]);

            clockHour = totalHour % 12 || 12;
            clockMinute = Number(parts[1]) || 0;
            clockPeriod = totalHour >= 12 ? "PM" : "AM";
        } else {
            clockMinute = 0;
            if (selectedTimeSlot === "MORNING") {
                clockHour = 9;
                clockPeriod = "AM";
            } else if (selectedTimeSlot === "AFTERNOON") {
                clockHour = 2;
                clockPeriod = "PM";
            } else {
                clockHour = 8;
                clockPeriod = "PM";
            }
        }

        clockMode = "hour";
        clockPicker.hidden = false;
        timeDisplay.setAttribute("aria-expanded", "true");

        updateClockDisplay();
    }

    function closeClock() {
        if (!clockPicker || !timeDisplay) return;

        clockPicker.hidden = true;
        timeDisplay.setAttribute("aria-expanded", "false");
    }

    if (
        timeDisplay && selectedTimeText && clockPicker && clockFace &&
        hourText && minuteText && periodText && hoursTab && minutesTab &&
        amButton && pmButton && doneButton && cancelButton && startTime
    ) {
        timeDisplay.addEventListener("click", function () {
            if (clockPicker.hidden) {
                openClock();
            }
        });

        hoursTab.addEventListener("click", function () {
            clockMode = "hour";
            updateClockDisplay();
        });

        minutesTab.addEventListener("click", function () {
            clockMode = "minute";
            updateClockDisplay();
        });

        hourText.addEventListener("click", function () {
            clockMode = "hour";
            updateClockDisplay();
        });

        minuteText.addEventListener("click", function () {
            clockMode = "minute";
            updateClockDisplay();
        });

        amButton.addEventListener("click", function () {
            clockPeriod = "AM";
            updateClockDisplay();
        });

        pmButton.addEventListener("click", function () {
            clockPeriod = "PM";
            updateClockDisplay();
        });

        doneButton.addEventListener("click", function () {
            let hour24 = clockHour % 12;

            if (clockPeriod === "PM") {
                hour24 += 12;
            }

            const proposedTime = `${String(hour24).padStart(2, "0")}:${String(clockMinute).padStart(2, "0")}`;
            if (getSlotForTime(proposedTime) !== selectedTimeSlot) {
                alert(`Choose a time within the ${slotLabel(selectedTimeSlot)} slot shown on the form.`);
                return;
            }

            const formattedHour = String(hour24).padStart(2, "0");
            const formattedMinute = String(clockMinute).padStart(2, "0");

            // Save 24-hour time for Supabase
            startTime.value = `${formattedHour}:${formattedMinute}`;

            // Display selected time in Event Start Time field
            selectedTimeText.textContent =
                `${String(clockHour).padStart(2, "0")}:${formattedMinute} ${clockPeriod}`;

            closeClock();
        });

        cancelButton.addEventListener("click", closeClock);

        // Restore selected time from saved booking draft
        if (startTime.value) {
            const parts = startTime.value.split(":");
            const totalHour = Number(parts[0]);

            clockHour = totalHour % 12 || 12;
            clockMinute = Number(parts[1]) || 0;
            clockPeriod = totalHour >= 12 ? "PM" : "AM";

            selectedTimeText.textContent =
                `${String(clockHour).padStart(2, "0")}:${String(clockMinute).padStart(2, "0")} ${clockPeriod}`;
        }
    }

    // ========================================
    // BOOKING SUCCESS MODAL
    // ========================================

    function showBookingSuccessModal() {
        const existingModal = document.getElementById("bookingSuccessModal");

        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement("div");
        modal.id = "bookingSuccessModal";

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
    <div style="font-size: 52px; margin-bottom: 15px;">🎉</div>
    <h2 style="margin-bottom: 12px; color: #173b55;">
        Booking Submitted!
    </h2>
    <p style="line-height: 1.7; color: #52636e;">
        Your booking request has been submitted successfully.
        KQ Event Styling will review your request.
    </p>
    <button type="button"
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
                    ">
        Done
    </button>
</div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = "hidden";

        const closeButton = document.getElementById("closeBookingSuccess");

        if (closeButton) {
            closeButton.addEventListener("click", function () {
                modal.remove();
                document.body.style.overflow = "";
            });
        }
    }

    // ========================================
    // SUBMIT BOOKING
    // ========================================

    bookingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        console.log("📋 BOOKING SUBMIT CLICKED");

        const submitButton =
            bookingForm.querySelector('button[type="submit"]');

        const originalText = submitButton
            ? submitButton.textContent
            : "Submit Booking Request";

        try {
            // ========================================
            // CHECK SUPABASE
            // ========================================

            if (!window.supabaseClient) {
                throw new Error("Supabase is not connected.");
            }

            // ========================================
            // CHECK SESSION
            // ========================================

            console.log("🔎 Checking Supabase session...");

            const {
                data: { session },
                error: sessionError
            } = await window.supabaseClient.auth.getSession();

            if (sessionError) {
                throw sessionError;
            }

            // ========================================
            // GET FORM VALUES
            // ========================================

            const fullName =
                document.getElementById("fullName")?.value.trim() || "";

            const email =
                document.getElementById("email")?.value.trim() || "";

            const phone =
                document.getElementById("phone")?.value.trim() || "";

            const venueAddress =
                document.getElementById("location")?.value.trim() || "";

            const eventType =
                document.getElementById("eventType")?.value || "";

            const selectedDate =
                document.getElementById("eventDate")?.value || "";

            const guests =
                Number(document.getElementById("guests")?.value) || 0;

            const selectedStartTime = startTime
                ? startTime.value
                : "";

            const termsAccepted = document.getElementById("termsAccepted")?.checked || false;
            const paymentReference = paymentReferenceInput?.value.trim() || "";

            const message =
                document.getElementById("message")?.value.trim() || "";

            // ========================================
            // VALIDATION
            // ========================================

            if (!fullName) {
                throw new Error("Please enter your full name.");
            }

            if (!email) {
                throw new Error("Please enter your email.");
            }

            if (!phone) {
                throw new Error("Please enter your contact number.");
            }

            if (!eventType) {
                throw new Error("Please select your event type.");
            }

            if (!selectedDate) {
                throw new Error("Please select your event date.");
            }

            if (!selectedStartTime) {
                throw new Error("Please select your event start time.");
            }

            if (!selectedTimeSlot || getSlotForTime(selectedStartTime) !== selectedTimeSlot) {
                throw new Error("Please choose an available time slot and a start time within that slot.");
            }

            if (!selectedPackage) {
                throw new Error("Please select a package before submitting your booking.");
            }

            const databasePackageType = getDatabasePackageType(selectedPackage);
            if (!databasePackageType) {
                throw new Error("This package is not recognized. Please select one of the listed packages again.");
            }

            if (!termsAccepted) {
                throw new Error("Please accept the booking terms and conditions.");
            }

            if (!paymentReference) {
                throw new Error("Please pay the 30% reservation fee using the QR code and enter the transaction reference number.");
            }

            const designImageFile = window.kqDesignImageFile || null;
            const designEstimate = window.kqDesignEstimate || null;
            if (designImageFile && !designEstimate) {
                throw new Error("Please run the design estimate first, or remove the image before submitting.");
            }

            if (!guests || guests < 1) {
                throw new Error("Please enter the estimated number of guests.");
            }

            // ========================================
            // GUEST / LOGIN REQUIRED
            // ========================================

            if (!session) {
                console.log("👤 User is NOT logged in.");

                const draft = {};

                new FormData(bookingForm).forEach(function (value, key) {
                    draft[key] = value;
                });

                sessionStorage.setItem(
                    "kqBookingFormDraft",
                    JSON.stringify(draft)
                );

                sessionStorage.setItem("kqSelectedPackage", selectedPackage);

                showLoginRequiredModal();
                return;
            }

            // ========================================
            // LOGGED IN USER
            // ========================================

            const user = session.user;

            console.log("✅ Logged in user:", user.email);

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";
            }

            // ========================================
            // CALCULATE PACKAGE AMOUNT
            // ========================================

            const { total: amount, fee: reservationFee } = updateReservationPayment();

            if (!amount || !reservationFee) {
                throw new Error("The selected package price is missing. Please choose the package again.");
            }

            console.log("💰 Package:", selectedPackage);
            console.log("💰 Amount:", amount);

            // ========================================
            // GET PROFILE
            // ========================================

            const {
                data: profile,
                error: profileError
            } = await window.supabaseClient
                .from("profiles")
                .select("full_name,email,contact_number")
                .eq("id", user.id)
                .single();

            if (profileError && profileError.code !== "PGRST116") {
                console.warn("Profile lookup warning:", profileError);
            }

            // ========================================
            // BOOKING ID
            // ========================================

            const bookingId =
                "KQ-" + crypto.randomUUID().replace(/-/g, "").substring(0, 12);

            let designImagePath = null;
            if (designImageFile && designEstimate) {
                const extensionByType = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
                const extension = extensionByType[designImageFile.type];
                if (!extension || designImageFile.size > 10 * 1024 * 1024) {
                    throw new Error("The design image must be a JPG, PNG, or WebP file up to 10 MB.");
                }
                designImagePath = `${user.id}/${bookingId}.${extension}`;
                const { error: uploadError } = await window.supabaseClient.storage
                    .from("booking-designs")
                    .upload(designImagePath, designImageFile, { contentType: designImageFile.type, upsert: false });
                if (uploadError) throw new Error(`The design image could not be saved: ${uploadError.message}`);
            }

            // ========================================
            // BOOKING DATA
            // ========================================

            const bookingData = {
                id: bookingId,
                user_id: user.id,

                full_name:
                    fullName || profile?.full_name || "",

                email:
                    email || profile?.email || user.email || "",

                phone:
                    phone || profile?.contact_number || "",

                event_type: eventType,
                event_date: selectedDate,
                guests: guests,

                // Stored in 24-hour format, e.g. 17:20
                start_time: selectedStartTime,
                time_slot: selectedTimeSlot,

                message: [
                    message.includes("Ocular request package:") ? "" : `Selected package: ${selectedPackage}`,
                    venueAddress ? `Event venue: ${venueAddress}` : "",
                    message,
                    `Reservation fee payment reference (pending verification): ${paymentReference}`
                ].filter(Boolean).join("\n\n"),

                package_type: databasePackageType,

                amount: amount,
                required_down_payment: reservationFee,
                down_payment_amount: 0,
                design_image_path: designImagePath,
                ai_estimated_package: designEstimate?.package || null,
                ai_estimated_price: designEstimate?.price || null,
                ai_detected_features: designEstimate?.features || [],
                ai_estimate_explanation: designEstimate?.explanation || null,
                terms_accepted: termsAccepted,
                terms_accepted_at: new Date().toISOString(),
                status: "PENDING"
            };

            console.log("📦 Submitting booking:", bookingId, "Reservation fee:", reservationFee);
            const { data: booking, error: bookingError } = await window.supabaseClient
                .from("bookings")
                .insert(bookingData)
                .select()
                .single();

            if (bookingError) {
                console.error("❌ Supabase booking error:", bookingError);
                if (designImagePath) {
                    await window.supabaseClient.storage.from("booking-designs").remove([designImagePath]);
                }
                throw bookingError;
            }

            console.log("✅ BOOKING CREATED:", booking);
            await loadAvailabilityForMonth();

            sessionStorage.removeItem("kqBookingFormDraft");
            sessionStorage.removeItem("kqBookingDraft");
            sessionStorage.removeItem("kqReturnAfterLogin");
            sessionStorage.removeItem("kqSelectedPackage");
            selectedPackage = "";
            if (paymentReferenceInput) paymentReferenceInput.value = "";
            updateSelectedPackageCard(selectedPackage);
            updateReservationPayment();
            document.getElementById("removeDesignImage")?.click();
            packageButtons.forEach(button => button.classList.remove("selected"));

        } catch (error) {
            console.error("❌ BOOKING SUBMISSION ERROR:", error);

            alert(
                "Unable to submit booking.\n\n" +
                (error.message || "Please try again.")
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    });

    // ========================================
    // INITIALIZATION COMPLETE
    // ========================================

    console.log("✅ Customer booking system ready.");
});
