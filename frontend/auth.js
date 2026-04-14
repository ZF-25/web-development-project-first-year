// ===============================
// AUTH UTILITIES
// ===============================
// Handles:
// - Protecting private pages
// - Redirecting logged-in users
// - Logout functionality
// - Back button prevention


// ===============================
// REQUIRE AUTH (PROTECT PAGE)
// ===============================
// Redirects to login if user is not logged in
export function requireAuth() {
  const user = localStorage.getItem("user");

  if (!user) {
    window.location.replace("login.html");
  }
}


// ===============================
// REDIRECT IF ALREADY LOGGED IN
// ===============================
// Prevents logged-in users from accessing login/register pages
export function redirectIfLoggedIn() {
  const user = localStorage.getItem("user");

  if (user) {
    window.location.replace("home.html");
  }
}


// ===============================
// LOGOUT FUNCTION
// ===============================
// Clears user session and redirects to login
export function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.replace("login.html");
    });
  }
}


// ===============================
// PREVENT BACK BUTTON ACCESS
// ===============================
// Prevents returning to protected pages after logout
export function preventBackAccess() {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}






//Before Deployment
/* 
// ===============================
// IMPORT AUTH FUNCTIONS
// ===============================
import { requireAuth, setupLogout, preventBackAccess } from "./auth.js";


// ===============================
// PROTECT PAGE
// ===============================
// Block access if user is not logged in
requireAuth();


// ===============================
// LOGOUT SETUP
// ===============================
// Enable logout button if present
setupLogout();


// ===============================
// PREVENT BACK BUTTON ACCESS
// ===============================
// Prevent user from returning after logout
preventBackAccess();



//e.g, <script type="module" src="home.js"></script>

home.js
library.js
upload.js
settings.js
page.js
post.js
*/