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