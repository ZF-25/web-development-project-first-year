// ===============================
// AUTH UTILITIES
// ===============================

/**
 * Gets the saved user from localStorage.
 *
 * What this does:
 * - Looks for a value stored under the key "user".
 * - If nothing is saved, or the value is literally the text "undefined",
 *   then it returns null (meaning: no user is logged in).
 * - If something IS saved, it tries to turn the JSON string into a real object.
 * - If that fails (maybe the data is broken), it returns null.
 *
 * Why this matters:
 * - This function is used everywhere to check if the user is logged in.
 */
function getUser() {
  // Get the raw string value stored under the "user" key
  const data = localStorage.getItem("user");

  // If no user data exists, or it's the string "undefined", treat as logged out
  if (!data || data === "undefined") return null;

  try {
    // Convert the JSON string back into a JavaScript object
    return JSON.parse(data);
  } catch {
   // If JSON is invalid or corrupted, return null instead of crashing 
    return null;
  }
}

// ===============================
// REQUIRE AUTH
// ===============================

/**
 * Makes sure the user is logged in before viewing a page.
 *
 * How it works:
 * - Calls getUser() to check if a user exists.
 * - If no user is found, the page immediately redirects to login.html.
 *
 * Why this is used:
 * - You put this at the top of pages that should only be seen by logged‑in users.
 * - Example: home.html, dashboard.html, profile.html, etc.
 */
export function requireAuth() {
  const user = getUser();

  // If there is no logged-in user, force navigation to the login page
  if (!user) {
    // window.location.replace() changes the current page and
    // removes it from the session history, so the user can't go "Back" to it.
    window.location.replace("login.html");
  }
}

// ===============================
// REDIRECT IF LOGGED IN
// ===============================

/**
 * Redirects the user away from pages like login/register if they are already logged in.
 *
 * How it works:
 * - Calls getUser() to check if a user exists in localStorage.
 * - If a user is found, it redirects to "home.html".
 * - Typically used on login or signup pages to avoid showing them to logged-in users.
 */
export function redirectIfLoggedIn() {
  const user = getUser();

  if (user) {
    window.location.replace("home.html");
  }
}

// ===============================
// LOGOUT
// ===============================

/**
 * Makes all elements with class "logout-btn" log the user out.
 *
 * What happens when a logout button is clicked:
 * - Prevents the default link behavior (so the page doesn’t jump).
 * - Removes the "user" data from localStorage.
 * - Redirects the user back to login.html.
 *
 * Why this is needed:
 * - You may have multiple logout buttons on different pages.
 * - This function attaches the logout behavior to all of them.
 */
export function setupLogout() {
  // Select all elements that should trigger a logout when clicked
  const logoutBtns = document.querySelectorAll(".logout-btn");

  // Attach a click handler to each logout button
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Prevent default link behavior (e.g., navigating to href)
      e.preventDefault(); 

      // Remove the stored user data, effectively logging the user out
      localStorage.removeItem("user");

      // Redirect the user back to the login page
      window.location.replace("login.html");
    });
  });
}
// ===============================
// PREVENT BACK BUTTON ACCESS
// ===============================

/**
 * Stops users from returning to protected pages using the Back button.
 *
 * Why this is needed:
 * - Browsers sometimes load pages from a special memory called "bfcache".
 * - This means the page might appear even if the user is logged out.
 *
 * How this fixes it:
 * - The "pageshow" event fires when a page is shown.
 * - If event.persisted === true, it means the page came from cache.
 * - So we reload the page, forcing all auth checks to run again.
 */
export function preventBackAccess() {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}

// ===============================
// EXPORT
// ===============================

/**
 * Export getUser so other files can import and use it.
 */
export { getUser };