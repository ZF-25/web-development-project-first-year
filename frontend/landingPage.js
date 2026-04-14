document.addEventListener("DOMContentLoaded", () => {

  // NAVBAR SHADOW
  const navbar = document.querySelector(".navbar");

  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.style.boxShadow =
        window.scrollY > 20 ? "0 4px 10px rgba(0,0,0,0.2)" : "none";
    });
  }

  // SCROLL ANIMATIONS
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
      el.classList.add("hidden");
      observer.observe(el);
    });
  }

  // CATEGORY CLICK (FIXED)
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach(card => {
    card.addEventListener("click", () => {
      const category = card.textContent.trim();

      localStorage.setItem("category", category);

      const user = localStorage.getItem("user");

      if (user) {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = `login.html?category=${encodeURIComponent(category)}`;
      }
    });
  });

  // NAVBAR USER STATE 
  const user = localStorage.getItem("user");
  const navActions = document.getElementById("nav-actions");

  if (user && navActions) {
    navActions.innerHTML = `
      <a href="dashboard.html" class="btn btn-outline-dark me-2">Dashboard</a>
      <button class="btn btn-dark" id="logout-btn">Logout</button>
    `;

    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.reload();
    });
  }

});