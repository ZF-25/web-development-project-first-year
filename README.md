# Brain Worm

## Project Description
Brain Worm is a web application where students can share study notes, explore topics, and learn collaboratively. The platform helps organize learning materials into categories and allows users to interact with educational content.
This project is developed as part of a Web Programming course using JavaScript, Node.js, Express, and PostgreSQL.

## Live Demo
https://web-development-project-first-year.onrender.com/

## Features
**Authentication:**
* User registration and login
* Secure authentication handling
* Profile management
**Notes System:**
* Create and upload study notes
* View notes by subject and topic
* Detailed note pages
**Filtering:**
* Filter by:
* Category (Natural, Social, etc.)
* Subcategory (Physics, Biology, etc.)
* Topic (Optics, Genetics, etc.)
**Favorites(Library):**
* Save notes to your personal library
* Easily revisit saved content
**Settings:**
* User profile and settings

## Categories System
* Natural Science
* Formal Science
* Applied Science
* Social Science
* Humanities
* Languages

## Full-Stack Integration
* Frontend + Backend served together
* REST API architecture
* PostgreSQL database

## Tech Stack
**Frontend**
* HTML
* CSS
* JavaScript (Vanilla)
**Backend**
* Node.js
* Express.js
**Database**
* PostgreSQL (hosted on Render)
**Deployment**
* Render (Web Service)

## Project Structure
<img width="260" height="303" alt="image" src="https://github.com/user-attachments/assets/fa677179-f51f-4996-80b9-996484b4e654" />

## Environment Variables
Create a .env file inside /backend:
DATABASE_URL=your_postgresql_connection_string
PORT=3000
Do NOT commit .env to GitHub

## Running Locally
**1. Clone the repo**
git clone https://github.com/ZF-25/web-development-project-first-year.git
cd web-development-project-first-year/backend
**2. Install dependencies**
npm install
**3. Start server**
node server.js
**4. Open in browser**
http://localhost:3000

## Deployment (Render)
**Backend setup:**
Root Directory: backend
Build Command: npm install
Start Command: node server.js
**Environment Variables:**
DATABASE_URL → PostgreSQL connection string

## Screenshots
**Landing Page**
<img width="1888" height="804" alt="image" src="https://github.com/user-attachments/assets/24b4f5fe-33f6-4baa-8f6c-8843487b5132" />
<img width="1897" height="993" alt="image" src="https://github.com/user-attachments/assets/27c612b0-3c85-4230-9d9a-dcb2218e6ea1" />

**Subjects, Categories & Topics**
<img width="613" height="769" alt="image" src="https://github.com/user-attachments/assets/7d187b4a-391c-4a60-8d8e-aca3ec9bb237" />
<img width="1893" height="502" alt="image" src="https://github.com/user-attachments/assets/da2b93c0-1375-4da4-871f-00b6c3ac2732" />

**Note View**
<img width="1470" height="991" alt="image" src="https://github.com/user-attachments/assets/91758bcb-cf8b-45ff-86b8-8aa8410916bd" />

**Favorites**
<img width="1704" height="976" alt="image" src="https://github.com/user-attachments/assets/3ba5cc9a-dadc-40b3-ae7b-63d23b62d531" />

## Important Notes
* uploads/ folder is ignored via .gitignore
* Only .gitkeep is tracked
* Uploaded files are not stored permanently on free hosting

## Future Improvements
* Image/file storage (Cloudinary / AWS S3)
* User profile pictures
* Comments & discussions
* Search & Rating feature
* Pagination & performance optimization
* JWT authentication improvement

## Team
This project was developed collaboratively as part of a web development course.
**Zainab** — Project board management, Backend setup, database integration, User authentication, deployment
**Marina** — Content structure (categories, subcategories, topics)
**Ruvindra** — Posts system, favorites (Library), user settings

## Development Method
This project is developed using the **Scrum methodology**, with tasks organized into sprints and managed through GitHub Issues and Project Board.

## License
This project is for educational purposes.
