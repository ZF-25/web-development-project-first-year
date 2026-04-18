// ===============================
// IMPORT AUTH FUNCTION
// ===============================
// Import helper that prevents logged-in users from accessing login page
// (e.g., if already logged in → redirect to home)
import { redirectIfLoggedIn } from "./auth.js";

// Run immediately when script loads
redirectIfLoggedIn();


// ===============================
// BASE URL
// ===============================
// Backend server address (API)
const BASE_URL = "http://localhost:3000";


// ===============================
// GET FORM ELEMENTS
// ===============================
// Get references to HTML elements we will use
const form = document.getElementById("login-form");     // login form
const errorMsg = document.getElementById("error-msg");  // error/success message container


// ===============================
// SHOW SUCCESS MESSAGE AFTER REGISTER
// ===============================
// If user just registered, show success message on login page
// (we previously set this flag in localStorage after registration)
if (localStorage.getItem("justRegistered")) {
  errorMsg.style.color = "green";
  errorMsg.textContent = "Registration successful! Please login.";

  // Remove flag so message doesn't show again on refresh
  localStorage.removeItem("justRegistered");
}


// ===============================
// PASSWORD TOGGLE
// ===============================
// Allows user to show/hide password when clicking eye icon
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {

    // Get the input field linked to this icon (via data-target)
    const input = document.getElementById(icon.dataset.target);

    // Toggle between password and text
    if (input.type === "password") {
      input.type = "text";     // show password
      icon.textContent = "🙈"; // change icon
    } else {
      input.type = "password"; // hide password
      icon.textContent = "👁"; // change icon back
    }
  });
});


// ===============================
// FORM SUBMISSION
// ===============================
// Runs when user clicks "Login"
form.addEventListener("submit", async (e) => {

  // Prevent page reload (default form behavior)
  e.preventDefault();

  // Get user input values
  const identifier = document.getElementById("login-input").value.trim(); // email OR username
  const password = document.getElementById("password").value.trim();

  // Reset error message
  errorMsg.textContent = "";
  errorMsg.style.color = "red";


  // ===============================
  // VALIDATION
  // ===============================
  // Check if fields are empty
  if (!identifier || !password) {
    errorMsg.textContent = "Please fill all fields";
    return; // stop execution
  }

  try {
    // ===============================
    // SEND REQUEST TO BACKEND
    // ===============================
    // Send login data to server
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Convert JS object → JSON string
      body: JSON.stringify({ identifier, password })
    });

    // Convert response → JSON
    const data = await response.json();


    // ===============================
    // HANDLE ERRORS FROM SERVER
    // ===============================
    if (!response.ok) {
      // Show error message from backend (if exists)
      errorMsg.textContent = data.message || "Login failed";
      return;
    }


    // ===============================
    // SUCCESS (LOGIN WORKED)
    // ===============================

    // Save user data in localStorage
    // This keeps user "logged in" across pages
    localStorage.setItem("user", JSON.stringify(data));

    // Debug (optional)
    console.log("Logged in user:", data);

    // Redirect to home page
    // replace() prevents going back to login page using back button
    window.location.replace("home.html");

  } catch (error) {
    // ===============================
    // NETWORK / SERVER ERROR
    // ===============================
    console.error("Login error:", error);

    // Show fallback error message
    errorMsg.textContent = "Server error. Try again later.";
  }
});