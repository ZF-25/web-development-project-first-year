// ===============================
// BLOCK IF USER ALREADY LOGGED IN
// ===============================
const user = localStorage.getItem("user");

if (user) {
  window.location.replace("home.html");
}

// Handles user login functionality:
// - Validates input fields
// - Sends login request to backend
// - Manages UI states and redirects

// ===============================
// GET FORM ELEMENTS
// ===============================
const form = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
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
  const identifier = document.getElementById("login-input").value.trim();
  const password = document.getElementById("password").value.trim();

  // Clear previous error
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
    // SEND LOGIN REQUEST
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
    // HANDLE RESPONSE
    // ===============================
    if (!response.ok) {
      errorMsg.textContent = data.message || "Login failed";
      loginBtn.textContent = "Sign in";
      loginBtn.disabled = false;
      return;
    }

    // ===============================
    // SUCCESS: STORE USER + REDIRECT
    // ===============================
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.replace("home.html");

  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Server error. Try again later.";
    loginBtn.textContent = "Sign in";
    loginBtn.disabled = false;
  }
});

// ===============================
// ENTER KEY SUBMIT
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});

// ===============================
// BUTTON CLICK EFFECT
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
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (header) {
    header.style.boxShadow =
      window.scrollY > 20 ? "0 4px 10px rgba(0,0,0,0.2)" : "none";
  }
});