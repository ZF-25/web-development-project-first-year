// ===============================
// AUTH UTILITIES
// ===============================
// This file contains helper functions related to user authentication.
// It uses localStorage to store and check user login state.


// ===============================
// HELPER FUNCTION
// ===============================
function getUser() {
  // Try to get the "user" data from the browser's localStorage
  const data = localStorage.getItem("user");

  // If there is no data OR it is literally the string "undefined",
  // return null (meaning: no logged-in user)
  if (!data || data === "undefined") return null;

  try {
    // Convert the stored JSON string back into a JavaScript object
    return JSON.parse(data);
  } catch {
    // If parsing fails (bad data), return null to avoid crashing
    return null;
  }
}


// ===============================
// REQUIRE AUTH (PROTECT PAGE)
// ===============================
export function requireAuth() {
  // Get the currently logged-in user
  const user = getUser();

  // If no user is found, redirect to login page
  if (!user) {
    // replace() prevents the user from going back using browser history
    window.location.replace("login.html");
  }
}


// ===============================
// REDIRECT IF LOGGED IN
// ===============================
export function redirectIfLoggedIn() {
  // Get the current user
  const user = getUser();

  // If user exists, they are already logged in
  if (user) {
    // Send them to home page instead of login page
    window.location.replace("home.html");
  }
}


// ===============================
// LOGOUT FUNCTION
// ===============================
export function setupLogout() {
  // Find the logout button in the HTML (by its ID)
  const logoutBtn = document.getElementById("logout-btn");

  // Only run if the button actually exists on the page
  if (logoutBtn) {
    // Add a click event listener to the button
    logoutBtn.addEventListener("click", () => {
      // Remove user data from localStorage (log the user out)
      localStorage.removeItem("user");

      // Redirect to login page after logout
      window.location.replace("login.html");
    });
  }
}


// ===============================
// PREVENT BACK BUTTON ACCESS
// ===============================
export function preventBackAccess() {
  // This event fires when the page is loaded from browser cache
  window.addEventListener("pageshow", (event) => {

    // event.persisted is true if page is loaded from cache (back button)
    if (event.persisted) {
      // Reload the page to force fresh auth check
      window.location.reload();
    }
  });
}


// ===============================
// OPTIONAL: EXPORT getUser
// ===============================
// This allows other files to import getUser()
// Example use: showing username in navbar
export { getUser };