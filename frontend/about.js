// FADE-IN ON LOAD
window.addEventListener("load", () => {
  const card = document.querySelector(".about-card");

  if (card) {
    card.style.opacity = "0";
    card.style.transform = "translateY(15px)";

    setTimeout(() => {
      card.style.transition = "all 0.5s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 100);
  }
});


// HEADER SHADOW ON SCROLL 
const header = document.querySelector(".custom-header");

window.addEventListener("scroll", () => {
  if (header) {
    header.style.boxShadow =
      window.scrollY > 10 ? "0 4px 10px rgba(0,0,0,0.2)" : "none";
  }
});


// LINK CLICK FEEDBACK 
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    link.style.opacity = "0.6";

    setTimeout(() => {
      link.style.opacity = "1";
    }, 150);
  });
});


// EMAIL CLICK ALERT 
const emailLink = document.querySelector('a[href^="mailto:"]');

if (emailLink) {
  emailLink.addEventListener("click", () => {
    console.log("Opening email client...");
  });
}


// TEAM LIST HOVER EFFECT
document.querySelectorAll(".about-card li").forEach(member => {
  member.addEventListener("mouseenter", () => {
    member.style.transform = "translateX(4px)";
    member.style.transition = "0.2s";
  });

  member.addEventListener("mouseleave", () => {
    member.style.transform = "translateX(0)";
  });
});