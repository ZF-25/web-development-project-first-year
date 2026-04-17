// ===============================
// AUTH UTILITIES
// ===============================
// This file handles:
// - Checking if user is logged in
// - Redirecting users
// - Logout functionality
// - Preventing back button issues


// ===============================
// HELPER FUNCTION
// ===============================
// Safely get user from localStorage
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}


// ===============================
// REQUIRE AUTH (PROTECT PAGE)
// ===============================
// Use this on pages that REQUIRE login

export function requireAuth() {
  const user = getUser();

  // If no user → redirect to login
  if (!user) {
    window.location.replace("login.html");
  }
}


// ===============================
// REDIRECT IF ALREADY LOGGED IN
// ===============================
// Use this on login & register pages
// Prevents logged-in users from going back

export function redirectIfLoggedIn() {
  const user = getUser();

  // If user exists → go to home
  if (user) {
    window.location.replace("home.html");
  }
}


// ===============================
// LOGOUT FUNCTION
// ===============================
// Clears user data and redirects

export function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Remove user from storage
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.replace("login.html");
    });
  }
}


// ===============================
// PREVENT BACK BUTTON ACCESS
// ===============================
// Stops user from going back after logout

export function preventBackAccess() {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}






// =============================
// HOW TO USE THESE FUNCTIONS 
// =============================


// PROTECTED PAGES (user MUST be logged in)
// Add this at the TOP of these files:
// - home.js
// - library.js
// - upload.js
// - settings.js
// - page.js
// - post.js

/*
import { requireAuth, setupLogout, preventBackAccess } from "./auth.js";

// Block access if not logged in
requireAuth();

// Enable logout button
setupLogout();

// Prevent back button after logout
preventBackAccess();
*/



// PUBLIC PAGES (login & register)
// Add this at the TOP of:
// - login.js
// - register.js

/*
import { redirectIfLoggedIn } from "./auth.js";

// Redirect to home if already logged in
redirectIfLoggedIn();
*/



// IMPORTANT NOTE:
// Your HTML MUST use type="module"
// Example:

// <script type="module" src="home.js"></script>