// ===============================
// BLOCK IF USER ALREADY LOGGED IN
// ===============================
// Prevent logged-in users from accessing register page
const user = localStorage.getItem("user");

if (user) {
  window.location.replace("home.html");
}


// ===============================
// GET FORM ELEMENTS
// ===============================
const form = document.getElementById("register-form");
const registerBtn = document.getElementById("register-btn");
const errorMsg = document.getElementById("error-msg");


// ===============================
// PASSWORD VISIBILITY TOGGLE
// ===============================
// Allows user to show/hide password fields
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);

    // Toggle input type
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
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  // Clear previous error message
  errorMsg.textContent = "";


  // ===============================
  // FORM VALIDATION
  // ===============================

  // Check if all fields are filled
  if (!username || !email || !dob || !password || !confirmPassword) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorMsg.textContent = "Invalid email format";
    return;
  }

  // Check password length
  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters";
    return;
  }

  // Check password strength (at least 1 capital letter and 1 number)
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    errorMsg.textContent = "Password must include a capital letter and a number";
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
    // Show loading state on button
    registerBtn.textContent = "Creating...";
    registerBtn.disabled = true;

    // Make POST request to backend API
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

    // Convert response to JSON
    const data = await response.json();


    // ===============================
    // HANDLE SERVER RESPONSE
    // ===============================
    if (!response.ok) {
      // Show backend error message
      errorMsg.textContent = data.message || "Registration failed";

      // Reset button state
      registerBtn.textContent = "Register";
      registerBtn.disabled = false;
      return;
    }


    // ===============================
    // SUCCESS HANDLING
    // ===============================

    // Store flag to show success message on login page
    localStorage.setItem("justRegistered", "true");

    // Redirect to login page (replace prevents back navigation)
    window.location.replace("login.html");

  } catch (error) {
    // ===============================
    // HANDLE NETWORK / SERVER ERRORS
    // ===============================
    console.error(error);

    errorMsg.textContent = "Server error. Try again later.";

    // Reset button state
    registerBtn.textContent = "Register";
    registerBtn.disabled = false;
  }
});


// ===============================
// ENTER KEY SUBMIT SUPPORT
// ===============================
// Allows pressing Enter to submit form
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});


// ===============================
// BUTTON CLICK EFFECT (UI FEEDBACK)
// ===============================
registerBtn.addEventListener("mousedown", () => {
  registerBtn.style.transform = "scale(0.95)";
});

registerBtn.addEventListener("mouseup", () => {
  registerBtn.style.transform = "scale(1)";
});