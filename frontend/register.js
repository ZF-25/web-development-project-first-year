// ===============================
// IMPORT AUTH FUNCTION
// ===============================
// Import function to prevent logged-in users from accessing this page
import { redirectIfLoggedIn } from "./auth.js";

// Redirect user to home page if already logged in
redirectIfLoggedIn();


// ===============================
// GET FORM ELEMENTS
// ===============================
// Get references to DOM elements used in the form
const form = document.getElementById("register-form");
const registerBtn = document.getElementById("register-btn");
const errorMsg = document.getElementById("error-msg");


// ===============================
// PASSWORD VISIBILITY TOGGLE
// ===============================
// Allows users to show/hide password and confirm password fields
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {

    // Get the input field linked to this icon
    const input = document.getElementById(icon.dataset.target);

    // Toggle between password and text input type
    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "🙈"; // Change icon to indicate hidden state
    } else {
      input.type = "password";
      icon.textContent = "👁"; // Change icon to indicate visible state
    }
  });
});


// ===============================
// FORM SUBMISSION HANDLER
// ===============================
// Handles the registration process when user submits the form
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default form reload behavior

  // ===============================
  // GET INPUT VALUES
  // ===============================
  // Collect and clean user input values
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  // Clear any previous error message
  errorMsg.textContent = "";


  // ===============================
  // FORM VALIDATION
  // ===============================

  // Check if any field is empty
  if (!username || !email || !dob || !password || !confirmPassword) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorMsg.textContent = "Invalid email format";
    return;
  }

  // Check minimum password length
  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters";
    return;
  }

  // Ensure password contains at least one uppercase letter and one number
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    errorMsg.textContent = "Password must include a capital letter and a number";
    return;
  }

  // Check if password and confirm password match
  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match";
    return;
  }


  // ===============================
  // SEND DATA TO BACKEND
  // ===============================
  try {
    // Show loading state to user
    registerBtn.textContent = "Creating...";
    registerBtn.disabled = true;

    // Send POST request to backend API
    const response = await fetch("http://localhost:3000/api/auth/register", {
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

    // Parse response JSON
    const data = await response.json();


    // ===============================
    // HANDLE SERVER RESPONSE
    // ===============================
    if (!response.ok) {
      // Display error message returned from backend
      errorMsg.textContent = data.message || "Registration failed";

      // Reset button state
      registerBtn.textContent = "Register";
      registerBtn.disabled = false;
      return;
    }


    // ===============================
    // SUCCESS HANDLING
    // ===============================

    // Store a flag to show success message on login page
    localStorage.setItem("justRegistered", "true");

    // Redirect to login page (replace prevents back navigation)
    window.location.replace("login.html");

  } catch (error) {

    // ===============================
    // HANDLE NETWORK / SERVER ERRORS
    // ===============================
    console.error(error);

    // Show generic error message
    errorMsg.textContent = "Server error. Try again later.";

    // Reset button state
    registerBtn.textContent = "Register";
    registerBtn.disabled = false;
  }
});


// ===============================
// ENTER KEY SUPPORT
// ===============================
// Allows pressing Enter key to submit the form
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});


// ===============================
// BUTTON CLICK EFFECT
// ===============================
// Adds visual feedback when button is pressed
registerBtn.addEventListener("mousedown", () => {
  registerBtn.style.transform = "scale(0.95)";
});

registerBtn.addEventListener("mouseup", () => {
  registerBtn.style.transform = "scale(1)";
});