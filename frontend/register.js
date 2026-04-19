import { redirectIfLoggedIn } from "./auth.js";

/**
 * Immediately check if the user is already logged in.
 *
 * Why:
 * - If a logged‑in user tries to open the register page,
 *   we don’t want them to register again.
 * - redirectIfLoggedIn() will send them to home.html automatically.
 */
redirectIfLoggedIn();

// ===============================
// BASE URL FOR BACKEND
// ===============================

/**
 * BASE_URL decides which backend server to use.
 *
 * How it works:
 * - If the website is running on your computer (localhost),
 *   use the local backend at http://localhost:3000.
 * - If the website is running online (not localhost),
 *   use your deployed backend on Render.
 *
 * This allows the same code to work in both development and production.
 */
const BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://your-backend-name.onrender.com";

 
// ===============================
// DOM ELEMENTS
// ===============================

/**
 * Get references to the form and the error message area.
 * These will be used to read input values and show messages.
 */   
const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-msg");

// ===============================
// PASSWORD VISIBILITY TOGGLE
// ===============================

/**
 * Allows the user to show/hide password fields.
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
 * This runs when the user submits the registration form.
 *
 * Steps:
 * 1. Stop the form from refreshing the page.
 * 2. Read all input values.
 * 3. Validate that all fields are filled.
 * 4. Check if passwords match.
 * 5. Send the data to the backend /api/auth/register endpoint.
 * 6. Handle the response:
 *    - If registration fails → show error message.
 *    - If registration succeeds → save a flag and redirect to login page.
 * 7. If something goes wrong (server down, network error),
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
     * The backend will:
     * - Validate the data
     * - Create a new user
     * - Return a success or error message
     */
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
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
     * We set a flag in localStorage so the login page
     * can show a "Registration successful" message.
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