document.addEventListener("DOMContentLoaded", () => {

  //NAVBAR SHADOW
  const navbar = document.querySelector(".navbar");

  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.style.boxShadow =
        window.scrollY > 20 ? "0 4px 10px rgba(0,0,0,0.2)" : "none";
    });
  }


  //SCROLL ANIMATIONS
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


  //CATEGORY CLICK
  const categoryCards = document.querySelectorAll(".category-card");

  if (categoryCards.length > 0) {
    categoryCards.forEach(card => {
      card.addEventListener("click", () => {
        const category = card.textContent.trim();

        // Save selected category
        localStorage.setItem("category", category);

        // Redirect to login with query param
        window.location.href = `login.html?category=${encodeURIComponent(category)}`;
      });
    });
  }

});