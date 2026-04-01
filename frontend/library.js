const subCategories = {
  "Natural Science": ["All","Physics", "Biology", "Chemistry", "Geology", "Astronomy"],
  "Formal Science": ["All","Mathematics","Logic", "Statistics"],
  "Applied Science": ["All","Engineering & IT","Environmental Science", "Medical & Health", "Agriculture"],
  "Social Science": ["All","Psychology", "Sociology", "Economics", "Political Science"],
  "Humanities": ["All", "Philosophy", "History", "Religion", "Ethics", "Arts"],
  "Languages": ["All","English","Finnish","Spanish", "Chinese"],
};

const articles = [
  {title:"Advancements in Physics", sub:"Physics", category:"Natural Science"},
  {title:"Python Beginner Guide", sub:"Engineering & IT", category:"Applied Science"},
  {title:"Smartphone Innovations", sub:"Engineering & IT", category:"Applied Science"},
  {title:"Cyber Safety Tips", sub:"Engineering & IT", category:"Applied Science"},
  {title:"AI in Healthcare", sub:"Biology", category:"Natural Science"},
  {title:"JavaScript Closures", sub:"Engineering & IT", category:"Applied Science"},
  {title:"Wireless Earbuds Review", sub:"Engineering & IT", category:"Applied Science"},
  {title:"Mars Rover Update", sub:"Chemistry", category:"Natural Science"},
  {title:"Mars Exploration", sub:"Chemistry", category:"Natural Science"}
];

let selectedCategory = "Natural Science";
let selectedSub = "All";

/* INIT */
window.onload = () => {
  renderCategories();
  renderSubCategories();
  renderArticles();
};

/* CATEGORY BUTTONS */
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

      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      renderSubCategories();
      renderArticles();
    };

    container.appendChild(btn);
  });
}

/* SUB CATEGORY */
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

      document.querySelectorAll(".sub-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      renderArticles();
    };

    container.appendChild(btn);
  });
}

/* ARTICLES */
function renderArticles(){
  const container = document.getElementById("articles");
  container.innerHTML = "";

  const filtered = articles.filter(a => {
    if(selectedSub === "All") return a.category === selectedCategory;
    return a.category === selectedCategory && a.sub === selectedSub;
  });

  filtered.forEach(a => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card article-card p-3 shadow-sm">
        <span class="badge bg-info mb-2">${a.sub}</span>
        <h6>${a.title}</h6>
        <p class="text-muted small">Short description about the article...</p>
      </div>
    `;

    container.appendChild(col);
  });
}