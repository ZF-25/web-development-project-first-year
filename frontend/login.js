import { redirectIfLoggedIn } from "./auth.js";

/**
 * Immediately check if the user is already logged in.
 *
 * Why:
 * - If a logged‑in user tries to open the login page,
 *   they should not see it again.
 * - redirectIfLoggedIn() will automatically send them to home.html.
 */
redirectIfLoggedIn();

// ===============================
// DOM ELEMENTS
// ===============================

/**
 * Get references to important elements in the HTML:
 * - form: the login form element.
 * - errorMsg: the area where we show errors or success messages.
 *
 * These will be used throughout the script.
 */
const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

// ===============================
// SHOW SUCCESS MESSAGE AFTER REGISTRATION
// ===============================

/**
 * When a user registers, register.js sets:
 *   localStorage.setItem("justRegistered", "true")
 *
 * Here:
 * - We check if that flag exists.
 * - If it does:
 *   - Show a green success message.
 *   - Remove the flag so the message only appears once.
 */
if (localStorage.getItem("justRegistered")) {
  errorMsg.style.color = "green";
  errorMsg.textContent = "Registration successful! Please login.";
  localStorage.removeItem("justRegistered");
}

// ===============================
// PASSWORD VISIBILITY TOGGLE
// ===============================

/**
 * Allows users to show/hide their password.
 *
 * How it works:
 * - Finds all elements with class "toggle-password".
 * - Each icon has a data-target attribute pointing to the input it controls.
 * - When clicked:
 *   - If the input type is "password", change it to "text" (show password).
 *   - If it's "text", change it back to "password" (hide password).
 */
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// ===============================
// FORM SUBMIT HANDLER
// ===============================

/**
 * This function runs when the login form is submitted.
 *
 * Steps:
 * 1. Stop the form from refreshing the page.
 * 2. Read the login input and password.
 * 3. Validate that both fields are filled.
 * 4. Send a POST request to /api/auth/login.
 * 5. Handle the backend response:
 *    - If login fails → show error message.
 *    - If login succeeds → save user in localStorage and redirect.
 * 6. If something goes wrong (server offline, network error),
 *    show a generic error message.
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page reload

  // Read input values
  const identifier = document.getElementById("login-input").value.trim();
  const password = document.getElementById("password").value.trim();

  // Clear previous messages
  errorMsg.textContent = "";

  // Basic validation
  if (!identifier || !password) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  try {
    /**
     * Send login request to the backend.
     *
     * IMPORTANT:
     * - We use a relative path `/api/auth/login`
     *   so it works both locally and when deployed.
     */
    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // tell server we're sending JSON
      },
      body: JSON.stringify({ identifier, password })
    });

    // Convert backend response to a JS object
    const data = await res.json();

    // If backend returned an error (e.g., wrong password)
    if (!res.ok) {
      errorMsg.textContent = data.message || "Login failed";
      return;
    }

    /**
     * Login successful!
     *
     * - Save the returned user data in localStorage.
     * - Redirect to home.html.
     */
    localStorage.setItem("user", JSON.stringify(data));
    window.location.replace("home.html");

  } catch (err) {
    /**
     * This runs if:
     * - The server is offline
     * - There is a network issue
     * - Something unexpected happens during fetch()
     */
    console.error(err);
    errorMsg.textContent = "Server error. Try again later.";
  }
});