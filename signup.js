const signupForm =
    document.getElementById("signupForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const contactInput =
    document.getElementById("contactNumber");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const termsInput =
    document.getElementById("terms");

const signupButton =
    document.getElementById("signupButton");

const message =
    document.getElementById("signupMessage");


// ========================================
// PASSWORD ELEMENTS
// ========================================

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const strengthFill =
    document.getElementById("strengthFill");

const strengthText =
    document.getElementById("strengthText");

const passwordMatch =
    document.getElementById("passwordMatch");


// ========================================
// PASSWORD RULES
// ========================================

const ruleLength =
    document.getElementById("ruleLength");

const ruleUppercase =
    document.getElementById("ruleUppercase");

const ruleLowercase =
    document.getElementById("ruleLowercase");

const ruleNumber =
    document.getElementById("ruleNumber");

const ruleSpecial =
    document.getElementById("ruleSpecial");


// ========================================
// TOAST
// ========================================

const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastTitle =
    document.getElementById("toastTitle");

const toastMessage =
    document.getElementById("toastMessage");

const toastClose =
    document.getElementById("toastClose");


let toastTimer;


// ========================================
// TOAST FUNCTION
// ========================================

function showToast(
    type,
    title,
    text
) {

    clearTimeout(toastTimer);


    toast.className =
        "toast " + type;


    if (type === "success") {

        toastIcon.textContent = "✓";

    } else {

        toastIcon.textContent = "!";
    }


    toastTitle.textContent =
        title;

    toastMessage.textContent =
        text;


    toast.classList.add("show");


    toastTimer =
        setTimeout(function () {

            toast.classList.remove("show");

        }, 5000);
}


// ========================================
// CLOSE TOAST
// ========================================

toastClose.addEventListener(
    "click",
    function () {

        toast.classList.remove("show");

        clearTimeout(toastTimer);

    }
);


// ========================================
// SHOW / HIDE PASSWORD
// ========================================

function setupPasswordToggle(
    button,
    input
) {

    button.addEventListener(
        "click",
        function () {

            const isPassword =
                input.type === "password";


            input.type =
                isPassword
                    ? "text"
                    : "password";


            button.textContent =
                isPassword
                    ? "Hide"
                    : "Show";

        }
    );
}


setupPasswordToggle(
    togglePassword,
    passwordInput
);


setupPasswordToggle(
    toggleConfirmPassword,
    confirmPasswordInput
);


// ========================================
// PASSWORD VALIDATION
// ========================================

function checkPasswordRules(
    password
) {

    const rules = {

        length:
            password.length >= 8,

        uppercase:
            /[A-Z]/.test(password),

        lowercase:
            /[a-z]/.test(password),

        number:
            /[0-9]/.test(password),

        special:
            /[^A-Za-z0-9]/.test(password)

    };


    ruleLength.classList.toggle(
        "valid",
        rules.length
    );

    ruleUppercase.classList.toggle(
        "valid",
        rules.uppercase
    );

    ruleLowercase.classList.toggle(
        "valid",
        rules.lowercase
    );

    ruleNumber.classList.toggle(
        "valid",
        rules.number
    );

    ruleSpecial.classList.toggle(
        "valid",
        rules.special
    );


    return rules;
}


// ========================================
// PASSWORD STRENGTH
// ========================================

function updatePasswordStrength() {

    const password =
        passwordInput.value;


    const rules =
        checkPasswordRules(password);


    const score =
        Object.values(rules)
            .filter(Boolean)
            .length;


    if (!password) {

        strengthFill.style.width =
            "0%";

        strengthText.textContent =
            "";

        return;
    }


    if (score <= 2) {

        strengthFill.style.width =
            "30%";

        strengthText.textContent =
            "Weak password";

        strengthText.style.color =
            "#d9534f";

    } else if (score <= 4) {

        strengthFill.style.width =
            "65%";

        strengthText.textContent =
            "Medium password";

        strengthText.style.color =
            "#d69e2e";

    } else {

        strengthFill.style.width =
            "100%";

        strengthText.textContent =
            "Strong password";

        strengthText.style.color =
            "#198754";

    }
}


// ========================================
// PASSWORD INPUT
// ========================================

passwordInput.addEventListener(
    "input",
    function () {

        updatePasswordStrength();

        checkPasswordMatch();

    }
);


// ========================================
// CONFIRM PASSWORD
// ========================================

function checkPasswordMatch() {

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    if (!confirmPassword) {

        passwordMatch.textContent =
            "";

        passwordMatch.className =
            "password-match";

        return false;
    }


    if (password === confirmPassword) {

        passwordMatch.textContent =
            "✓ Passwords match";

        passwordMatch.className =
            "password-match match";

        return true;

    } else {

        passwordMatch.textContent =
            "✕ Passwords do not match";

        passwordMatch.className =
            "password-match no-match";

        return false;
    }
}


confirmPasswordInput.addEventListener(
    "input",
    checkPasswordMatch
);


// ========================================
// EMAIL VALIDATION
// ========================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


// ========================================
// PHILIPPINE CONTACT VALIDATION
// ========================================

function isValidContactNumber(
    contact
) {
    return /^09\d{9}$/.test(contact);
}

contactInput.addEventListener("input", function () {
    contactInput.value = contactInput.value.replace(/\D/g, "").slice(0, 11);
});


// ========================================
// GET CLEAN CONTACT
// ========================================

function normalizeContact(
    contact
) {

    let cleaned =
        contact.replace(/[\s-]/g, "");


    if (
        cleaned.startsWith("09") &&
        cleaned.length === 11
    ) {

        cleaned =
            "+63" +
            cleaned.substring(1);
    }


    return cleaned;
}


// ========================================
// CLEAR MESSAGE
// ========================================

function clearMessage() {

    message.textContent =
        "";

    message.className =
        "message";
}


// ========================================
// FORM SUBMIT
// ========================================

signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        clearMessage();


        // ========================================
        // GET VALUES
        // ========================================

        const fullName =
            fullNameInput.value.trim();

        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const contact =
            contactInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // ========================================
        // FULL NAME
        // ========================================

        if (fullName.length < 2) {

            showToast(
                "error",
                "Invalid Name",
                "Please enter your full name."
            );

            message.textContent =
                "Please enter your full name.";

            message.className =
                "message error";

            fullNameInput.focus();

            return;
        }


        // ========================================
        // EMAIL
        // ========================================

        if (!isValidEmail(email)) {

            showToast(
                "error",
                "Invalid Email",
                "Please enter a valid email address."
            );

            message.textContent =
                "Please enter a valid email address.";

            message.className =
                "message error";

            emailInput.focus();

            return;
        }


        // ========================================
        // CONTACT
        // ========================================

        if (
            !isValidContactNumber(contact)
        ) {

            showToast(
                "error",
                "Invalid Contact Number",
                "Enter exactly 11 digits, starting with 09."
            );

            message.textContent =
                "Please enter a valid Philippine contact number.";

            message.className =
                "message error";

            contactInput.focus();

            return;
        }


        // ========================================
        // PASSWORD RULES
        // ========================================

        const rules =
            checkPasswordRules(password);


        const passwordValid =
            Object.values(rules)
                .every(Boolean);


        if (!passwordValid) {

            showToast(
                "error",
                "Weak Password",
                "Please complete all password requirements."
            );

            message.textContent =
                "Please complete all password requirements.";

            message.className =
                "message error";

            passwordInput.focus();

            return;
        }


        // ========================================
        // PASSWORD MATCH
        // ========================================

        if (
            password !== confirmPassword
        ) {

            showToast(
                "error",
                "Passwords Don't Match",
                "Please make sure both passwords are identical."
            );

            message.textContent =
                "Passwords do not match.";

            message.className =
                "message error";

            confirmPasswordInput.focus();

            return;
        }


        // ========================================
        // TERMS
        // ========================================

        if (!termsInput.checked) {

            showToast(
                "error",
                "Terms Required",
                "Please agree to the Terms and Conditions."
            );

            message.textContent =
                "Please agree to the Terms and Conditions.";

            message.className =
                "message error";

            termsInput.focus();

            return;
        }


        // ========================================
        // CHECK SUPABASE
        // ========================================

        if (!window.supabaseClient) {

            showToast(
                "error",
                "Connection Error",
                "Unable to connect to the account service."
            );

            message.textContent =
                "Supabase is not connected.";

            message.className =
                "message error";

            console.error(
                "Supabase client is not available."
            );

            return;
        }


        // ========================================
        // LOADING
        // ========================================

        signupButton.disabled =
            true;

        signupButton.textContent =
            "Creating Account...";


        try {

            console.log(
                "Creating Supabase account:",
                email
            );


            // ========================================
            // CREATE ACCOUNT
            // ========================================

            const {
                data,
                error
            } =
                await window.supabaseClient
                    .auth
                    .signUp({

                        email: email,

                        password: password,

                        options: {

                            emailRedirectTo: "https://nas0509.github.io/KQ-EventStyling/",

                            data: {

                                full_name:
                                    fullName,

                                contact_number:
                                    normalizeContact(
                                        contact
                                    )

                            }

                        }

                    });


            // ========================================
            // SUPABASE ERROR
            // ========================================

            if (error) {

                console.error(
                    "Supabase signup error:",
                    error
                );

                throw error;
            }


            console.log(
                "✅ ACCOUNT CREATED:",
                data
            );


            // ========================================
            // SUCCESS — SESSION EXISTS
            // ========================================

            if (data.session) {

                message.textContent =
                    "Account created successfully! Redirecting to login...";

                message.className =
                    "message success";


                showToast(
                    "success",
                    "Account Created!",
                    "Your KQ Event Styling account was created successfully."
                );


                signupForm.reset();

                updatePasswordStrength();

                passwordMatch.textContent =
                    "";


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    2200
                );


                return;
            }


            // ========================================
            // SUCCESS — EMAIL CONFIRMATION REQUIRED
            // ========================================

            message.textContent =
                "Account created successfully! Please check your email to confirm your account before logging in.";

            message.className =
                "message success";


            showToast(
                "success",
                "Account Created!",
                "Please check your email to confirm your account."
            );


            signupForm.reset();

            updatePasswordStrength();

            passwordMatch.textContent =
                "";


        } catch (error) {

            console.error(
                "❌ SIGNUP ERROR:",
                error
            );


            let errorMessage =
                "Unable to create your account.";


            const errorText =
                (
                    error.message ||
                    ""
                ).toLowerCase();


            // ========================================
            // COMMON SUPABASE ERRORS
            // ========================================

            if (
                errorText.includes(
                    "already registered"
                ) ||
                errorText.includes(
                    "already exists"
                ) ||
                errorText.includes(
                    "user already registered"
                )
            ) {

                errorMessage =
                    "This email is already registered. Please login instead.";


                showToast(
                    "error",
                    "Email Already Registered",
                    "An account with this email already exists."
                );


            } else if (
                errorText.includes(
                    "invalid email"
                )
            ) {

                errorMessage =
                    "Please enter a valid email address.";


                showToast(
                    "error",
                    "Invalid Email",
                    "Please check your email address."
                );


            } else if (
                errorText.includes(
                    "password"
                )
            ) {

                errorMessage =
                    "The password does not meet the required security rules.";


                showToast(
                    "error",
                    "Password Error",
                    "Please check the password requirements."
                );


            } else {

                showToast(
                    "error",
                    "Account Creation Failed",
                    error.message ||
                    "Please try again."
                );

            }


            message.textContent =
                errorMessage;

            message.className =
                "message error";


        } finally {

            signupButton.disabled =
                false;

            signupButton.textContent =
                "Create Account";

        }

    }
);
