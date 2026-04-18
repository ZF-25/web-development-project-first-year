// ===============================
// IMPORT AUTH
// ===============================
import { requireAuth, getUser } from "./auth.js";

requireAuth();

const API_BASE = "http://localhost:3000";


// ===============================
// DATA (KEEP TEAMMATE STRUCTURE)
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
window.onload = () => {
  renderCategories();
  renderSubCategories();
  loadArticles();
  loadUserProfileImages();
};


// ===============================
// CATEGORY BUTTONS
// ===============================
function renderCategories(){
  const container = document.getElementById("categories");
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
// SUBCATEGORY
// ===============================
function renderSubCategories(){
  const container = document.getElementById("subCategories");
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
// LOAD ARTICLES (🔥 NOW REAL DATA)
// ===============================
async function loadArticles(){
  const container = document.getElementById("articles");
  container.innerHTML = `<p>Loading...</p>`;

  try {
    let topicToFetch = selectedSub === "All" ? null : selectedSub;

    let posts = [];

    if (topicToFetch) {
      const res = await fetch(`${API_BASE}/api/posts/topic/${topicToFetch}`);
      posts = await res.json();
    } else {
      // fallback: just show nothing or could fetch multiple topics
      container.innerHTML = `<p>Select a subcategory</p>`;
      return;
    }

    if (!posts.length) {
      container.innerHTML = `<p>No posts found</p>`;
      return;
    }

    container.innerHTML = "";

    posts.forEach(post => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";

      col.innerHTML = `
        <div class="card article-card p-3 shadow-sm">
          <span class="badge bg-info mb-2">${selectedSub}</span>
          <h6>${post.title}</h6>
          <p class="text-muted small">${post.content.substring(0, 80)}...</p>
          <a href="post.html?id=${post.id}">View</a>
        </div>
      `;

      container.appendChild(col);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>Error loading posts</p>`;
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
        const res = await fetch(`${API_BASE}/api/users/${user_id}`);
        const userData = await res.json();

        const imagePath = userData.profile_pic
          ? `${API_BASE}/uploads/${userData.profile_pic}?t=${Date.now()}`
          : "./images/profilepic.jpg";

        document.querySelectorAll(".profile-img").forEach(img => {
            img.src = imagePath;
        });

    } catch (err) {
        console.error(err);
    }
}