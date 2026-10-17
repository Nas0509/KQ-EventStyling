// ========================================
// KQ EVENT STYLING
// EVENT STYLING CUSTOMIZER
// SUPABASE VERSION
// ========================================

// Shared Luzon city data is also used by event booking.
const PH_LUZON_CITY_COORDINATES = window.KQ_LUZON_CITY_COORDINATES;
const NORTH_CALOOCAN_REFERENCE = window.KQ_NORTH_CALOOCAN_REFERENCE;

const packages = {
    simple: [
        {
            id: "simple-2",
            name: "Simple Styling",
            price: 6500,
            size: "7×8ft Backdrop",
            features: [
                "Venue styling with thematic backdrop",
                "Thematic balloon garland",
                "Thematic props",
                "Celebrant name styro cut",
                "Grass mat",
                "Basic lights for backdrop"
            ]
        }
    ],

    venue: [
        {
            id: "package-a",
            name: "Package A",
            price: 7900,
            size: "8×12ft • 3 Panel Backdrop",
            features: [
                "Customize backdrop",
                "Thematic balloon garland",
                "Theme character standee",
                "Thematic props",
                "Celebrant name styro cut",
                "Grass mat",
                "Basic floor lights",
                "Souvenir rack",
                "Cake pedestal",
                "Wooden bench chair",
                "Number lighted standee"
            ]
        },
        {
            id: "package-b",
            name: "Package B",
            price: 15500,
            size: "8×12ft • 3 Panel Backdrop",
            features: [
                "All Package A inclusions",
                "100pcs balloon drops",
                "10pcs cluster balloons",
                "Thematic balloon entrance arch",
                "Thematic ceiling decoration"
            ]
        }
    ],

    full: [
        {
            id: "package-c",
            name: "Package C",
            price: 19500,
            size: "8×16ft • 4 Panel Backdrop",
            features: [
                "Full venue styling",
                "Thematic ceiling",
                "Customize backdrop",
                "Thematic balloon garland",
                "Theme character standee",
                "Thematic props",
                "Celebrant name styro cut",
                "5pcs balloon table centerpiece",
                "Grass mat",
                "Basic floor lights",
                "Souvenir rack",
                "Cake pedestal",
                "Wooden bench chair",
                "Number lighted standee",
                "6 Panel of Swag",
                "200pcs balloon drops",
                "10pcs cluster balloons",
                "10pcs hanging decals",
                "Lighted entrance arch",
                "Celebrant 'Party is here!' sign"
            ]
        },
        {
            id: "package-d",
            name: "Package D",
            price: 29500,
            size: "8×20ft • 5 Panel Backdrop",
            features: [
                "Full venue styling",
                "Thematic ceiling",
                "Customize backdrop",
                "Thematic balloon garland",
                "Theme character standee",
                "Thematic props",
                "Celebrant name styro cut",
                "10pcs balloon table centerpiece",
                "Grass mat",
                "Basic floor lights",
                "Souvenir rack",
                "Cake pedestal",
                "Wooden bench chair",
                "Number lighted standee",
                "Full Panel of Swag",
                "300pcs balloon drops",
                "20pcs cluster balloons",
                "20pcs hanging decals",
                "Lighted entrance arch",
                "Celebrant 'Party is here!' sign"
            ]
        },
        {
            id: "package-e",
            name: "Package E",
            price: 35000,
            size: "8×20ft • 5 Panel Backdrop",
            features: [
                "Full venue styling",
                "Thematic ceiling",
                "Customize backdrop",
                "Thematic balloon garland",
                "Theme character standee",
                "Thematic props",
                "Celebrant name styro cut",
                "10pcs balloon table centerpiece",
                "Grass mat",
                "Basic floor lights",
                "Souvenir rack",
                "Wooden bench chair",
                "Number lighted standee",
                "Full Panel of Swag",
                "600pcs balloon drops",
                "30pcs cluster balloons",
                "20pcs hanging decals",
                "Lighted entrance arch",
                "Celebrant 'Party is here!' sign"
            ]
        }
    ]
};


// ========================================
// STATE
// ========================================

let selectedCategory = "simple";
let selectedPackage = packages.simple[0];
let selectedColor = "";
let selectedCustomColor = "#249bd3";


// ========================================
// DOM ELEMENTS
// ========================================

const categoryButtons =
    document.querySelectorAll(".category-option");

const packageOptions =
    document.getElementById("packageOptions");

const eventType =
    document.getElementById("eventType");

const inspectionAddress = document.getElementById("inspectionAddress");
const inspectionCityInput = document.getElementById("inspectionCity");
const inspectionCityOptions = document.getElementById("inspectionCityOptions");
const inspectionFeeAmount = document.getElementById("inspectionFeeAmount");
const inspectionDateInput = document.getElementById("inspectionDate");
const inspectionDatePicker = document.getElementById("inspectionDatePicker");
const inspectionDateDisplay = document.getElementById("inspectionDateDisplay");
const inspectionDatePickerWrapper = document.getElementById("inspectionDatePickerWrapper");
const inspectionCalendar = document.getElementById("inspectionCalendar");
const inspectionTimeInput = document.getElementById("inspectionTime");
const inspectionCalendarDays = document.getElementById("inspectionCalendarDays");
const inspectionCalendarMonthLabel = document.getElementById("inspectionCalendarMonth");
const inspectionCalendarHelp = document.getElementById("inspectionCalendarHelp");
const inspectionTimeHelp = document.getElementById("inspectionTimeHelp");
const inspectionCalendarPrevious = document.getElementById("inspectionCalendarPrevious");
const inspectionCalendarNext = document.getElementById("inspectionCalendarNext");
const inspectionToday = new Date();
const inspectionTodayIso = [
    inspectionToday.getFullYear(),
    String(inspectionToday.getMonth() + 1).padStart(2, "0"),
    String(inspectionToday.getDate()).padStart(2, "0")
].join("-");
const inspectionDisplayedMonth = new Date(inspectionToday.getFullYear(), inspectionToday.getMonth(), 1);
let ocularAvailabilityByDate = new Map();
let ocularAvailabilityLoaded = false;
let ocularScheduleCheckSequence = 0;

function inspectionDateToIso(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getInspectionSlotForTime(value) {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
    if (!match) return "";
    const minutes = Number(match[1]) * 60 + Number(match[2]);
    if (minutes >= 360 && minutes < 720) return "MORNING";
    if (minutes >= 720 && minutes < 1080) return "AFTERNOON";
    if (minutes >= 1080 && minutes < 1440) return "NIGHT";
    return "";
}

function setInspectionCalendarOpen(isOpen) {
    if (!inspectionCalendar || !inspectionDatePicker) return;
    inspectionCalendar.hidden = !isOpen;
    inspectionDatePicker.setAttribute("aria-expanded", String(isOpen));
}

function updateInspectionDateDisplay() {
    if (!inspectionDateDisplay) return;
    inspectionDateDisplay.textContent = inspectionDateInput?.value
        ? new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${inspectionDateInput.value}T12:00:00Z`))
        : "Choose an inspection date";
}

inspectionDatePicker?.addEventListener("click", () => {
    const shouldOpen = Boolean(inspectionCalendar?.hidden);
    if (shouldOpen) renderInspectionCalendar();
    setInspectionCalendarOpen(shouldOpen);
});

document.addEventListener("click", event => {
    if (inspectionCalendar && !inspectionDatePickerWrapper?.contains(event.target)) {
        setInspectionCalendarOpen(false);
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && inspectionCalendar && !inspectionCalendar.hidden) {
        setInspectionCalendarOpen(false);
        inspectionDatePicker?.focus();
    }
});

function renderInspectionCalendar() {
    if (!inspectionCalendarDays || !inspectionCalendarMonthLabel) return;

    const year = inspectionDisplayedMonth.getFullYear();
    const month = inspectionDisplayedMonth.getMonth();
    inspectionCalendarMonthLabel.textContent = new Intl.DateTimeFormat("en", {
        month: "long", year: "numeric"
    }).format(inspectionDisplayedMonth);
    inspectionCalendarDays.innerHTML = "";

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let blank = 0; blank < firstWeekday; blank++) {
        const empty = document.createElement("span");
        empty.className = "booking-calendar-day outside-month";
        empty.setAttribute("aria-hidden", "true");
        inspectionCalendarDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const iso = inspectionDateToIso(year, month, day);
        const date = new Date(year, month, day);
        const availability = ocularAvailabilityByDate.get(iso);
        const isFull = Boolean(availability && availability.MORNING && availability.AFTERNOON && availability.NIGHT);
        const hasTakenSlot = Boolean(availability && (availability.MORNING || availability.AFTERNOON || availability.NIGHT));
        const button = document.createElement("button");
        button.type = "button";
        button.className = "booking-calendar-day";
        button.textContent = String(day);
        button.setAttribute("role", "gridcell");
        button.setAttribute("aria-label", `${new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(date)}${isFull ? ", fully booked" : hasTakenSlot ? ", some time slots taken" : ", all time slots available"}`);
        if (hasTakenSlot && !isFull) button.classList.add("partial");
        if (isFull) button.classList.add("full");
        if (inspectionDateInput?.value === iso) button.classList.add("selected");
        button.disabled = iso < inspectionTodayIso || !ocularAvailabilityLoaded || !availability || isFull;
        button.addEventListener("click", () => {
            if (button.disabled || !inspectionDateInput) return;
            inspectionDateInput.value = iso;
            updateInspectionDateDisplay();
            setInspectionCalendarOpen(false);
            if (inspectionTimeInput) inspectionTimeInput.value = "";
            renderInspectionCalendar();
            if (inspectionCalendarHelp) {
                inspectionCalendarHelp.textContent = `${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date)} selected. Pick a time in an open slot.`;
            }
            updateInspectionTimeAvailability();
        });
        inspectionCalendarDays.appendChild(button);
    }
}

async function updateInspectionTimeAvailability() {
    if (!inspectionTimeHelp) return;
    const checkSequence = ++ocularScheduleCheckSequence;
    const paymentBlock = document.getElementById("inspectionPaymentBlock");
    if (paymentBlock) paymentBlock.hidden = true;
    const date = inspectionDateInput?.value;
    const time = inspectionTimeInput?.value;
    if (!date) {
        inspectionTimeHelp.textContent = "Choose a date first, then select a time in an open slot.";
        return;
    }
    if (!ocularAvailabilityLoaded) {
        inspectionTimeHelp.textContent = "Date availability is still loading. Please wait and try again.";
        return;
    }
    const availability = ocularAvailabilityByDate.get(date);
    if (!availability) {
        inspectionTimeHelp.textContent = "Availability for this date could not be confirmed. Choose another date or refresh.";
        return;
    }
    const slot = getInspectionSlotForTime(time);
    if (!slot) {
        inspectionTimeHelp.textContent = "Choose a time between 6:00 AM and midnight so it falls in a morning, afternoon, or night slot.";
        return;
    }
    if (availability[slot]) {
        const label = ({ MORNING: "Morning", AFTERNOON: "Afternoon", NIGHT: "Night" })[slot];
        inspectionTimeHelp.textContent = `${label} is already booked on this date. Choose a time in another open slot.`;
        return;
    }
    const label = ({ MORNING: "Morning", AFTERNOON: "Afternoon", NIGHT: "Night" })[slot];
    const distanceKm = Number(window.kqInspectionDistanceKm);
    if (!window.kqInspectionLocation || !Number.isFinite(distanceKm)) {
        inspectionTimeHelp.textContent = `${label} appears open. Choose your city to check whether there is enough travel time from other accepted inspections.`;
        return;
    }

    inspectionTimeHelp.textContent = "Checking travel time between accepted inspections…";
    const { data: scheduleIssue, error } = await window.supabaseClient.rpc("kq_validate_ocular_inspection_schedule", {
        p_inspection_date: date,
        p_inspection_time: time,
        p_distance_from_base_km: distanceKm
    });
    if (checkSequence !== ocularScheduleCheckSequence) return;
    if (error) {
        console.error("Ocular travel availability check failed:", error);
        inspectionTimeHelp.textContent = "Travel availability could not be checked. Refresh and try again before submitting.";
        return;
    }
    inspectionTimeHelp.textContent = scheduleIssue || `${label} is open. The schedule checks the travel route, a 1-hour inspection, and a 90-minute safety buffer.`;
    if (!scheduleIssue && paymentBlock) paymentBlock.hidden = false;
}

async function loadInspectionAvailabilityForMonth() {
    if (!inspectionCalendarDays || !window.supabaseClient) {
        ocularAvailabilityLoaded = false;
        if (inspectionCalendarHelp) inspectionCalendarHelp.textContent = "Date availability is unavailable. Please refresh and try again.";
        renderInspectionCalendar();
        updateInspectionTimeAvailability();
        return;
    }

    ocularAvailabilityLoaded = false;
    if (inspectionCalendarHelp) inspectionCalendarHelp.textContent = "Loading date availability…";
    renderInspectionCalendar();

    const start = inspectionDateToIso(inspectionDisplayedMonth.getFullYear(), inspectionDisplayedMonth.getMonth(), 1);
    const end = inspectionDateToIso(
        inspectionDisplayedMonth.getFullYear(),
        inspectionDisplayedMonth.getMonth(),
        new Date(inspectionDisplayedMonth.getFullYear(), inspectionDisplayedMonth.getMonth() + 1, 0).getDate()
    );
    const { data, error } = await window.supabaseClient.rpc("kq_booking_slot_availability", {
        p_start_date: start,
        p_end_date: end
    });

    if (error) {
        console.error("Ocular date availability error:", error);
        if (inspectionCalendarHelp) inspectionCalendarHelp.textContent = "Availability setup is not active. Run booking-slot-availability.sql in Supabase, then refresh.";
        renderInspectionCalendar();
        updateInspectionTimeAvailability();
        return;
    }

    ocularAvailabilityByDate = new Map((data || []).map(row => [row.event_date, {
        MORNING: Boolean(row.morning_booked),
        AFTERNOON: Boolean(row.afternoon_booked),
        NIGHT: Boolean(row.night_booked)
    }]));
    ocularAvailabilityLoaded = true;
    renderInspectionCalendar();
    if (inspectionCalendarHelp && !inspectionDateInput?.value) {
        inspectionCalendarHelp.textContent = "Approved event bookings and accepted ocular inspections reserve one morning, afternoon, or night slot. Nearby ocular visits also need enough travel time. Orange dates still have an open slot.";
    }
    updateInspectionTimeAvailability();
}

inspectionCalendarPrevious?.addEventListener("click", () => {
    const previousMonth = new Date(inspectionDisplayedMonth.getFullYear(), inspectionDisplayedMonth.getMonth() - 1, 1);
    const currentMonth = new Date(inspectionToday.getFullYear(), inspectionToday.getMonth(), 1);
    if (previousMonth < currentMonth) return;
    inspectionDisplayedMonth.setTime(previousMonth.getTime());
    loadInspectionAvailabilityForMonth();
});
inspectionCalendarNext?.addEventListener("click", () => {
    inspectionDisplayedMonth.setMonth(inspectionDisplayedMonth.getMonth() + 1);
    loadInspectionAvailabilityForMonth();
});
inspectionTimeInput?.addEventListener("input", updateInspectionTimeAvailability);
renderInspectionCalendar();
loadInspectionAvailabilityForMonth();
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) loadInspectionAvailabilityForMonth();
});
window.setInterval(() => {
    if (!document.hidden) loadInspectionAvailabilityForMonth();
}, 30000);

function normalizeCityName(value) {
    return String(value || "")
        .toLocaleLowerCase("en-PH")
        .replace(/^(city of|municipality of)\s+/i, "")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
}

function getCityLabel(city) {
    return city.province && city.province !== city.region
        ? `${city.name}, ${city.province} — ${city.region}`
        : `${city.name} — ${city.region}`;
}

function calculateCityDistanceKm(destination) {
    const radians = degrees => degrees * Math.PI / 180;
    const lat1 = radians(NORTH_CALOOCAN_REFERENCE.lat);
    const lat2 = radians(destination.lat);
    const deltaLat = radians(destination.lat - NORTH_CALOOCAN_REFERENCE.lat);
    const deltaLng = radians(destination.lng - NORTH_CALOOCAN_REFERENCE.lng);
    const value = Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function updateInspectionFeeEstimate() {
    if (!inspectionCityInput || !inspectionFeeAmount) return;
    const help = document.getElementById('inspectionFeeHelp');
    const paymentBlock = document.getElementById('inspectionPaymentBlock');
    const query = inspectionCityInput.value.trim();
    if (!query) {
        if (help) help.textContent = '';
        if (paymentBlock) paymentBlock.hidden = true;
        inspectionFeeAmount.textContent = "Choose a Luzon city or municipality to see the inspection fee.";
        window.kqInspectionFee = null;
        window.kqInspectionDistanceKm = null;
        window.kqInspectionLocation = null;
        return;
    }

    const normalizedQuery = normalizeCityName(query);
    const exactLabelMatch = PH_LUZON_CITY_COORDINATES.find(city => normalizeCityName(getCityLabel(city)) === normalizedQuery);
    const nameMatches = PH_LUZON_CITY_COORDINATES.filter(city => normalizeCityName(city.name) === normalizedQuery);
    const destination = exactLabelMatch || (nameMatches.length === 1 ? nameMatches[0] : null);
    if (!destination) {
        if (help) help.textContent = '';
        if (paymentBlock) paymentBlock.hidden = true;
        inspectionFeeAmount.textContent = nameMatches.length > 1
            ? "More than one place has that name. Choose the suggestion with its province."
            : "Choose a city or municipality from the suggestions.";
        window.kqInspectionFee = null;
        window.kqInspectionDistanceKm = null;
        window.kqInspectionLocation = null;
        return;
    }

    const distanceKm = Math.round(calculateCityDistanceKm(destination) * 10) / 10;
    const fee = Math.ceil((1500 + (distanceKm * 20)) / 100) * 100;
    window.kqInspectionFee = fee;
    window.kqInspectionDistanceKm = distanceKm;
    window.kqInspectionLocation = {
        city: destination.name,
        province: destination.province,
        region: destination.region
    };
    inspectionFeeAmount.textContent = `📋 Inspection fee for ${getCityLabel(destination)}: ₱${fee.toLocaleString("en-PH")}`;
    if (help) help.textContent = '';
    if (paymentBlock) paymentBlock.hidden = true;
}

if (inspectionCityOptions) {
    const fragment = document.createDocumentFragment();
    PH_LUZON_CITY_COORDINATES
        .slice()
        .sort((a, b) => getCityLabel(a).localeCompare(getCityLabel(b), "en"))
        .forEach(city => {
            const option = document.createElement("option");
            option.value = getCityLabel(city);
            fragment.appendChild(option);
        });
    inspectionCityOptions.appendChild(fragment);
}
inspectionCityInput?.addEventListener("input", () => {
    updateInspectionFeeEstimate();
    updateInspectionTimeAvailability();
});

const celebrantName =
    document.getElementById("celebrantName");

const theme =
    document.getElementById("theme");

const character =
    document.getElementById("character");

const additionalRequest =
    document.getElementById("additionalRequest");

const colorButtons =
    document.querySelectorAll(".color-option");

const summaryCategory =
    document.getElementById("summaryCategory");

const summaryPackage =
    document.getElementById("summaryPackage");

const summaryPrice =
    document.getElementById("summaryPrice");

const summaryEvent =
    document.getElementById("summaryEvent");

const summaryCelebrant =
    document.getElementById("summaryCelebrant");

const summaryTheme =
    document.getElementById("summaryTheme");

const summaryColor =
    document.getElementById("summaryColor");

const summaryCharacter =
    document.getElementById("summaryCharacter");

const totalPrice =
    document.getElementById("totalPrice");

const requestQuotationBtn =
    document.getElementById("requestQuotation");

const resetCustomizer =
    document.getElementById("resetCustomizer");

const quotationModal =
    document.getElementById("quotationModal");


// ========================================
// CATEGORY NAMES
// ========================================

const categoryNames = {
    simple: "Simple Styling",
    venue: "Venue Styling",
    full: "Full Venue Styling"
};


// ========================================
// LOAD PACKAGES
// ========================================

function loadPackages() {

    if (!packageOptions) return;

    packageOptions.innerHTML = "";

    packages[selectedCategory].forEach((pkg, index) => {

        const card = document.createElement("div");

        card.className = "package-option";

        if (
            selectedPackage &&
            selectedPackage.id === pkg.id
        ) {
            card.classList.add("selected");
        }

        card.innerHTML = `
            <div class="package-option-top">

                <div>
                    <h4>${pkg.name}</h4>
                    <p>${pkg.size}</p>
                </div>

                <strong>
                    ₱${pkg.price.toLocaleString()}
                </strong>

            </div>

            <ul>
                ${pkg.features
                .map(feature => `<li>${feature}</li>`)
                .join("")}
            </ul>

            <p class="package-note">Crew meal and transportation are not included. Price may vary by venue; ocular inspection is required.</p>
        `;

        card.addEventListener("click", function () {

            selectedPackage = pkg;

            // Keep the category synchronized
            // with the selected package.
            selectedCategory =
                Object.keys(packages).find(function (category) {

                    return packages[category].some(function (item) {

                        return item.id === pkg.id;

                    });

                }) || selectedCategory;


            // Update category highlight
            categoryButtons.forEach(function (btn) {

                btn.classList.toggle(
                    "selected",
                    btn.dataset.category === selectedCategory
                );

            });


            // Reload package cards
            loadPackages();


            // Update summary
            updateSummary();

        });

        packageOptions.appendChild(card);
    });
}


// ========================================
// CATEGORY SELECTION
// ========================================

categoryButtons.forEach(button => {

    button.addEventListener("click", function () {

        selectedCategory =
            button.dataset.category;

        selectedPackage =
            packages[selectedCategory][0];

        categoryButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        loadPackages();
        updateSummary();

    });

});


// ========================================
// COLOR SELECTION
// ========================================

// ========================================
// COLOR SELECTION
// ========================================

const customColorOption =
    document.getElementById("customColorOption");

const customColorPicker =
    document.getElementById("customColorPicker");

const customColorInput =
    document.getElementById("customColorInput");

const customColorPreview =
    document.getElementById("customColorPreview");

const customColorPreviewLarge =
    document.getElementById("customColorPreviewLarge");

const customColorHex =
    document.getElementById("customColorHex");


// Preset colors
colorButtons.forEach(button => {

    button.addEventListener("click", function () {

        const color =
            button.dataset.color;

        colorButtons.forEach(btn => {
            btn.classList.remove("active");
            btn.classList.remove("selected");
        });

        button.classList.add("active");
        button.classList.add("selected");


        // CUSTOM COLOR
        if (color === "Custom") {

            selectedColor =
                selectedCustomColor;

            if (customColorPicker) {
                customColorPicker.classList.add("show");
            }

            updateCustomColorPreview();

        }

        // PRESET COLOR
        else {

            selectedColor =
                color;

            if (customColorPicker) {
                customColorPicker.classList.remove("show");
            }

        }


        updateSummary();

    });

});


// ========================================
// CUSTOM COLOR INPUT
// ========================================

if (customColorInput) {

    customColorInput.addEventListener(
        "input",
        function () {

            selectedCustomColor =
                customColorInput.value.toUpperCase();

            selectedColor =
                selectedCustomColor;

            updateCustomColorPreview();

            updateSummary();

        }
    );

}


// ========================================
// UPDATE CUSTOM COLOR PREVIEW
// ========================================

function updateCustomColorPreview() {

    if (!selectedCustomColor) return;


    if (customColorPreview) {

        customColorPreview.style.background =
            selectedCustomColor;

    }


    if (customColorPreviewLarge) {

        customColorPreviewLarge.style.background =
            selectedCustomColor;

    }


    if (customColorHex) {

        customColorHex.textContent =
            selectedCustomColor;

    }

}


// ========================================
// INPUT EVENTS
// ========================================

[
    eventType,
    celebrantName,
    theme,
    character,
    additionalRequest
].forEach(input => {

    if (!input) return;

    input.addEventListener("input", updateSummary);

});


// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary() {

    if (!selectedPackage) return;

    if (summaryCategory) {
        summaryCategory.textContent =
            categoryNames[selectedCategory];
    }

    if (summaryPackage) {
        summaryPackage.textContent =
            selectedPackage.name;
    }

    if (summaryPrice) {
        summaryPrice.textContent =
            `₱${selectedPackage.price.toLocaleString()}`;
    }

    if (totalPrice) {
        totalPrice.textContent =
            `₱${selectedPackage.price.toLocaleString()}`;
    }

    if (summaryEvent) {
        summaryEvent.textContent =
            eventType?.value || "Not specified";
    }

    if (summaryCelebrant) {
        summaryCelebrant.textContent =
            celebrantName?.value || "Not specified";
    }

    if (summaryTheme) {
        summaryTheme.textContent =
            theme?.value || "Not specified";
    }

    if (summaryColor) {
        summaryColor.textContent =
            selectedColor || "Not specified";
    }

    if (summaryCharacter) {
        summaryCharacter.textContent =
            character?.value || "Not specified";
    }
}


// ========================================
// REQUEST QUOTATION
// ========================================

async function requestQuotation() {
    const nameInput = document.getElementById("ocularName");
    const emailInput = document.getElementById("ocularEmail");
    const phoneInput = document.getElementById("ocularPhone");
    const dateInput = document.getElementById("inspectionDate");
    const timeInput = document.getElementById("inspectionTime");
    const venueNameInput = document.getElementById("venueName");
    const inspectionPaymentReferenceInput = document.getElementById("inspectionPaymentReference");

    const typedCity = inspectionCityInput?.value.trim() || "";
    const inspectionAddressValue = [inspectionAddress?.value.trim(), typedCity].filter(Boolean).join(", ");
    const preferredDate = dateInput?.value || "";
    const preferredTime = timeInput?.value || "";
    const venueName = venueNameInput?.value.trim() || "";

    if (!window.supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    try {
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        if (userError) throw userError;
        if (!user) {
            showLoginRequiredModal();
            return;
        }

        const { data: profile, error: profileError } = await window.supabaseClient
            .from("profiles")
            .select("full_name, email, contact_number")
            .eq("id", user.id)
            .maybeSingle();
        if (profileError) console.warn("Profile lookup warning:", profileError);

        const customerName = nameInput?.value.trim() || profile?.full_name || user.user_metadata?.full_name || "";
        const customerEmail = emailInput?.value.trim() || profile?.email || user.email || "";
        const customerContact = phoneInput?.value.trim() || profile?.contact_number || user.user_metadata?.contact_number || "";

        if (!customerName || !customerEmail || !customerContact || !preferredDate || !preferredTime || !venueName || !inspectionAddressValue) {
            alert("Please complete your name, email, contact number, preferred ocular date and time, venue name, and venue address.");
            return;
        }

        const inspectionFee = Number.isFinite(window.kqInspectionFee) ? window.kqInspectionFee : null;
        const inspectionPaymentReference = inspectionPaymentReferenceInput?.value.trim() || "";
        if (!window.kqInspectionLocation || !inspectionFee) {
            alert("Choose your Luzon city or municipality from the suggestions to calculate the inspection fee.");
            return;
        }
        const inspectionDistanceKm = Number.isFinite(window.kqInspectionDistanceKm) ? window.kqInspectionDistanceKm : null;
        if (!inspectionPaymentReference) {
            alert("Pay the inspection fee shown using the QR code, then enter your payment transaction/reference number.");
            return;
        }

        const requestedSlot = getInspectionSlotForTime(preferredTime);
        if (!requestedSlot) {
            alert("Choose an ocular appointment time between 6:00 AM and midnight.");
            return;
        }

        const { data: currentAvailabilityRows, error: availabilityError } = await window.supabaseClient.rpc("kq_booking_slot_availability", {
            p_start_date: preferredDate,
            p_end_date: preferredDate
        });
        if (availabilityError) throw availabilityError;
        const currentAvailabilityRow = currentAvailabilityRows?.find(row => row.event_date === preferredDate);
        if (!currentAvailabilityRow) {
            alert("We could not confirm availability for that date. Please refresh the calendar and try again.");
            await loadInspectionAvailabilityForMonth();
            return;
        }

        const refreshedAvailability = {
            MORNING: Boolean(currentAvailabilityRow.morning_booked),
            AFTERNOON: Boolean(currentAvailabilityRow.afternoon_booked),
            NIGHT: Boolean(currentAvailabilityRow.night_booked)
        };
        ocularAvailabilityByDate.set(preferredDate, refreshedAvailability);
        ocularAvailabilityLoaded = true;
        renderInspectionCalendar();
        if (refreshedAvailability[requestedSlot]) {
            updateInspectionTimeAvailability();
            alert("That time slot has already been booked. Please choose another available time.");
            return;
        }

        const { data: scheduleIssue, error: scheduleError } = await window.supabaseClient.rpc("kq_validate_ocular_inspection_schedule", {
            p_inspection_date: preferredDate,
            p_inspection_time: preferredTime,
            p_distance_from_base_km: inspectionDistanceKm
        });
        if (scheduleError) throw scheduleError;
        if (scheduleIssue) {
            updateInspectionTimeAvailability();
            alert(scheduleIssue);
            return;
        }

        const quotationData = {
            user_id: user.id,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_contact: customerContact,
            request_purpose: "OCULAR_INSPECTION",
            inspection_date: preferredDate,
            inspection_time: preferredTime,
            inspection_address: inspectionAddressValue,
            inspection_city: window.kqInspectionLocation?.city || null,
            inspection_province: window.kqInspectionLocation?.province || null,
            inspection_region: window.kqInspectionLocation?.region || null,
            venue_name: venueName,
            inspection_fee: inspectionFee,
            inspection_distance_km: inspectionDistanceKm,
            additional_request: inspectionPaymentReference,
            status: "REQUESTED",
            admin_notes: ""
        };

        const { error } = await window.supabaseClient
            .from("ocular_inspection_requests")
            .insert([quotationData]);
        if (error) throw error;

        sessionStorage.removeItem('kqBookingDraft');
        sessionStorage.removeItem('kqSelectedPackage');

        clearOcularRequestForm();
        showQuotationModal();
    } catch (error) {
        console.error("Ocular inspection request failed:", error);
        alert(error.message || "Unable to send the ocular inspection request. Please try again.");
    }
}

// ========================================
// SUCCESS MODAL
// ========================================

function showQuotationModal() {

    if (!quotationModal) return;

    quotationModal.classList.add("show");

    quotationModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "quotation-modal-open"
    );

    closeQuotationButton?.focus();
}


// ========================================
// CLOSE MODAL
// ========================================

const closeQuotationButton = document.getElementById("closeQuotationModal");
if (closeQuotationButton) {
    closeQuotationButton.addEventListener("click", closeQuotationModal);
}


function closeQuotationModal() {

    if (!quotationModal) return;

    // Move focus out before hiding the modal from assistive technology.
    document.getElementById("requestQuotation")?.focus();

    quotationModal.classList.remove("show");

    quotationModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "quotation-modal-open"
    );
}


// ========================================
// CUSTOM MESSAGE
// ========================================

function showCustomizerMessage(
    message,
    type = "error"
) {

    let messageBox =
        document.getElementById(
            "customizerMessage"
        );


    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.id =
            "customizerMessage";

        document.body.appendChild(
            messageBox
        );
    }


    messageBox.textContent =
        message;

    messageBox.className =
        `customizer-message ${type}`;

    messageBox.classList.add("show");


    setTimeout(function () {

        messageBox.classList.remove(
            "show"
        );

    }, 4000);
}


// ========================================
// RESET CUSTOMIZER
// ========================================

function clearOcularRequestForm() {
    ["ocularName", "ocularEmail", "ocularPhone", "inspectionDate", "inspectionTime", "venueName", "inspectionAddress", "inspectionCity", "inspectionPaymentReference"].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = "";
    });
    updateInspectionDateDisplay();
    setInspectionCalendarOpen(false);
    updateInspectionFeeEstimate();
    renderInspectionCalendar();
    updateInspectionTimeAvailability();
}

resetCustomizer?.addEventListener("click", clearOcularRequestForm);

(async function prefillOcularContact() {
    if (!window.supabaseClient) return;
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;
        const { data: profile } = await window.supabaseClient
            .from("profiles")
            .select("full_name, email, contact_number")
            .eq("id", user.id)
            .maybeSingle();
        const values = {
            ocularName: profile?.full_name || user.user_metadata?.full_name || "",
            ocularEmail: profile?.email || user.email || "",
            ocularPhone: profile?.contact_number || user.user_metadata?.contact_number || ""
        };
        Object.entries(values).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field && !field.value) field.value = value;
        });
    } catch (error) {
        console.warn("Ocular contact details could not be prefilled:", error);
    }
})();

// ========================================
// CLICK OUTSIDE MODAL
// ========================================

if (quotationModal) {

    quotationModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                quotationModal
            ) {
                closeQuotationModal();
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
            quotationModal?.classList.contains(
                "show"
            )
        ) {
            closeQuotationModal();
        }

    }
);


// ========================================
// INITIALIZE
// ========================================

loadPackages();
updateSummary();

console.log(
    "KQ Event Styling Customizer loaded."
);

// ========================================
// REQUEST QUOTATION BUTTON
// ========================================

if (requestQuotationBtn) {
    requestQuotationBtn.addEventListener(
        "click",
        requestQuotation
    );
}
function showLoginRequiredModal() {
    const modal = document.getElementById("loginRequiredModal");

    if (!modal) return;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLoginRequiredModal() {
    const modal = document.getElementById("loginRequiredModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

const notNowBtn = document.getElementById("notNowBtn");
const loginRequiredBtn = document.getElementById("loginRequiredBtn");

if (notNowBtn) {
    notNowBtn.addEventListener("click", closeLoginRequiredModal);
}

if (loginRequiredBtn) {
    loginRequiredBtn.addEventListener("click", function () {
        window.location.href = "login.html";
    });
}
