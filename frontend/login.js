import { redirectIfLoggedIn } from "./auth.js";

// Immediately check if the user is already logged in.
// - If they are logged in, redirectIfLoggedIn() will send them to home.html.
// - This prevents logged-in users from seeing the login page again.
redirectIfLoggedIn();

// ===============================
// BASE URL FOR BACKEND
// ===============================

/**
 * BASE_URL is the address of your backend server.
 *
 * What this does:
 * - Checks where the site is running:
 *   - If it's on localhost (your own computer), use "http://localhost:3000".
 *   - Otherwise, use your deployed backend URL on Render (or another host).
 *
 * Why this is useful:
 * - You can use the same frontend code in development and production
 *   without changing the URL manually every time.
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
 * Get references to important elements in the HTML:
 * - form: the login form element.
 * - errorMsg: the element where we show error or success messages.
 */
const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

// ===============================
// SHOW SUCCESS MESSAGE AFTER REGISTRATION
// ===============================

/**
 * After a user registers, you can set a flag in localStorage
 * (for example, in your register.js file):
 *   localStorage.setItem("justRegistered", "true");
 *
 * Here:
 * - We check if "justRegistered" exists in localStorage.
 * - If it does:
 *   - Show a green success message: "Registration successful! Please login."
 *   - Then remove "justRegistered" so the message only appears once.
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
 * This code allows the user to show/hide the password.
 *
 * How it works:
 * - It finds all elements with the class "toggle-password".
 * - Each of these elements should have a data-target attribute
 *   that matches the id of the input it controls.
 *   Example in HTML:
 *     <input id="password" type="password" />
 *     <span class="toggle-password" data-target="password">👁</span>
 *
 * - When the icon is clicked:
 *   - It finds the related input using icon.dataset.target.
 *   - If the input type is "password", it changes it to "text" (show password).
 *   - If the input type is "text", it changes it back to "password" (hide password).
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
 * This handles the login form submission.
 *
 * Steps:
 * 1. Prevent the default form behavior (page reload).
 * 2. Read the values from the login input and password input.
 * 3. Validate that both fields are filled.
 * 4. Send a POST request to the backend /api/auth/login endpoint.
 * 5. Handle the response:
 *    - If login fails, show an error message.
 *    - If login succeeds, save the user in localStorage and go to home.html.
 * 6. If something goes wrong with the request (server down, network error),
 *    show a generic "Server error" message.
 */
form.addEventListener("submit", async (e) => {
  // Stop the form from reloading the page
  e.preventDefault();

  // Get the values from the inputs and remove extra spaces
  const identifier = document.getElementById("login-input").value.trim();
  const password = document.getElementById("password").value.trim();

  // Clear any previous message
  errorMsg.textContent = "";

  // Basic validation: make sure both fields are filled
  if (!identifier || !password) {
    errorMsg.textContent = "Please fill all fields";
    return; // stop here, do not send request
  }

  try {
    // Send login request to the backend
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // tell server we're sending JSON
      },
      body: JSON.stringify({ identifier, password }) // send data as JSON
    });

    // Convert the response body to a JavaScript object
    const data = await res.json();

    // If the response status is not OK (e.g., 400, 401, 500...)
    if (!res.ok) {
      // Show the error message from the server if it exists,
      // otherwise show a generic "Login failed" message.
      errorMsg.textContent = data.message || "Login failed";
      return;
    }

    /**
     * If we reach here, login was successful.
     *
     * - data should contain user info and maybe a token (depending on your backend).
     * - We save this user data in localStorage under the key "user".
     * - Then we redirect the user to home.html.
     */
    localStorage.setItem("user", JSON.stringify(data));
    window.location.replace("home.html");

  } catch (err) {
    /**
     * This catch block runs if:
     * - The server is down.
     * - There is a network error.
     * - Something unexpected happens during fetch().
     */
    console.error(err);
    errorMsg.textContent = "Server error. Try again later.";
  }
});