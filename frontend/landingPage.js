// ===============================
// IMPORT AUTH FUNCTION
// ===============================
import { redirectIfLoggedIn } from "./auth.js";

redirectIfLoggedIn();


// ===============================
// PAGE LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // GET USER FROM LOCAL STORAGE
  // ===============================
  const user = localStorage.getItem("user");


  // ===============================
  // CATEGORY CLICK HANDLER
  // ===============================
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach(card => {
    card.addEventListener("click", () => {

      const category = card.textContent.trim();

      // Save selected category
      localStorage.setItem("category", category);

      // If user is logged in → go to home
      if (user) {
        window.location.href = "home.html";
      } 
      // If not logged in → go to login
      else {
        window.location.href = "login.html";
      }
    });
  });


  // ===============================
  // NAVBAR USER STATE
  // ===============================
  const navActions = document.getElementById("nav-actions");

  if (user && navActions) {
    navActions.innerHTML = `
      <a href="home.html" class="btn btn-outline-dark me-2">Home</a>
      <button class="btn btn-dark" id="logout-btn">Logout</button>
    `;

    // Logout button
    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.replace("login.html");
    });
  }

});