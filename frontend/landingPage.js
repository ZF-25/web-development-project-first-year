// ===============================
// IMPORT AUTH FUNCTIONS
// ===============================
// We import helper functions from auth.js
// - redirectIfLoggedIn → prevents logged-in users from accessing this page
// - getUser → safely retrieves user data from localStorage
import { redirectIfLoggedIn, getUser } from "./auth.js";

// If user is already logged in → send them away (e.g., to home page)
// This is usually used on public pages like landing/login/register
redirectIfLoggedIn();


// ===============================
// PAGE LOAD
// ===============================
// Wait until the HTML is fully loaded before running JS
document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // GET USER (SAFE)
  // ===============================
  // Retrieve user from localStorage (could be null if not logged in)
  const user = getUser();


  // ===============================
  // CATEGORY CLICK HANDLER
  // ===============================
  // Select all category cards on the page
  const categoryCards = document.querySelectorAll(".category-card");

  // Loop through each card and add a click event
  categoryCards.forEach(card => {
    card.addEventListener("click", () => {

      // Get the text inside the card (category name)
      const category = card.textContent.trim();

      // Save selected category in localStorage
      // This allows the next page (home.html) to know what user selected
      localStorage.setItem("category", category);

      // Redirect based on login state
      if (user) {
        // If logged in → go to home page
        window.location.href = "home.html";
      } else {
        // If NOT logged in → force login first
        window.location.href = "login.html";
      }
    });
  });


  // ===============================
  // NAVBAR USER STATE
  // ===============================
  // Get navbar container where buttons will be injected
  const navActions = document.getElementById("nav-actions");

  // If user is logged in AND navbar exists
  if (user && navActions) {

    // Dynamically insert Home + Logout buttons
    navActions.innerHTML = `
      <a href="home.html" class="btn btn-outline-dark me-2">Home</a>
      <button class="btn btn-dark" id="logout-btn">Logout</button>
    `;

    // ===============================
    // LOGOUT HANDLER
    // ===============================
    // When logout button is clicked:
    document.getElementById("logout-btn").addEventListener("click", () => {

      // Remove user data from localStorage → logs user out
      localStorage.removeItem("user");

      // Redirect to login page
      // replace() prevents user from going back with browser back button
      window.location.replace("login.html");
    });
  }

});