const form = document.getElementById("register-form");
const registerBtn = document.getElementById("register-btn");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  errorMsg.textContent = "";

  //VALIDATION
  if (!username || !email || !dob || !password || !confirmPassword) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorMsg.textContent = "Invalid email format";
    return;
  }

  // Password rules
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
    //LOADING STATE
    registerBtn.textContent = "Creating...";
    registerBtn.disabled = true;

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

    //ERROR HANDLING
    if (!response.ok) {
      errorMsg.textContent = data.message || "Registration failed";
      registerBtn.textContent = "Register";
      registerBtn.disabled = false;
      return;
    }

    //SUCCESS
    localStorage.setItem("justRegistered", "true");
    window.location.href = "login.html";

  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Server error. Try again later.";
    registerBtn.textContent = "Register";
    registerBtn.disabled = false;
  }
});


//ENTER KEY SUPPORT
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});


//BUTTON CLICK EFFECT
registerBtn.addEventListener("mousedown", () => {
  registerBtn.style.transform = "scale(0.95)";
});

registerBtn.addEventListener("mouseup", () => {
  registerBtn.style.transform = "scale(1)";
});