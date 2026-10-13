// ========================================
// KQ EVENT STYLING
// EVENT STYLING CUSTOMIZER
// SUPABASE VERSION
// ========================================

const packages = {
    simple: [
        {
            id: "simple-1",
            name: "Simple Package — 1 Panel",
            price: 5500,
            size: "1 Panel Backdrop",
            features: [
                "Thematic balloon garland",
                "Celebrant name styro cut — max. 7 letters",
                "Thematic props",
                "Number lighted standee",
                "Basic floor lights for backdrop area"
            ]
        },
        {
            id: "simple-2",
            name: "Simple Package — 2 Panel",
            price: 6500,
            size: "7×8ft • 2 Panel Backdrop",
            features: [
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
                "Cake pedestal",
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
    const eventType =
        document.getElementById("eventType")?.value.trim() || "";

    const celebrantName =
        document.getElementById("celebrantName")?.value.trim() || "";

    const theme =
        document.getElementById("theme")?.value.trim() || "";

    const character =
        document.getElementById("character")?.value.trim() || "";

    const additionalRequest =
        document.getElementById("additionalRequest")?.value.trim() || "";

    if (!eventType) {
        alert("Please select your event type.");
        return;
    }

    if (!selectedPackage) {
        alert("Please select a package.");
        return;
    }

    // Check login
    if (!window.supabaseClient) {
        alert("Supabase is not connected.");
        return;
    }

    try {
        // =========================================
        // GET CURRENT USER
        // =========================================

        const {
            data: { user },
            error: userError
        } = await window.supabaseClient.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {
            showLoginRequiredModal();
            return;
        }


        // =========================================
        // GET CUSTOMER PROFILE
        // =========================================

        const {
            data: profile,
            error: profileError
        } = await window.supabaseClient
            .from("profiles")
            .select("full_name, email, contact_number")
            .eq("id", user.id)
            .single();

        if (profileError) {
            throw profileError;
        }


        // =========================================
        // SAVE QUOTATION TO SUPABASE
        // =========================================

        const quotationData = {
            user_id: user.id,

            customer_name:
                profile?.full_name ||
                user.user_metadata?.full_name ||
                "",

            customer_email:
                profile?.email ||
                user.email ||
                "",

            customer_contact:
                profile?.contact_number ||
                user.user_metadata?.contact_number ||
                "",

            category: selectedCategory,

            package_id:
                selectedPackage.id,

            package_name:
                selectedPackage.name,

            package_price:
                selectedPackage.price,

            event_type:
                eventType,

            celebrant_name:
                celebrantName,

            theme:
                theme,

            color:
                selectedColor || "",

            character:
                character,

            additional_request:
                additionalRequest,

            status:
                "REQUESTED",

            admin_notes:
                ""
        };


        console.log("Submitting quotation:", quotationData);


        const {
            data,
            error
        } = await window.supabaseClient
            .from("quotation_requests")
            .insert([quotationData])
            .select()
            .single();


        if (error) {
            console.error("Quotation insert error:", error);
            throw error;
        }


        console.log(
            "Quotation successfully saved:",
            data
        );


        // =========================================
        // SAVE DATA FOR BOOKING PROCESS
        // =========================================

        const bookingDraft = {
            quotationId: data.id,

            eventType:
                eventType,

            celebrantName:
                celebrantName,

            theme:
                theme,

            color:
                selectedColor || "",

            character:
                character,

            additionalRequest:
                additionalRequest,

            category:
                selectedCategory,

            packageId:
                selectedPackage.id,

            packageName:
                selectedPackage.name,

            packagePrice:
                selectedPackage.price
        };


        sessionStorage.setItem(
            "kqBookingDraft",
            JSON.stringify(bookingDraft)
        );


        // =========================================
        // SHOW SUCCESS MODAL
        // =========================================

        const modal =
            document.getElementById("quotationModal");

        if (modal) {
            modal.classList.add("show");
        }

    } catch (error) {

        console.error(
            "Quotation request failed:",
            error
        );

        alert(
            error.message ||
            "Unable to submit quotation request. Please try again."
        );
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
}


// ========================================
// CLOSE MODAL
// ========================================

const closeQuotationButtons =
    quotationModal
        ? quotationModal.querySelectorAll(
            ".quotation-modal-card button"
        )
        : [];

closeQuotationButtons.forEach(button => {
    button.addEventListener(
        "click",
        closeQuotationModal
    );
});


closeQuotationButtons.forEach(button => {

    button.addEventListener("click", function () {

        closeQuotationModal();

        // Reset all customization data
        if (resetCustomizer) {
            resetCustomizer.click();
        }

    });

});


function closeQuotationModal() {

    if (!quotationModal) return;

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

if (resetCustomizer) {

    resetCustomizer.addEventListener(
        "click",
        function () {

            selectedCategory =
                "simple";

            selectedPackage =
                packages.simple[0];

            selectedColor =
                "";


            if (eventType)
                eventType.value = "";

            if (celebrantName)
                celebrantName.value = "";

            if (theme)
                theme.value = "";

            if (character)
                character.value = "";

            if (additionalRequest)
                additionalRequest.value = "";


            colorButtons.forEach(button => {
                button.classList.remove(
                    "selected"
                );
            });


            categoryButtons.forEach(button => {

                button.classList.remove(
                    "selected"
                );

                if (
                    button.dataset.category ===
                    "simple"
                ) {
                    button.classList.add(
                        "selected"
                    );
                }

            });


            loadPackages();
            updateSummary();

        }
    );
}


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