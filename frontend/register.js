// ===============================
// IMPORT AUTH FUNCTION
// ===============================
// This function checks if a user is already logged in
// If yes → redirects them away from register page (usually to home)
import { redirectIfLoggedIn } from "./auth.js";

// Run immediately when script loads
redirectIfLoggedIn();


// ===============================
// BASE URL
// ===============================
// This is your backend server address
// Change this when deploying (e.g., to your hosted API)
const BASE_URL = "http://localhost:3000";


// ===============================
// GET FORM ELEMENTS
// ===============================
// Get references to HTML elements
const form = document.getElementById("register-form"); // form element
const errorMsg = document.getElementById("error-msg"); // message display


// ===============================
// PASSWORD TOGGLE
// ===============================
// Allows user to show/hide password fields
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {

    // Get the input linked to this icon (via data-target)
    const input = document.getElementById(icon.dataset.target);

    // Toggle visibility
    if (input.type === "password") {
      input.type = "text";     // show password
      icon.textContent = "🙈"; // change icon
    } else {
      input.type = "password"; // hide password
      icon.textContent = "👁"; // revert icon
    }
  });
});


// ===============================
// FORM SUBMISSION
// ===============================
// Runs when user clicks "Register"
form.addEventListener("submit", async (e) => {

  // Prevent default page reload
  e.preventDefault();

  // Get user input values
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value; // date input
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  // Reset error message
  errorMsg.textContent = "";
  errorMsg.style.color = "red";


  // ===============================
  // VALIDATION
  // ===============================
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
    // ===============================
    // SEND REQUEST TO BACKEND
    // ===============================
    // Send registration data to API
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Convert JS object → JSON string
      body: JSON.stringify({
        username,
        email,
        dob,
        password
      })
    });

    // Convert response → JSON
    const data = await response.json();


    // ===============================
    // HANDLE ERROR RESPONSE
    // ===============================
    if (!response.ok) {
      // Show backend error message (if available)
      errorMsg.textContent = data.message || "Registration failed";
      return;
    }


    // ===============================
    // SUCCESS (USER REGISTERED)
    // ===============================

    // Option 1 (current flow):
    // Save a flag in localStorage so login page shows success message
    localStorage.setItem("justRegistered", "true");

    // Redirect user to login page
    window.location.replace("login.html");


    // ===============================
    // OPTION 2 (BETTER UX)
    // ===============================
    // Automatically log user in after registration
    // (uncomment if you want smoother experience)

    /*
    localStorage.setItem("user", JSON.stringify(data));
    window.location.replace("home.html");
    */

  } catch (error) {
    // ===============================
    // NETWORK / SERVER ERROR
    // ===============================
    console.error("Register error:", error);

    // Show fallback message
    errorMsg.textContent = "Server error. Try again later.";
  }
});