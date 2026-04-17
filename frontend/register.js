// ===============================
// IMPORT AUTH FUNCTION
// ===============================
// Prevent logged-in users from accessing register page
import { redirectIfLoggedIn } from "./auth.js";

redirectIfLoggedIn();


// ===============================
// BASE URL
// ===============================
// This is your backend URL
// Change this when deploying to Render
const BASE_URL = "http://localhost:3000";


// ===============================
// GET FORM ELEMENTS
// ===============================
// Get form and error message elements from HTML
const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-msg");


// ===============================
// PASSWORD TOGGLE (SHOW / HIDE)
// ===============================
// This allows user to click 👁 to show/hide password
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {

    // Find the input field linked to this icon
    const input = document.getElementById(icon.dataset.target);

    // If password is hidden → show it
    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "🙈";
    } 
    // If password is visible → hide it
    else {
      input.type = "password";
      icon.textContent = "👁";
    }
  });
});


// ===============================
// FORM SUBMISSION
// ===============================
// This runs when user clicks "Register"
form.addEventListener("submit", async (e) => {

  // Prevent page from refreshing
  e.preventDefault();

  // ===============================
  // GET INPUT VALUES
  // ===============================
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Clear previous error
  errorMsg.textContent = "";


  // ===============================
  // BASIC VALIDATION
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


  // ===============================
  // SEND DATA TO BACKEND
  // ===============================
  try {

    // Send POST request to backend
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        dob,
        password
      })
    });

    // Convert response to JSON
    const data = await response.json();


    // ===============================
    // HANDLE RESPONSE
    // ===============================

    // If server returns error
    if (!response.ok) {
      errorMsg.textContent = data.message || "Registration failed";
      return;
    }


    // ===============================
    // SUCCESS
    // ===============================

    // Save flag to show message on login page
    localStorage.setItem("justRegistered", "true");

    // Redirect user to login page
    window.location.replace("login.html");

  } catch (error) {

    // ===============================
    // ERROR HANDLING
    // ===============================

    // If server is down or network issue
    errorMsg.textContent = "Server error. Try again later.";
  }
});