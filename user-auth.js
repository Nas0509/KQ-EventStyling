// ========================================
// KQ EVENT STYLING
// SUPABASE AUTHENTICATION
// PUBLIC WEBSITE AUTH HANDLER
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    // ========================================
    // ELEMENTS
    // ========================================

    const authNavBtn =
        document.getElementById("authNavBtn");

    const logoutModal =
        document.getElementById("logoutModal");

    const cancelLogout =
        document.getElementById("cancelLogout");

    const confirmLogout =
        document.getElementById("confirmLogout");


    // ========================================
    // CHECK SUPABASE
    // ========================================

    if (!window.supabaseClient) {

        console.error(
            "❌ Supabase client is not available."
        );

        return;
    }


    // ========================================
    // UPDATE AUTH NAVIGATION BUTTON
    // ========================================

    function updateAuthButton(session) {

        if (!authNavBtn) {

            console.warn(
                "⚠️ authNavBtn was not found."
            );

            return;
        }


        // ========================================
        // GUEST / NOT LOGGED IN
        // ========================================

        if (!session) {

            authNavBtn.textContent =
                "Sign In";

            authNavBtn.classList.remove(
                "logged-in"
            );


            authNavBtn.onclick =
                function () {

                    window.location.href =
                        "login.html";

                };


            console.log(
                "👤 Guest user: Sign In button displayed."
            );

            return;
        }


        // ========================================
        // LOGGED-IN USER
        // ========================================

        authNavBtn.textContent =
            "Logout";

        authNavBtn.classList.add(
            "logged-in"
        );


        authNavBtn.onclick =
            function () {

                openLogoutModal();

            };


        console.log(
            "👤 Logged-in user: Logout button displayed."
        );

    }


    // ========================================
    // CHECK CURRENT SESSION
    // ========================================

    try {

        const {
            data: { session },
            error
        } =
            await window.supabaseClient
                .auth
                .getSession();


        if (error) {

            console.error(
                "❌ Session error:",
                error
            );


            updateAuthButton(null);

            return;
        }


        // ========================================
        // NO ACTIVE SESSION
        // ========================================

        if (!session) {

            console.log(
                "ℹ️ No active Supabase session."
            );


            updateAuthButton(null);

        }


        // ========================================
        // ACTIVE SESSION
        // ========================================

        else {

            console.log(
                "✅ Logged in:",
                session.user.email
            );


            updateAuthButton(session);

        }

    } catch (error) {

        console.error(
            "❌ Session check failed:",
            error
        );


        updateAuthButton(null);

    }


    // ========================================
    // LISTEN FOR AUTH STATE CHANGES
    // ========================================

    window.supabaseClient.auth.onAuthStateChange(
        function (event, session) {

            console.log(
                "🔄 Auth state changed:",
                event
            );


            updateAuthButton(session);

        }
    );


    // ========================================
    // OPEN LOGOUT MODAL
    // ========================================

    function openLogoutModal() {

        if (!logoutModal) {

            console.warn(
                "⚠️ Logout modal not found."
            );

            return;
        }


        // Clear previous error

        const errorBox =
            logoutModal.querySelector(
                ".logout-error"
            );


        if (errorBox) {

            errorBox.classList.remove(
                "show"
            );

            errorBox.textContent = "";

        }


        // Reset logout buttons

        if (confirmLogout) {

            confirmLogout.disabled =
                false;

            confirmLogout.textContent =
                "Logout";

        }


        if (cancelLogout) {

            cancelLogout.disabled =
                false;

        }


        // Show modal

        logoutModal.classList.add(
            "show"
        );


        document.body.classList.add(
            "logout-modal-open"
        );

    }


    // ========================================
    // CLOSE LOGOUT MODAL
    // ========================================

    function closeLogoutModal() {

        if (!logoutModal) {

            return;
        }


        logoutModal.classList.remove(
            "show"
        );


        document.body.classList.remove(
            "logout-modal-open"
        );

    }


    // ========================================
    // CANCEL LOGOUT
    // ========================================

    if (cancelLogout) {

        cancelLogout.addEventListener(
            "click",
            function () {

                closeLogoutModal();

            }
        );

    }


    // ========================================
    // CLICK OUTSIDE LOGOUT MODAL
    // ========================================

    if (logoutModal) {

        logoutModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    logoutModal
                ) {

                    closeLogoutModal();

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
                logoutModal &&
                logoutModal.classList.contains("show")
            ) {

                closeLogoutModal();

            }

        }
    );


    // ========================================
    // CONFIRM LOGOUT
    // ========================================

    if (confirmLogout) {

        confirmLogout.addEventListener(
            "click",
            async function () {

                confirmLogout.disabled =
                    true;


                if (cancelLogout) {

                    cancelLogout.disabled =
                        true;

                }


                confirmLogout.innerHTML =
                    '<span class="logout-spinner"></span> Logging out...';


                try {

                    // ========================================
                    // SUPABASE SIGN OUT
                    // ========================================

                    const {
                        error
                    } =
                        await window.supabaseClient
                            .auth
                            .signOut();


                    if (error) {

                        throw error;

                    }


                    console.log(
                        "✅ Supabase logout successful."
                    );


                    // ========================================
                    // REMOVE SAVED EMAIL
                    // ========================================

                    localStorage.removeItem(
                        "kqUserEmail"
                    );


                    // ========================================
                    // CLOSE LOGOUT MODAL
                    // ========================================

                    closeLogoutModal();


                    // ========================================
                    // RESET BUTTONS
                    // ========================================

                    confirmLogout.disabled =
                        false;


                    confirmLogout.textContent =
                        "Logout";


                    if (cancelLogout) {

                        cancelLogout.disabled =
                            false;

                    }


                    // ========================================
                    // UPDATE NAVBAR
                    // ========================================

                    updateAuthButton(null);


                    // ========================================
                    // OPTIONAL MESSAGE
                    // ========================================

                    console.log(
                        "👋 User successfully logged out."
                    );


                } catch (error) {

                    console.error(
                        "❌ Logout error:",
                        error
                    );


                    // ========================================
                    // ENABLE BUTTONS AGAIN
                    // ========================================

                    confirmLogout.disabled =
                        false;


                    if (cancelLogout) {

                        cancelLogout.disabled =
                            false;

                    }


                    confirmLogout.textContent =
                        "Logout";


                    // ========================================
                    // SHOW ERROR
                    // ========================================

                    showLogoutError(
                        "We couldn't sign you out. Please try again."
                    );

                }

            }
        );

    }


    // ========================================
    // LOGOUT ERROR MESSAGE
    // ========================================

    function showLogoutError(text) {

        if (!logoutModal) {

            return;
        }


        let errorBox =
            logoutModal.querySelector(
                ".logout-error"
            );


        // ========================================
        // CREATE ERROR BOX IF NEEDED
        // ========================================

        if (!errorBox) {

            errorBox =
                document.createElement(
                    "div"
                );


            errorBox.className =
                "logout-error";


            const actions =
                logoutModal.querySelector(
                    ".logout-modal-actions"
                );


            if (actions) {

                actions.before(
                    errorBox
                );

            }
            else {

                logoutModal
                    .querySelector(
                        ".logout-modal-card"
                    )
                    ?.appendChild(
                        errorBox
                    );

            }

        }


        // ========================================
        // DISPLAY ERROR
        // ========================================

        errorBox.textContent =
            text;


        errorBox.classList.add(
            "show"
        );

    }

});