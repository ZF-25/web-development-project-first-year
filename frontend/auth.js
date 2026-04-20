// ===============================
// AUTH UTILITIES
// ===============================

/**
 * Get the currently logged-in user from localStorage.
 *
 * What it does:
 * - Reads the value stored under the key "user".
 * - If nothing is stored, or it's "undefined" or "null" as a string,
 *   it returns null (meaning: no user is logged in).
 * - If something is stored, it tries to convert the JSON string
 *   back into a JavaScript object.
 * - If that conversion fails (broken JSON), it returns null instead of crashing.
 *
 * Why this is important:
 * - This function is the single source of truth for "who is logged in".
 * - All other auth functions use this to check login status.
 */
function getUser() {
  // Read the raw string from localStorage
  const data = localStorage.getItem("user");

  // Safer checks:
  // - !data → nothing stored
  // - data === "undefined" → someone stored the literal string "undefined"
  // - data === "null" → someone stored the literal string "null"
  if (!data || data === "undefined" || data === "null") return null;

  try {
    // Try to parse the JSON string into a JavaScript object
    return JSON.parse(data);
  } catch {
    // If parsing fails (invalid JSON), treat it as no user
    return null;
  }
}

// ===============================
// REQUIRE AUTH
// ===============================

/**
 * Protects pages that should only be visible to logged-in users.
 *
 * How it works:
 * - Calls getUser() to see if a user is stored.
 * - If no user is found, it redirects to /login.html.
 *
 * Why the path starts with "/":
 * - Using an absolute path ("/login.html") makes sure it works
 *   no matter which folder the current page is in.
 * - This is especially important when you deploy your site.
 */
export function requireAuth() {
  const user = getUser();

  // If there is no logged-in user, send them to the login page
  if (!user) {
    window.location.replace("/login.html");
  }
}

// ===============================
// REDIRECT IF LOGGED IN
// ===============================

/**
 * Redirects logged-in users away from pages like login or register.
 *
 * How it works:
 * - Calls getUser() to check if a user exists.
 * - If a user is found, it redirects to /home.html.
 *
 * Where to use this:
 * - On login.html and register.html, so logged-in users
 *   don’t see those pages again.
 */
export function redirectIfLoggedIn() {
  const user = getUser();

  // If a user is already logged in, send them to the home page
  if (user) {
    window.location.replace("/home.html");
  }
}

// ===============================
// LOGOUT
// ===============================

/**
 * Sets up logout behavior for all elements with the class "logout-btn".
 *
 * What it does:
 * - Finds all elements with class "logout-btn".
 * - Adds a click event listener to each one.
 * - When clicked:
 *   - Prevents the default link behavior.
 *   - Removes "user" from localStorage (logs the user out).
 *   - Redirects to /login.html.
 *
 * Why this is useful:
 * - You can have multiple logout buttons on different pages.
 * - Calling setupLogout() once will make all of them work.
 */

export function setupLogout() {
  // Get all elements that should act as logout buttons
  const logoutBtns = document.querySelectorAll(".logout-btn");

  // Add a click handler to each logout button
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Stop the default action (like following a link)
      e.preventDefault();

      // Remove the stored user data → user is now logged out
      localStorage.removeItem("user");

      // Redirect to the login page using an absolute path
      window.location.replace("/login.html");
    });
  });
}

// ===============================
// PREVENT BACK BUTTON ACCESS
// ===============================

/**
 * Helps prevent users from accessing protected pages via the Back button
 * after they have logged out or been redirected.
 *
 * How it works:
 * - Listens for the "pageshow" event, which fires when a page becomes visible.
 * - event.persisted is true when the page is loaded from the browser's
 *   back/forward cache (bfcache), not from the server.
 * - If the page comes from cache, we force a reload.
 * - Reloading makes your auth checks (like requireAuth) run again,
 *   so logged-out users can’t see old protected pages.
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
 * Export getUser so other modules (like login.js, register.js, home.js)
 * can import it and check who is logged in.
 */
export { getUser };