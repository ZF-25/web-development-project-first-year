const form = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = document.getElementById("login-input").value.trim();
  const password = document.getElementById("password").value.trim();

  errorMsg.textContent = "";

  //VALIDATION
  if (!identifier || !password) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  try {
    //LOADING STATE
    loginBtn.textContent = "Signing in...";
    loginBtn.disabled = true;

    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ identifier, password })
    });

    const data = await response.json();

    //ERROR HANDLING
    if (!response.ok) {
      errorMsg.textContent = data.message || "Login failed";
      loginBtn.textContent = "Sign in";
      loginBtn.disabled = false;
      return;
    }

    //SUCCESS
    localStorage.setItem("user", JSON.stringify(data.user));

    // Smart redirect (category support)
    const category = localStorage.getItem("category");

    if (category) {
      window.location.href = `home.html?category=${encodeURIComponent(category)}`;
    } else {
      window.location.href = "landingPage.html";
    }

  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Server error. Try again later.";
    loginBtn.textContent = "Sign in";
    loginBtn.disabled = false;
  }
});


//ENTER KEY SUPPORT
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});


//BUTTON CLICK EFFECT
loginBtn.addEventListener("mousedown", () => {
  loginBtn.style.transform = "scale(0.95)";
});

loginBtn.addEventListener("mouseup", () => {
  loginBtn.style.transform = "scale(1)";
});


//HEADER SHADOW
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (header) {
    header.style.boxShadow =
      window.scrollY > 20 ? "0 4px 10px rgba(0,0,0,0.2)" : "none";
  }
});