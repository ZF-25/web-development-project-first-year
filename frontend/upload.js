const subcategories = {
    natural: ["Physics", "Biology", "Chemistry", "Geology", "Astronomy"],
    formal: ["Mathematics", "Logic", "Statistics"],
    applied: ["Engineering & IT", "Environmental Science", "Medical & Health", "Agriculture"],
    social: ["Psychology", "Sociology", "Economics",  "Political Science"],
    humanities: ["Philosophy", "History", "Religion", "Ethics", "Arts"],
    languages: ["English", "Finnish", "Spanish", "Chinese"]
};

const category = document.getElementById("category-select");
const subcategory = document.getElementById("sub-category-select"); // FIXED ID

category.addEventListener("change", function() {
    const selected = this.value;

    subcategory.innerHTML = '<option value="">Sub-category</option>';

    if(subcategories[selected]){
        subcategories[selected].forEach(function(item){
            const option = document.createElement("option");
            option.textContent = item;
            option.value = item.toLowerCase();
            subcategory.appendChild(option);
        });
    }
});