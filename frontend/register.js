// Handles user registration form:
// - Validates input fields
// - Sends data to backend API
// - Manages UI states and errors

// Get form elements
const form = document.getElementById("register-form");
const registerBtn = document.getElementById("register-btn");
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
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  errorMsg.textContent = "";

  
  // FORM VALIDATION

  if (!username || !email || !dob || !password || !confirmPassword) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorMsg.textContent = "Invalid email format";
    return;
  }

  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters";
    return;
  }

  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    errorMsg.textContent = "Password must include a capital letter and a number";
    return;
  }

  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match";
    return;
  }

  try {
    // Update button state during request
    registerBtn.textContent = "Creating...";
    registerBtn.disabled = true;

    
    // SEND DATA TO BACKEND API

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

    const data = await response.json();

    
    // HANDLE SERVER RESPONSE
    
    if (!response.ok) {
      errorMsg.textContent = data.message || "Registration failed";
      registerBtn.textContent = "Register";
      registerBtn.disabled = false;
      return;
    }

    // Store flag to show success message on login page
    localStorage.setItem("justRegistered", "true");

    // Redirect to login page after successful registration
    window.location.href = "login.html";

  } catch (error) {
    
    // HANDLE NETWORK / SERVER ERRORS
    
    console.error(error);
    errorMsg.textContent = "Server error. Try again later";
    registerBtn.textContent = "Register";
    registerBtn.disabled = false;
  }
});

// ENTER KEY SUBMIT
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});

// BUTTON CLICK EFFECT (visual feedback)
registerBtn.addEventListener("mousedown", () => {
  registerBtn.style.transform = "scale(0.95)";
});

registerBtn.addEventListener("mouseup", () => {
  registerBtn.style.transform = "scale(1)";
});