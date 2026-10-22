const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const message = document.getElementById("message");
const rememberMe = document.getElementById("rememberMe");


// ========================================
// CHECK SUPABASE
// ========================================

console.log("Login JS loaded.");

console.log(
    "Supabase client:",
    window.supabaseClient
);

if (!window.supabaseClient) {

    console.error(
        "❌ Supabase client is not available."
    );

}


// ========================================
// SHOW / HIDE PASSWORD
// ========================================

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";

            togglePassword.textContent =
                isPassword
                    ? "Hide"
                    : "Show";

            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        }
    );

}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email")
                .value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;


        message.textContent = "";
        message.className = "message";


        const loginButton =
            loginForm.querySelector(
                "button[type='submit']"
            );


        loginButton.disabled = true;
        loginButton.textContent =
            "Logging in...";

        const shouldRemember = Boolean(rememberMe?.checked);
        localStorage.setItem("kqRememberMe", String(shouldRemember));
        if (shouldRemember) {
            localStorage.setItem("kqUserEmail", email);
        } else {
            localStorage.removeItem("kqUserEmail");
        }


        try {

            // ========================================
            // CHECK CONNECTION
            // ========================================

            if (!window.supabaseClient) {

                throw new Error(
                    "Supabase is not connected. Check supabase-config.js."
                );

            }


            // ========================================
            // SUPABASE LOGIN
            // ========================================

            console.log(
                "Attempting login for:",
                email
            );


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            if (error) {

                console.error(
                    "Supabase Auth Error:",
                    error
                );

                throw error;

            }


            console.log(
                "✅ Login successful:",
                data
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
                        "role, full_name"
                    )
                    .eq(
                        "id",
                        data.user.id
                    )
                    .single();


            if (profileError) {

                console.error(
                    "Profile Error:",
                    profileError
                );

                throw new Error(
                    "Account login succeeded, but the user profile was not found."
                );

            }


            console.log(
                "✅ Profile:",
                profile
            );


            // ========================================
            // REDIRECT
            // ========================================

            // Check if the customer came from
            // the booking form or another protected action.

            const returnAfterLogin =
                sessionStorage.getItem(
                    "kqReturnAfterLogin"
                );


            // ========================================
            // ADMIN REDIRECT
            // ========================================

            if (
                profile.role === "admin"
            ) {

                message.textContent =
                    "Admin login successful. Redirecting...";

                message.className =
                    "message success";


                setTimeout(
                    function () {

                        // Admin should always go
                        // to the admin dashboard.

                        sessionStorage.removeItem(
                            "kqReturnAfterLogin"
                        );

                        window.location.replace("admin.html");

                    },
                    700
                );

            }


            // ========================================
            // CUSTOMER REDIRECT
            // ========================================

            else {

                message.textContent =
                    "Login successful. Redirecting...";

                message.className =
                    "message success";


                setTimeout(
                    function () {

                        // If customer came from booking,
                        // return to the booking section.
                        //
                        // Otherwise, go to the homepage.

                        const destination =
                            returnAfterLogin ||
                            "index.html";


                        // Remove the return instruction
                        // after reading it.

                        sessionStorage.removeItem(
                            "kqReturnAfterLogin"
                        );


                        window.location.replace(destination);

                    },
                    700
                );

            }


        } catch (error) {

            console.error(
                "❌ LOGIN ERROR:",
                error
            );


            message.textContent =
                error.message ||
                "Login failed.";

            message.className =
                "message error";


        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";

        }

    }
);


// ========================================
// REMEMBERED EMAIL
// ========================================

const savedEmail =
    localStorage.getItem(
        "kqUserEmail"
    );


const savedRememberPreference = localStorage.getItem("kqRememberMe");

if (savedEmail) {

    document.getElementById(
        "email"
    ).value = savedEmail;


}

if (rememberMe) {
    rememberMe.checked = savedRememberPreference === null
        ? Boolean(savedEmail)
        : savedRememberPreference === "true";
}

let authenticatedRedirectInProgress = false;
window.addEventListener("pageshow", async () => {
    if (!window.supabaseClient || authenticatedRedirectInProgress || loginForm?.querySelector("button[type='submit']")?.disabled) return;

    const { data, error } = await window.supabaseClient.auth.getSession();
    if (error || !data?.session?.user) return;

    const { data: profile, error: profileError } = await window.supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .maybeSingle();
    if (profileError || !profile) return;

    authenticatedRedirectInProgress = true;
    const destination = String(profile.role || "").toLowerCase() === "admin"
        ? "admin.html"
        : sessionStorage.getItem("kqReturnAfterLogin") || "index.html";
    sessionStorage.removeItem("kqReturnAfterLogin");
    window.location.replace(destination);
});
