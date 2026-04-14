document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // GET USER SESSION
  // ===============================
  // Check if user is logged in (stored in localStorage)
  const user = localStorage.getItem("user");


  // ===============================
  // NAVBAR SHADOW EFFECT
  // ===============================
  // Adds shadow to navbar when scrolling down
  const navbar = document.querySelector(".navbar");

  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.style.boxShadow =
        window.scrollY > 20 ? "0 4px 10px rgba(0,0,0,0.2)" : "none";
    });
  }


  // ===============================
  // SCROLL ANIMATIONS
  // ===============================
  // Animate elements when they come into view
  if ('IntersectionObserver' in window) {

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.2 });

    const animatedElements = document.querySelectorAll(
      ".feature-card, .category-card, .cta"
    );

    animatedElements.forEach(el => {
      el.classList.add("hidden"); // start hidden
      observer.observe(el);       // observe for visibility
    });
  }


  // ===============================
  // CATEGORY CLICK HANDLER
  // ===============================
  // When user clicks a category:
  // - Save category in localStorage
  // - Redirect based on login state
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach(card => {
    card.addEventListener("click", () => {
      const category = card.textContent.trim();

      // Save selected category
      localStorage.setItem("category", category);

      // Redirect based on login status
      if (user) {
        window.location.href = "home.html";
      } else {
        window.location.href = `login.html?category=${encodeURIComponent(category)}`;
      }
    });
  });


  // ===============================
  // NAVBAR USER STATE
  // ===============================
  // Change navbar buttons if user is logged in
  const navActions = document.getElementById("nav-actions");

  if (user && navActions) {
    navActions.innerHTML = `
      <a href="home.html" class="btn btn-outline-dark me-2">Home</a>
      <button class="btn btn-dark" id="logout-btn">Logout</button>
    `;

    // ===============================
    // LOGOUT FUNCTIONALITY
    // ===============================
    // Remove user session and redirect to login page
    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.replace("login.html");
    });
  }

});