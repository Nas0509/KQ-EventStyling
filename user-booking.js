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
    const reservationPayment = document.getElementById("reservationPayment");
    const reservationPaymentEntry = document.getElementById("reservationPaymentEntry");
    const reservationLoginNotice = document.getElementById("reservationLoginNotice");
    const reservationQrCard = document.getElementById("reservationQrCard");
    const reservationQrImage = document.getElementById("reservationQrImage");
    const bookingPhoneInput = document.getElementById("phone");
    bookingPhoneInput?.addEventListener("input", () => {
        bookingPhoneInput.value = bookingPhoneInput.value.replace(/\D/g, "").slice(0, 11);
    });
    const packageAmountText = document.getElementById("packageAmount");
    const bookingTravelFeeAmount = document.getElementById("bookingTravelFeeAmount");
    const bookingTotalAmount = document.getElementById("bookingTotalAmount");
    const bookingVenueCityInput = document.getElementById("bookingVenueCity");
    const bookingTravelFeeHelp = document.getElementById("bookingTravelFeeHelp");
    const reservationFeeText = document.getElementById("reservationFeeAmount");
    const remainingBalanceText = document.getElementById("remainingBalanceAmount");

    const loginModal = document.getElementById("loginRequiredModal");
    const notNowBtn = document.getElementById("notNowBtn");
    const loginRequiredBtn = document.getElementById("loginRequiredBtn");

    // ========================================
    // SELECTED PACKAGE
    // ========================================

    let selectedPackage = sessionStorage.getItem("kqSelectedPackage") || "";
    let hasAuthenticatedSession = false;
    let bookingTravelFee = null;
    let bookingTravelDistanceKm = null;
    let bookingTravelLocation = null;

    function syncReservationPaymentAccess(session) {
        hasAuthenticatedSession = Boolean(session?.user);
        reservationPayment?.classList.toggle("is-guest", !hasAuthenticatedSession);
        if (reservationPaymentEntry) reservationPaymentEntry.hidden = !hasAuthenticatedSession;
        if (reservationLoginNotice) reservationLoginNotice.hidden = hasAuthenticatedSession;
        if (reservationQrCard) reservationQrCard.hidden = !hasAuthenticatedSession;

        if (hasAuthenticatedSession && reservationQrImage?.dataset.authSrc) {
            reservationQrImage.src = reservationQrImage.dataset.authSrc;
        } else {
            reservationQrImage?.removeAttribute("src");
        }

        const packageTotal = getPackageAmount(selectedPackage);
        const hasTravelEstimate = Boolean(bookingTravelLocation && Number.isFinite(bookingTravelFee));
        if (paymentReferenceInput) {
            paymentReferenceInput.disabled = !hasAuthenticatedSession || !packageTotal || !hasTravelEstimate;
            paymentReferenceInput.required = hasAuthenticatedSession;
        }
    }

    if (window.supabaseClient?.auth) {
        window.supabaseClient.auth.getSession()
            .then(({ data, error }) => {
                if (!error) syncReservationPaymentAccess(data?.session);
            })
            .catch(error => console.warn("Unable to check payment QR access:", error));

        window.supabaseClient.auth.onAuthStateChange((_event, session) => {
            syncReservationPaymentAccess(session);
            updateReservationPayment();
        });
    } else {
        syncReservationPaymentAccess(null);
    }

    const pesoFormat = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0
    });

    function normalizeBookingCity(value) {
        return String(value || "")
            .toLocaleLowerCase("en-PH")
            .replace(/^(city of|municipality of)\s+/i, "")
            .replace(/[^\p{L}\p{N}]+/gu, " ")
            .trim();
    }

    function bookingCityLabel(city) {
        return city.province && city.province !== city.region
            ? `${city.name}, ${city.province} — ${city.region}`
            : `${city.name} — ${city.region}`;
    }

    function findBookingCity(value) {
        const cities = window.KQ_LUZON_CITY_COORDINATES || [];
        const query = normalizeBookingCity(value);
        if (!query) return null;
        const exactLabel = cities.find(city => normalizeBookingCity(bookingCityLabel(city)) === query);
        if (exactLabel) return exactLabel;
        const matches = cities.filter(city => normalizeBookingCity(city.name) === query);
        return matches.length === 1 ? matches[0] : null;
    }

    function getBookingTravelEstimate(city) {
        const origin = window.KQ_NORTH_CALOOCAN_REFERENCE;
        if (!city || !origin) return null;
        const radians = degrees => degrees * Math.PI / 180;
        const lat1 = radians(origin.lat), lat2 = radians(city.lat);
        const deltaLat = radians(city.lat - origin.lat), deltaLng = radians(city.lng - origin.lng);
        const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
        const distance = Math.round((6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))) * 10) / 10;
        const fee = Math.ceil(distance * 20 / 100) * 100;
        return { distance, fee };
    }

    const bookingCities = (window.KQ_LUZON_CITY_COORDINATES || [])
        .slice()
        .sort((a, b) => bookingCityLabel(a).localeCompare(bookingCityLabel(b), "en"));
    if (bookingVenueCityInput && bookingCities.length) {
        const cityList = document.createElement("div");
        cityList.id = "bookingVenueCityList";
        cityList.className = "booking-city-dropdown";
        cityList.setAttribute("role", "listbox");
        cityList.hidden = true;
        const renderCityOptions = () => {
            const query = normalizeBookingCity(bookingVenueCityInput.value);
            const matches = bookingCities.filter(city =>
                normalizeBookingCity(`${city.name} ${city.province || ""} ${city.region || ""}`).includes(query)
            );
            cityList.replaceChildren();
            matches.forEach(city => {
                const option = document.createElement("button");
                option.type = "button";
                option.className = "booking-city-dropdown-option";
                option.setAttribute("role", "option");
                option.textContent = city.province && city.province !== city.region
                    ? `${city.name}, ${city.province}`
                    : `${city.name}, ${city.region || "Luzon"}`;
                option.addEventListener("click", () => {
                    bookingVenueCityInput.value = bookingCityLabel(city);
                    bookingVenueCityInput.dispatchEvent(new Event("change", { bubbles: true }));
                    cityList.hidden = true;
                    bookingVenueCityInput.setAttribute("aria-expanded", "false");
                });
                cityList.appendChild(option);
            });
            if (!matches.length) {
                const empty = document.createElement("div");
                empty.className = "booking-city-dropdown-empty";
                empty.textContent = "No matching locations found.";
                cityList.appendChild(empty);
            }
        };
        bookingVenueCityInput.insertAdjacentElement("afterend", cityList);

        const toggleCityList = open => {
            if (open) renderCityOptions();
            cityList.hidden = !open;
            bookingVenueCityInput.setAttribute("aria-expanded", String(open));
        };
        bookingVenueCityInput.addEventListener("click", () => toggleCityList(cityList.hidden));
        bookingVenueCityInput.addEventListener("input", () => toggleCityList(true));
        bookingVenueCityInput.addEventListener("keydown", event => {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                toggleCityList(true);
                cityList.querySelector("button")?.focus();
            } else if (event.key === "Enter" && !cityList.hidden) {
                event.preventDefault();
                cityList.querySelector("button")?.click();
            } else if (event.key === "Escape") {
                toggleCityList(false);
            }
        });
        document.addEventListener("click", event => {
            if (!event.target.closest(".venue-city-field")) toggleCityList(false);
        });
        cityList.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                toggleCityList(false);
                bookingVenueCityInput.focus();
            }
        });
    }

    function updateBookingTravelFee() {
        const city = findBookingCity(bookingVenueCityInput?.value);
        const estimate = getBookingTravelEstimate(city);
        bookingTravelLocation = city;
        bookingTravelDistanceKm = estimate?.distance ?? null;
        bookingTravelFee = estimate?.fee ?? null;
        if (bookingTravelFeeHelp) {
            if (estimate) {
                bookingTravelFeeHelp.textContent = `Estimated travel expense from North Caloocan: ${estimate.distance} km × ₱20/km = ${pesoFormat.format(estimate.fee)} (rounded up to the next ₱100).`;
            } else if (bookingVenueCityInput?.value.trim()) {
                bookingTravelFeeHelp.textContent = "Choose a Luzon city or municipality from the list to calculate the travel expense.";
            } else {
                bookingTravelFeeHelp.textContent = "Choose your venue city to calculate the travel expense from North Caloocan at ₱20/km.";
            }
        }
        updateReservationPayment();
    }

    bookingVenueCityInput?.addEventListener("change", updateBookingTravelFee);

    function getPackageAmount(packageName) {
        const priceMatch = String(packageName || "").match(/₱\s*([\d,]+(?:\.\d+)?)/);
        return priceMatch ? Number(priceMatch[1].replace(/,/g, "")) || 0 : 0;
    }

    // Store Simple Styling and Packages A/B as SMALL; Packages C/D/E as BIG.
    function getDatabasePackageType(packageName) {
        const packageLabel = String(packageName || "").trim();
        if (/^(Simple Styling|Package A|Package B)\b/i.test(packageLabel)) return "SMALL";
        if (/^Package [CDE]\b/i.test(packageLabel)) return "BIG";

        const amount = getPackageAmount(packageName);
        const selectedButton = Array.from(packageButtons).find(button => button.dataset.package === packageName);
        const category = selectedButton?.dataset.packageCategory || (amount === 6500 ? "simple" : "");
        if (category === "simple") return "SMALL";
        return "";
    }

    function updateReservationPayment() {
        const packageTotal = getPackageAmount(selectedPackage);
        const hasTravelEstimate = Boolean(bookingTravelLocation && Number.isFinite(bookingTravelFee));
        const total = packageTotal + (hasTravelEstimate ? bookingTravelFee : 0);
        const fee = packageTotal && hasTravelEstimate ? Math.round(total * 0.3) : 0;

        if (packageAmountText) packageAmountText.textContent = packageTotal ? pesoFormat.format(packageTotal) : "Select a package";
        if (bookingTravelFeeAmount) bookingTravelFeeAmount.textContent = hasTravelEstimate ? pesoFormat.format(bookingTravelFee) : "Select venue city";
        if (bookingTotalAmount) bookingTotalAmount.textContent = fee ? pesoFormat.format(total) : "Select package and venue city";
        if (reservationFeeText) reservationFeeText.textContent = fee ? pesoFormat.format(fee) : "—";
        if (remainingBalanceText) remainingBalanceText.textContent = fee ? pesoFormat.format(total - fee) : "—";
        if (paymentReferenceInput) paymentReferenceInput.disabled = !hasAuthenticatedSession || !fee;

        return { total: fee ? total : 0, fee };
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
    const bookingCalendar = document.getElementById("bookingCalendar");
    const bookingDatePicker = document.getElementById("bookingDatePicker");
    const eventDateTrigger = document.getElementById("eventDateTrigger");
    const eventDateTriggerText = document.getElementById("eventDateTriggerText");
    const bookingDatePrompt = document.getElementById("bookingDatePrompt");
    const calendarPrevious = document.getElementById("calendarPrevious");
    const calendarNext = document.getElementById("calendarNext");
    const bookingTimeSlots = document.getElementById("bookingTimeSlots");
    const bookingTimePrompt = document.getElementById("bookingTimePrompt");
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

    function setBookingCalendarOpen(isOpen) {
        if (!bookingCalendar || !eventDateTrigger) return;
        bookingCalendar.hidden = !isOpen;
        eventDateTrigger.setAttribute("aria-expanded", String(isOpen));
    }

    function updateEventDateTrigger() {
        if (!eventDateTriggerText) return;
        eventDateTrigger?.classList.toggle("has-value", Boolean(eventDate?.value));
        if (!eventDate?.value) {
            eventDateTriggerText.textContent = "Choose event date";
            return;
        }
        const [year, month, day] = eventDate.value.split("-").map(Number);
        eventDateTriggerText.textContent = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(year, month - 1, day));
    }

    eventDateTrigger?.addEventListener("click", () => {
        setBookingCalendarOpen(bookingCalendar?.hidden ?? true);
    });
    eventDate?.addEventListener("change", updateEventDateTrigger);
    document.addEventListener("click", event => {
        if (bookingDatePicker && !bookingDatePicker.contains(event.target)) setBookingCalendarOpen(false);
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && bookingCalendar && !bookingCalendar.hidden) {
            setBookingCalendarOpen(false);
            eventDateTrigger?.focus();
        }
    });
    updateEventDateTrigger();

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
            if (status) status.textContent = taken ? "Unavailable" : "Available";
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
                updateEventDateTrigger();
                setBookingCalendarOpen(false);
                if (bookingDatePrompt) bookingDatePrompt.hidden = true;
                selectedTimeSlot = "";
                const clockTimePrompt = document.getElementById("clockTimePrompt");
                if (clockTimePrompt) clockTimePrompt.hidden = true;
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
        if (calendarHelp && !eventDate?.value) calendarHelp.textContent = "Approved Packages C, D, and E and trips over 30 km reserve the whole day. At 30 km, the next time slot is reserved for travel. Pending requests do not hold a slot.";
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
        if (bookingTimePrompt) bookingTimePrompt.hidden = true;
        const clockTimePrompt = document.getElementById("clockTimePrompt");
        if (clockTimePrompt) clockTimePrompt.hidden = true;
        selectedTimeSlot = button.dataset.slot || "";
        if (timeSlotInput) timeSlotInput.value = selectedTimeSlot;
        if (startTime && getSlotForTime(startTime.value) !== selectedTimeSlot) startTime.value = "";

        // Changing the slot must immediately reset the picker to a valid time
        // range, even if the clock dialog was already open.
        clockMinute = 0;
        if (startTime?.value) {
            const [hour, minute] = startTime.value.split(":").map(Number);
            clockHour = hour % 12 || 12;
            clockMinute = minute || 0;
            clockPeriod = hour >= 12 ? "PM" : "AM";
        } else if (selectedTimeSlot === "MORNING") {
            clockHour = 9;
            clockPeriod = "AM";
        } else if (selectedTimeSlot === "AFTERNOON") {
            clockHour = 2;
            clockPeriod = "PM";
        } else {
            clockHour = 8;
            clockPeriod = "PM";
        }
        clockMode = "hour";
        if (clockPicker && !clockPicker.hidden) closeClock();
        updateClockDisplay();

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
            updateBookingTravelFee();

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
    const clockTimePrompt = document.getElementById("clockTimePrompt");
    const clockPicker = document.getElementById("clockPicker");
    const clockFace = document.getElementById("clockFace");
    const hourText = document.getElementById("clockHourText");
    const minuteText = document.getElementById("clockMinuteText");
    const periodText = document.getElementById("clockPeriodText");
    const hoursTab = document.getElementById("clockHoursTab");
    const minutesTab = document.getElementById("clockMinutesTab");
    const doneButton = document.getElementById("clockDone");
    const cancelButton = document.getElementById("clockCancel");

    let clockHour = 12;
    let clockMinute = 0;
    let clockPeriod = "PM";
    let clockMode = "hour";

    function updateClockDisplay() {
        if (
            !hourText || !minuteText || !periodText ||
            !hoursTab || !minutesTab
        ) return;

        clockPeriod = selectedTimeSlot === "MORNING" ? "AM" : "PM";
        hourText.textContent = String(clockHour).padStart(2, "0");
        minuteText.textContent = String(clockMinute).padStart(2, "0");
        periodText.textContent = clockPeriod;

        hoursTab.classList.toggle("active", clockMode === "hour");
        minutesTab.classList.toggle("active", clockMode === "minute");

        renderClockFace();
    }

    function renderClockFace() {
        if (!clockFace) return;

        clockFace.innerHTML = "";

        const hand = document.createElement("div");
        hand.className = "clock-hand";

        const center = document.createElement("div");
        center.className = "clock-center";

        const selectedValue =
            clockMode === "hour" ? clockHour : clockMinute;

        const values = clockMode === "hour"
            ? selectedTimeSlot === "AFTERNOON"
                ? [12, 1, 2, 3, 4, 5]
                : [6, 7, 8, 9, 10, 11]
            : Array.from({ length: 12 }, (_, i) => i * 5);
        const selectedIndex = values.indexOf(selectedValue);
        // The hand is drawn vertically down from the center. Convert the
        // selected dial position (whose 12 o'clock point is at -90 degrees)
        // into the CSS rotation needed from that downward starting direction.
        hand.style.transform = `rotate(${selectedIndex * 30 - 180}deg)`;
        clockFace.appendChild(hand);

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
            if (bookingDatePrompt) {
                bookingDatePrompt.textContent = "Choose an available event date first. The calendar is open above.";
                bookingDatePrompt.hidden = false;
            }
            setBookingCalendarOpen(true);
            eventDateTrigger?.focus();
            eventDateTrigger?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (!selectedTimeSlot) {
            if (bookingTimePrompt) {
                bookingTimePrompt.textContent = "Choose an available Morning, Afternoon, or Night slot before setting the start time.";
                bookingTimePrompt.hidden = false;
            }
            bookingTimeSlots?.scrollIntoView({ behavior: "smooth", block: "center" });
            slotButtons.find(button => !button.disabled)?.focus();
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
                clockHour = 6;
                clockPeriod = "AM";
            } else if (selectedTimeSlot === "AFTERNOON") {
                clockHour = 12;
                clockPeriod = "PM";
            } else {
                clockHour = 6;
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

    function closeClockIfMostlyOutOfView() {
        if (!clockPicker || clockPicker.hidden) return;
        const rect = clockPicker.getBoundingClientRect();
        const headerBottom = Math.max(0, document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0);
        const visibleTop = Math.max(rect.top, headerBottom);
        const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
        const totalArea = rect.width * rect.height;
        const headerAdjustedHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - visibleTop);
        if (totalArea > 0 && (headerAdjustedHeight * visibleWidth) / totalArea < 0.5) closeClock();
    }

    // Keep the clock open while it remains mostly visible; dismiss only once
    // scrolling moves at least half of it outside the viewport.
    document.addEventListener("scroll", closeClockIfMostlyOutOfView, { capture: true, passive: true });
    window.addEventListener("resize", closeClockIfMostlyOutOfView, { passive: true });

    if (
        timeDisplay && selectedTimeText && clockPicker && clockFace &&
        hourText && minuteText && periodText && hoursTab && minutesTab &&
        doneButton && cancelButton && startTime
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

        doneButton.addEventListener("click", function () {
            let hour24 = clockHour % 12;

            if (clockPeriod === "PM") {
                hour24 += 12;
            }

            const proposedTime = `${String(hour24).padStart(2, "0")}:${String(clockMinute).padStart(2, "0")}`;
            if (getSlotForTime(proposedTime) !== selectedTimeSlot) {
                if (clockTimePrompt) {
                    clockTimePrompt.textContent = `That time is outside the ${slotLabel(selectedTimeSlot)} slot. Choose a time between ${selectedTimeSlot === "MORNING" ? "6:00 AM and 11:55 AM" : selectedTimeSlot === "AFTERNOON" ? "12:00 PM and 5:55 PM" : "6:00 PM and 11:55 PM"}.`;
                    clockTimePrompt.hidden = false;
                }
                return;
            }
            if (clockTimePrompt) clockTimePrompt.hidden = true;

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

    function showAlreadyBookedModal(booking) {
        document.getElementById("alreadyBookedModal")?.remove();
        const modal = document.createElement("div");
        modal.id = "alreadyBookedModal";
        modal.style.cssText = "position:fixed;inset:0;background:rgba(18,38,49,.58);display:flex;align-items:center;justify-content:center;z-index:100000;padding:20px";
        const eventDateText = booking?.event_date
            ? new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(new Date(`${String(booking.event_date).slice(0, 10)}T12:00:00`))
            : "the selected date";
        modal.innerHTML = `<section role="alertdialog" aria-modal="true" aria-labelledby="alreadyBookedTitle" style="width:min(100%,440px);background:#fff;border-radius:18px;padding:28px;box-shadow:0 24px 70px rgba(0,0,0,.24)">
            <div style="width:46px;height:46px;display:grid;place-items:center;border-radius:50%;background:#fff4df;color:#a56600;font-size:24px;font-weight:700">!</div>
            <h2 id="alreadyBookedTitle" style="margin:16px 0 8px;color:#173b4b;font-size:23px">You already have a similar booking</h2>
            <p style="margin:0;color:#536872;line-height:1.65">There is already a ${String(booking?.event_type || "event")} booking for ${eventDateText} in the ${String(booking?.time_slot || "selected").toLowerCase()} slot with similar details${booking?.id ? ` (reference ${String(booking.id)})` : ""}. Please check your booking history before submitting another request.</p>
            <button type="button" id="closeAlreadyBooked" style="margin-top:22px;width:100%;padding:13px 18px;border:0;border-radius:9px;background:#1688b4;color:white;font-size:15px;font-weight:700;cursor:pointer">Okay, got it</button>
        </section>`;
        document.body.appendChild(modal);
        document.body.style.overflow = "hidden";
        modal.querySelector("#closeAlreadyBooked")?.addEventListener("click", () => {
            modal.remove();
            document.body.style.overflow = "";
        });
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

            const venueCity =
                bookingVenueCityInput?.value.trim() || "";

            updateBookingTravelFee();

            const eventType =
                document.getElementById("eventType")?.value || "";

            const selectedDate =
                document.getElementById("eventDate")?.value || "";

            const guests =
                Number(document.getElementById("guests")?.value) || 0;

            const eventTheme =
                document.getElementById("eventTheme")?.value.trim() || "";

            const eventColors =
                document.getElementById("eventColors")?.value.trim() || "";

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

            if (!/^09\d{9}$/.test(phone)) {
                throw new Error("Enter an 11-digit Philippine mobile number starting with 09.");
            }

            if (!bookingTravelLocation || !Number.isFinite(bookingTravelFee)) {
                throw new Error("Choose your Luzon venue city or municipality from the list to calculate the ₱20/km travel expense.");
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
                syncReservationPaymentAccess(null);
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

            syncReservationPaymentAccess(session);

            if (!paymentReference) {
                throw new Error("Please pay the 30% reservation fee using the QR code and enter the transaction reference number.");
            }
            if (paymentReference.length > 16) {
                throw new Error("Enter a payment transaction/reference number using up to 16 characters.");
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
                    `Venue city: ${bookingTravelLocation ? bookingCityLabel(bookingTravelLocation) : venueCity}`,
                    venueAddress ? `Event venue: ${venueAddress}` : "",
                    Number.isFinite(bookingTravelDistanceKm) ? `Estimated travel expense: ${bookingTravelDistanceKm} km city-center distance × ₱20/km = ${pesoFormat.format(bookingTravelFee)} (rounded up to the next ₱100).` : "",
                    eventTheme ? `Theme: ${eventTheme}` : "",
                    eventColors ? `Preferred colors: ${eventColors}` : "",
                    message ? `Additional requests: ${message}` : "",
                    `Reservation fee payment reference (pending verification): ${paymentReference}`
                ].filter(Boolean).join("\n\n"),

                package_type: databasePackageType,
                travel_distance_km: bookingTravelDistanceKm,

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

            // Catch accidental repeat submissions for the same customer and event details.
            const { data: existingBookings, error: duplicateCheckError } = await window.supabaseClient
                .from("bookings")
                .select("id,event_type,event_date,start_time,time_slot,guests,package_type,status")
                .eq("user_id", user.id)
                .eq("event_date", selectedDate)
                .in("status", ["PENDING", "APPROVED"]);
            if (duplicateCheckError) throw new Error(`We couldn't verify your existing bookings. Please try again. ${duplicateCheckError.message}`);
            const minutesOf = value => {
                const [hour, minute] = String(value || "").slice(0, 5).split(":").map(Number);
                return Number.isFinite(hour) && Number.isFinite(minute) ? hour * 60 + minute : -10000;
            };
            const duplicateBooking = (existingBookings || []).find(existing => {
                const sameEvent = String(existing.event_type || "").trim().toLowerCase() === eventType.trim().toLowerCase();
                const sameSlot = String(existing.time_slot || "").trim().toUpperCase() === selectedTimeSlot;
                const closeStartTime = Math.abs(minutesOf(existing.start_time) - minutesOf(selectedStartTime)) <= 60;
                const sameGuests = Number(existing.guests) === guests;
                const samePackage = String(existing.package_type || "").trim().toUpperCase() === databasePackageType.toUpperCase();
                return sameEvent && sameSlot && closeStartTime && (sameGuests || samePackage);
            });
            if (duplicateBooking) {
                showAlreadyBookedModal(duplicateBooking);
                return;
            }

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
            bookingForm.reset();
            selectedTimeSlot = "";
            if (timeSlotInput) timeSlotInput.value = "";
            if (eventDate) eventDate.value = "";
            updateEventDateTrigger();
            setBookingCalendarOpen(false);
            updateSelectedDateSlots();
            if (selectedTimeText) selectedTimeText.textContent = "Choose event time";
            if (bookingTimePrompt) bookingTimePrompt.hidden = true;
            if (bookingDatePrompt) bookingDatePrompt.hidden = true;
            if (clockTimePrompt) clockTimePrompt.hidden = true;
            updateSelectedPackageCard(selectedPackage);
            updateBookingTravelFee();
            updateReservationPayment();
            document.getElementById("removeDesignImage")?.click();
            packageButtons.forEach(button => button.classList.remove("selected"));
            showBookingSuccessModal();

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
