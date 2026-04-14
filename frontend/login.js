// Handles user login functionality:
// - Validates input fields
// - Sends login request to backend
// - Manages UI states and redirects

// Get form elements
const form = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const errorMsg = document.getElementById("error-msg");



// PASSWORD TOGGLE

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


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get input values
  const identifier = document.getElementById("login-input").value.trim();
  const password = document.getElementById("password").value.trim();

  // Clear previous error
  errorMsg.textContent = "";

  
  // FORM VALIDATION
  
  if (!identifier || !password) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  try {
    
    // LOADING STATE
  
    loginBtn.textContent = "Signing in...";
    loginBtn.disabled = true;

    
    // SEND LOGIN REQUEST TO BACKEND
    
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ identifier, password })
    });

    const data = await response.json();

    
    // HANDLE SERVER RESPONSE
    
    if (!response.ok) {
      errorMsg.textContent = data.message || "Login failed";
      loginBtn.textContent = "Sign in";
      loginBtn.disabled = false;
      return;
    }

    
    // SUCCESS: STORE USER + REDIRECT
    
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to home page after login
    window.location.href = "home.html";

  } catch (error) {
    
    // HANDLE NETWORK / SERVER ERRORS
    
    console.error(error);
    errorMsg.textContent = "Server error. Try again later.";
    loginBtn.textContent = "Sign in";
    loginBtn.disabled = false;
  }
});



// ENTER KEY SUBMIT SUPPORT

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});



// BUTTON CLICK EFFECT (UI FEEDBACK)

loginBtn.addEventListener("mousedown", () => {
  loginBtn.style.transform = "scale(0.95)";
});

loginBtn.addEventListener("mouseup", () => {
  loginBtn.style.transform = "scale(1)";
});



// HEADER SHADOW ON SCROLL

const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (header) {
    header.style.boxShadow =
      window.scrollY > 20 ? "0 4px 10px rgba(0,0,0,0.2)" : "none";
  }
});