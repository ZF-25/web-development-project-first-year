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


const category = document.getElementById("category-select");
const subcategory = document.getElementById("sub-category-select");
const topic = document.getElementById("topic-select");
const uploadBtn = document.querySelector("button");

// Populate subcategories
category.addEventListener("change", function() {
    const selected = this.value;

    subcategory.innerHTML = '<option value="">Sub-category</option>';

    if(subcategories[selected]){
        subcategories[selected].forEach(function(item){
            const option = document.createElement("option");
            option.textContent = item;
            option.value = item;
            subcategory.appendChild(option);
        });
    }
});

// Populate topics
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

// HANDLE UPLOAD
uploadBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const content = document.getElementById("posts").value;
    const categoryValue = category.options[category.selectedIndex].text;
    const subcategoryValue = subcategory.options[subcategory.selectedIndex].text;

    const topicValue = topic.options[topic.selectedIndex]?.text;
    const references = document.getElementById("references").value;

    const user = JSON.parse(localStorage.getItem("user"));
    //const user_id = user?.id;
    const user_id = 1;


    // ✅ VALIDATION (IMPORTANT)
    if (!user_id) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    if (!title || !content || !categoryValue || !subcategoryValue || !topicValue) {
        alert("Please fill all fields including topic");
        return;
    }

    console.log("Uploading post:", {
        title,
        categoryValue,
        subcategoryValue,
        topicValue
    });

    try {
        const response = await fetch("http://localhost:3000/api/posts", {
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
                references,
                user_id: parseInt(user_id)
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Post uploaded successfully!");
            window.location.reload();
        } else {
            alert(data.error || "Upload failed");
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});



// SETTINGS PAGE - PROFILE IMAGE

const user = JSON.parse(localStorage.getItem("user"));
const user_id = user?.id;


async function loadUserProfileImages() {
    try {
        const res = await fetch(`http://localhost:3000/api/users/${user_id}`);
        const user = await res.json();

        const imagePath = user.profile_pic
          ? `http://localhost:3000/uploads/${user.profile_pic}?t=${Date.now()}`
          : "./images/profilepic.jpg";

        // Update ALL profile images on page
        document.querySelectorAll(".profile-img").forEach(img => {
            img.src = imagePath;
        });

    } catch (err) {
        console.error(err);
    }
}

loadUserProfileImages();