// ===============================
// IMPORT AUTH FUNCTION
// ===============================
// Prevent logged-in users from accessing login page
import { redirectIfLoggedIn } from "./auth.js";

redirectIfLoggedIn();


// ===============================
// BASE URL
// ===============================
// Change this when deploying
const BASE_URL = "http://localhost:3000";


// ===============================
// GET FORM ELEMENTS
// ===============================
const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");


// ===============================
// SHOW SUCCESS MESSAGE AFTER REGISTER
// ===============================
if (localStorage.getItem("justRegistered")) {
  errorMsg.style.color = "green";
  errorMsg.textContent = "Registration successful! Please login.";
  localStorage.removeItem("justRegistered");
}


// ===============================
// PASSWORD TOGGLE
// ===============================
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);

    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "🙈";
    } else {
      input.type = "password";
      icon.textContent = "👁";
    }
  });
});


// ===============================
// FORM SUBMISSION
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get input values
  const identifier = document.getElementById("login-input").value;
  const password = document.getElementById("password").value;

  // Clear error
  errorMsg.textContent = "";

  // Basic validation
  if (!identifier || !password) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  try {
    // Send request to backend
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ identifier, password })
    });

    const data = await response.json();

    // Handle error
    if (!response.ok) {
      errorMsg.textContent = data.message || "Login failed";
      return;
    }

    // ===============================
    // SUCCESS
    // ===============================

    // Save user in localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to home page
    window.location.replace("home.html");

  } catch (error) {
    errorMsg.textContent = "Server error. Try again later.";
  }
});