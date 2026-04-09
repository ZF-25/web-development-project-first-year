const categories = [
  {
    id: 1,
    title: "Natural ",
    subjects: {
      "Physics": ["Optics", "Thermodynamics", "Friction", "Mechanics"],
      "Biology": ["Cell Biology", "Genetics", "Human Anatomy", "Ecology"],
      "Chemistry": ["Organic Chemistry", "Biochemistry", "Thermochemistry"],
      "Geology": ["Plate Tectonics", "Volcanology", "Paleontology"],
      "Astronomy": ["Solar System", "Cosmology", "Black Holes"]
    }
  },
  {
    id: 2,
    title: "Formal Science",
    subjects: {
      "Mathematics": ["Algebra", "Geometry", "Trigonometry", "Calculus"],
      "Logic": ["Propositional Logic", "Deductive Reasoning"],
      "Statistics": ["Probability", "Data Analysis", "Hypothesis Testing"]
    }
  },
  {
    id: 3,
    title: "Applied Science",
    subjects: {
      "Engineering & IT": ["Programming", "Data Structures", "AI", "Cybersecurity"],
      "Environmental Science": ["Climate Change", "Sustainability", "Renewable Energy"],
      "Medical & Health": ["Human Physiology", "Nutrition", "Pharmacology"]
    }
  },
  {
    id: 4,
    title: "Social Science",
    subjects: {
      "Psychology": ["Cognitive Psychology", "Behavior", "Mental Disorders"],
      "Sociology": ["Social Structures", "Inequality", "Social Change"],
      "Economics": ["Microeconomics", "Markets", "Global Economy"]
    }
  },
  {
    id: 5,
    title: "Humanities",
    subjects: {
      "Philosophy": ["Ethics", "Metaphysics", "Epistemology"],
      "History": ["Ancient History", "Medieval History", "World Wars"],
      "Arts": ["Painting", "Music", "Literature"]
    }
  },
  {
      id: 6,
    title: "Languages",
    subjects: {
      "English": ["Grammar", "Vocabulary", "Speaking"],
      "Spanish": ["Basics", "Grammar", "Verbs"],
      "Finnish": ["Nouns", "Verbs", "Grammar"]
    }
  }
];

// Функция рендера всех категорий
function renderCategories(cats) {
  const container = document.getElementById('categories-container');
  container.innerHTML = '';

  if (!cats || cats.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <h3 class="text-muted">No categories found</h3>
      </div>`;
    return;
  }

  cats.forEach(category => {
    let subjectsHTML = '';

    Object.entries(category.subjects).forEach(([subjectName, topics]) => {
      let topicsHTML = topics.map(topic => 
        `<a href="page.html?subject=${encodeURIComponent(topic)}">${topic}</a>`
      ).join('');

      subjectsHTML += `
        <div class="dropdown-item subject">
          • ${subjectName}
          <div class="sub-dropdown">
            ${topicsHTML}
          </div>
        </div>`;
    });

    const cardHTML = `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h3 class="card-title">${category.title}</h3>
            <div class="dropdown mt-3">
              ${subjectsHTML}
            </div>
          </div>
        </div>
      </div>`;

    container.innerHTML += cardHTML;
  });
}
function initCardHandlers() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return; // не закрываем при клике по ссылке

      // Закрываем все остальные
      document.querySelectorAll('.card').forEach(other => {
        if (other !== card) other.classList.remove('active');
      });

      this.classList.toggle('active');
    });
  });

  // Обработчик для subject (вложенное открытие)
  document.querySelectorAll('.subject').forEach(subject => {
    subject.addEventListener('click', function (e) {
      e.stopPropagation();
      if (e.target.tagName === 'A') return;
      this.classList.toggle('active');
    });
  });
}
window.categories = categories;