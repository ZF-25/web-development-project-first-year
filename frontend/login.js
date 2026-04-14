// ===============================
// IMPORT AUTH FUNCTION
// ===============================
// Prevent logged-in users from accessing login page
import { redirectIfLoggedIn } from "./auth.js";

redirectIfLoggedIn();


// ===============================
// GET FORM ELEMENTS
// ===============================
// Reference form and UI elements
const form = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const errorMsg = document.getElementById("error-msg");


// ===============================
// SHOW SUCCESS MESSAGE AFTER REGISTER
// ===============================
// If user just registered, show success message
if (localStorage.getItem("justRegistered")) {
  errorMsg.style.color = "green";
  errorMsg.textContent = "Registration successful! Please login.";
  localStorage.removeItem("justRegistered");
}


// ===============================
// PASSWORD TOGGLE
// ===============================
// Allows user to show/hide password field
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);

    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "🙈"; // hide icon
    } else {
      input.type = "password";
      icon.textContent = "👁"; // show icon
    }
  });
});


// ===============================
// FORM SUBMISSION HANDLER
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page reload

  // ===============================
  // GET INPUT VALUES
  // ===============================
  const identifier = document.getElementById("login-input").value.trim();
  const password = document.getElementById("password").value.trim();

  // Clear previous error message
  errorMsg.textContent = "";

  // ===============================
  // FORM VALIDATION
  // ===============================
  if (!identifier || !password) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  try {
    // ===============================
    // LOADING STATE
    // ===============================
    loginBtn.textContent = "Signing in...";
    loginBtn.disabled = true;

    // ===============================
    // SEND LOGIN REQUEST TO BACKEND
    // ===============================
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ identifier, password })
    });

    const data = await response.json();

    // ===============================
    // HANDLE SERVER RESPONSE
    // ===============================
    if (!response.ok) {
      errorMsg.textContent = data.message || "Login failed";
      loginBtn.textContent = "Sign in";
      loginBtn.disabled = false;
      return;
    }

    // ===============================
    // SUCCESS HANDLING
    // ===============================
    // Store user session in localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to home/dashboard
    window.location.replace("home.html");

  } catch (error) {

    // ===============================
    // HANDLE NETWORK / SERVER ERRORS
    // ===============================
    console.error(error);

    errorMsg.textContent = "Server error. Try again later.";

    // Reset button state
    loginBtn.textContent = "Sign in";
    loginBtn.disabled = false;
  }
});


// ===============================
// ENTER KEY SUPPORT
// ===============================
// Allow pressing Enter to submit form
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});


// ===============================
// BUTTON CLICK EFFECT (UI FEEDBACK)
// ===============================
loginBtn.addEventListener("mousedown", () => {
  loginBtn.style.transform = "scale(0.95)";
});

loginBtn.addEventListener("mouseup", () => {
  loginBtn.style.transform = "scale(1)";
});


// ===============================
// HEADER SHADOW ON SCROLL
// ===============================
// Adds shadow to header when scrolling
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (header) {
    header.style.boxShadow =
      window.scrollY > 20 ? "0 4px 10px rgba(0,0,0,0.2)" : "none";
  }
});