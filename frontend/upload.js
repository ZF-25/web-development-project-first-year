// ===============================
// IMPORT AUTH
// ===============================
import { requireAuth, getUser } from "./auth.js";

requireAuth();


// ===============================
const API_BASE = "http://localhost:3000";


// ===============================
// ELEMENTS
// ===============================
const category = document.getElementById("category-select");
const subcategory = document.getElementById("sub-category-select");
const topic = document.getElementById("topic-select");
const uploadBtn = document.querySelector("button");


// ===============================
// DATA (KEEP YOUR TEAMMATE LOGIC)
// ===============================
const subcategories = {
    natural: ["Physics", "Biology", "Chemistry", "Geology", "Astronomy"],
    formal: ["Mathematics", "Logic", "Statistics"],
    applied: ["Engineering & IT", "Environmental Science", "Medical & Health", "Agriculture"],
    social: ["Psychology", "Sociology", "Economics", "Political Science"],
    humanities: ["Philosophy", "History", "Religion", "Ethics", "Arts"],
    languages: ["English", "Finnish", "Chinese", "Spanish", "Russian"]
};

const topics = {
    "Physics": ["Optics", "Thermodynamics", "Friction", "Mechanics"],
    "Biology": ["Cell Biology", "Genetics", "Human Anatomy", "Ecology"],
    "Chemistry": ["Organic Chemistry", "Biochemistry", "Thermochemistry"],
    "Geology": ["Plate Tectonics", "Volcanology", "Paleontology", "Minerals & Rocks"],
    "Astronomy": ["Solar System", "Cosmology", "Black Holes", "Stars & Galaxies"],
    "Mathematics": ["Algebra", "Geometry", "Trigonometry", "Number Theory"],
    "Logic": ["Propositional Logic", "Deductive Reasoning","Inductive Reasoning"],
    "Statistics": ["Probability", "Data Analysis", "Distributions", "Hypothesis Testing"],
    "Engineering & IT": ["Programming", "Data Structures", "Cybersecurity", "Artifitial Intelligence"],
    "Environmental Science": ["Climate Change", "Sustainability", "Echosystems", "Pollution"],
    "Medical & Health": ["Human Physiology", "Diseases", "Nutrition", "Pharmacology"],
    "Agriculture": ["Crop Science", "Soil Science", "Agronomy"],
    "Psychology": ["Cognitive Psychology", "Behavior", "Emotions", "Mental Disorders"],
    "Sociology": ["Social Structures", "Culture", "Inequality", "Social Change"],
    "Economics": ["Microeconomics", "Markets", "Global Economy"],
    "Political Science": ["Government Systems", "Political Theories", "Public Policy", "Elections"],
    "Philosophy": ["Ethics", "Metaphysics", "Epistemology"],
    "History": ["Ancient History", "Medieval History", "Civilizations", "World Wars"],
    "Religion": ["World Religions", "Beliefs & Practices", "Sacred Texts"],
    "Ethics": ["Moral Theories", "Applied Ethics", "Justice", "Human Rights"],
    "Arts": ["Painting", "Music", "Literature"],
    "English": ["Grammar", "Vocabulary", "Speaking","Writing"],
    "Finnish": ["Basics", "Grammar", "Pronunciation", "Vocabulary"],
    "Chinese": ["Characters", "Grammar", "Tones", "Vocabulary"],
    "Spanish": ["Basics", "Grammar", "Pronunciation", "Vocabulary"],
    "Russian": ["Basics", "Grammar", "Pronunciation", "Vocabulary"]
};


// ===============================
// POPULATE SUBCATEGORIES
// ===============================
category.addEventListener("change", function() {
    const selected = this.value;

    subcategory.innerHTML = '<option value="">Sub-category</option>';

    if (subcategories[selected]) {
        subcategories[selected].forEach(item => {
            const option = document.createElement("option");
            option.textContent = item;
            option.value = item;
            subcategory.appendChild(option);
        });
    }

    topic.innerHTML = '<option value="">Topic</option>';
});


// ===============================
// POPULATE TOPICS
// ===============================
subcategory.addEventListener("change", function () {
    const selected = this.options[this.selectedIndex].text;

    topic.innerHTML = '<option value="">Topic</option>';

    if (topics[selected]) {
        topics[selected].forEach(t => {
            const option = document.createElement("option");
            option.value = t;
            option.textContent = t;
            topic.appendChild(option);
        });
    }
});


// ===============================
// UPLOAD POST (🔥 FIXED)
// ===============================
uploadBtn.addEventListener("click", async () => {

    const user = getUser();
    const user_id = user?.id;

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("posts").value.trim();

    const categoryValue = category.options[category.selectedIndex]?.text;
    const subcategoryValue = subcategory.options[subcategory.selectedIndex]?.text;
    const topicValue = topic.options[topic.selectedIndex]?.text;

    const references = document.getElementById("references").value.trim();

    // ===============================
    // VALIDATION
    // ===============================
    if (!user_id) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    if (!title || !content || !categoryValue || !subcategoryValue || !topicValue) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                content,
                category: categoryValue,
                subcategory: subcategoryValue,
                topic: topicValue,
                user_id
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Post uploaded successfully!");
            window.location.href = "home.html";
        } else {
            alert(data.error || "Upload failed");
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});


// ===============================
// LOGOUT FIX
// ===============================
const logoutLink = document.querySelector('.dropdown a[href="login.html"]');

if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("user");
        window.location.replace("login.html");
    });
}


// ===============================
// LOAD PROFILE IMAGE
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

loadUserProfileImages();