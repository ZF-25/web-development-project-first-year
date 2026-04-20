// ===============================
// IMPORT AUTH
// ===============================
import { requireAuth, getUser, setupLogout } from "./auth.js";

requireAuth();
setupLogout();

// ===============================
// CATEGORY DATA
// ===============================
const subCategories = {
  "Natural Science": ["All","Physics", "Biology", "Chemistry", "Geology", "Astronomy"],
  "Formal Science": ["All","Mathematics","Logic", "Statistics"],
  "Applied Science": ["All","Engineering & IT","Environmental Science", "Medical & Health", "Agriculture"],
  "Social Science": ["All","Psychology", "Sociology", "Economics", "Political Science"],
  "Humanities": ["All", "Philosophy", "History", "Religion", "Ethics", "Arts"],
  "Languages": ["All","English","Finnish","Spanish", "Chinese"],
};

let selectedCategory = "Natural Science";
let selectedSub = "All";

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderSubCategories();
  loadArticles();
  loadUserProfileImages();
});

// ===============================
// CATEGORY BUTTONS
// ===============================
function renderCategories(){
  const container = document.getElementById("categories");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(subCategories).forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.innerText = cat;

    if(cat === selectedCategory) btn.classList.add("active");

    btn.onclick = () => {
      selectedCategory = cat;
      selectedSub = "All";

      renderCategories();
      renderSubCategories();
      loadArticles();
    };

    container.appendChild(btn);
  });
}

// ===============================
// SUBCATEGORY BUTTONS
// ===============================
function renderSubCategories(){
  const container = document.getElementById("subCategories");
  if (!container) return;

  container.innerHTML = "";

  subCategories[selectedCategory].forEach(sub => {
    const btn = document.createElement("button");
    btn.className = "sub-btn";
    btn.innerText = sub;

    if(sub === selectedSub) btn.classList.add("active");

    btn.onclick = () => {
      selectedSub = sub;
      renderSubCategories();
      loadArticles();
    };

    container.appendChild(btn);
  });
}

// ===============================
// LOAD FAVORITE POSTS
// ===============================
async function loadArticles(){
  const container = document.getElementById("articles");
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border"></div>
      <p class="mt-2">Loading library...</p>
    </div>
  `;

  const user = getUser();
  const user_id = user?.id;

  if (!user_id) {
    container.innerHTML = `<p class="text-center">Please login</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/favorites/${user_id}`);
    if (!res.ok) throw new Error("Failed to fetch favorites");

    let posts = await res.json();

    // ================= FILTER =================
    posts = posts.filter(p =>
      p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );

    if (selectedSub !== "All") {
      posts = posts.filter(p =>
        p.topic?.toLowerCase() === selectedSub.toLowerCase() ||
        p.subcategory?.toLowerCase() === selectedSub.toLowerCase()
      );
    }

    if (!posts.length) {
      container.innerHTML = `
        <div class="text-center py-4">
          <h5>No saved posts</h5>
          <p class="text-muted">Start adding posts to your library ❤️</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    posts.forEach(post => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";

      const safeContent = post.content
        ? post.content.substring(0, 80) + "..."
        : "No content";

      col.innerHTML = `
        <div class="card article-card p-3 shadow-sm h-100">
          <span class="badge bg-danger mb-2">Saved</span>
          <h6>${post.title}</h6>
          <p class="text-muted small">${safeContent}</p>
          <a href="/post.html?id=${post.id}" class="mt-auto">View</a>
        </div>
      `;

      container.appendChild(col);
    });

  } catch (err) {
    console.error(err);

    container.innerHTML = `
      <div class="text-center text-danger py-4">
        <h5>Error loading library</h5>
        <p>Please try again later</p>
      </div>
    `;
  }
}

// ===============================
// PROFILE IMAGE
// ===============================
async function loadUserProfileImages() {
  const user = getUser();
  const user_id = user?.id;

  if (!user_id) return;

  try {
    const res = await fetch(`/api/users/${user_id}`);
    const userData = await res.json();

    const imagePath = userData.profile_pic
      ? `/uploads/${userData.profile_pic}?t=${Date.now()}`
      : "/images/profilepic.jpg";

    document.querySelectorAll(".profile-img").forEach(img => {
      img.src = imagePath;

      img.onerror = () => {
        img.src = "/images/profilepic.jpg";
      };
    });

  } catch (err) {
    console.error("Profile image error:", err);
  }
}