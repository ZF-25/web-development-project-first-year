import { redirectIfLoggedIn } from "./auth.js";

/**
 * Immediately check if the user is already logged in.
 *
 * Why:
 * - If a logged‑in user tries to open the register page,
 *   they should not be able to register again.
 * - redirectIfLoggedIn() will automatically send them to home.html.
 */
redirectIfLoggedIn();

// ===============================
// DOM ELEMENTS
// ===============================

/**
 * Get references to important elements in the HTML:
 * - form: the registration form.
 * - errorMsg: the area where we show error messages.
 *
 * These will be used throughout the script.
 */
const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-msg");

// ===============================
// PASSWORD VISIBILITY TOGGLE
// ===============================

/**
 * Allows users to show or hide their password fields.
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
// FORM SUBMISSION HANDLER
// ===============================

/**
 * This function runs when the registration form is submitted.
 *
 * Steps:
 * 1. Stop the form from refreshing the page.
 * 2. Read all input values (username, email, dob, password, confirmPassword).
 * 3. Validate that all fields are filled.
 * 4. Check if passwords match.
 * 5. Send a POST request to /api/auth/register.
 * 6. Handle the backend response:
 *    - If registration fails → show error message.
 *    - If registration succeeds → save a flag and redirect to login page.
 * 7. If something goes wrong (server offline, network error),
 *    show a generic error message.
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page reload

  // Read all form values
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  // Clear previous messages
  errorMsg.textContent = "";

  // Check if any field is empty
  if (!username || !email || !dob || !password || !confirmPassword) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match";
    return;
  }

  try {
    /**
     * Send registration data to the backend.
     *
     * IMPORTANT:
     * - We use a relative path `/api/auth/register`
     *   so it works both locally and when deployed.
     */
    const res = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // tell server we're sending JSON
      },
      body: JSON.stringify({ username, email, dob, password })
    });

    // Convert backend response to a JS object
    const data = await res.json();

    // If backend returned an error (e.g., email already exists)
    if (!res.ok) {
      errorMsg.textContent = data.message || "Registration failed";
      return;
    }

     /**
     * Registration successful!
     *
     * - We set a flag in localStorage so the login page
     *   can show a "Registration successful" message.
     */
    localStorage.setItem("justRegistered", "true");

    // Redirect user to login page
    window.location.replace("login.html");

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