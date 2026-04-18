// ===============================
// IMPORT AUTH
// ===============================
import { requireAuth, getUser } from "./auth.js";

requireAuth();

const API_BASE = "http://localhost:3000";


// ===============================
// USER
// ===============================
const user = getUser();
const user_id = user?.id;


// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    setupLogout();
});


// ===============================
// LOGOUT
// ===============================
function setupLogout() {
    const logoutLink = document.querySelector('.dropdown a[href="login.html"]');

    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("user");
            window.location.replace("login.html");
        });
    }
}


// ===============================
// EDIT PROFILE PICTURE
// ===============================
document.querySelector('#editProfile button')?.addEventListener('click', async () => {

    const fileInput = document.querySelector('#editProfile input[type="file"]');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image");
        return;
    }

    const previewURL = URL.createObjectURL(file);

    try {
        const formData = new FormData();
        formData.append("profile_pic", file);
        formData.append("user_id", user_id);

        const res = await fetch(`${API_BASE}/api/users/profile-pic`, {
            method: 'PUT',
            body: formData
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

        document.querySelectorAll(".profile-img").forEach(img => {
            img.src = previewURL;
        });

    } catch (err) {
        console.error(err);
        alert("Failed to update profile picture");
    }
});


// ===============================
// LOAD PROFILE
// ===============================
async function loadProfile() {
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
        alert("Failed to load profile");
    }
}


// ===============================
// USERNAME
// ===============================
document.getElementById('usernameBtn')?.addEventListener('click', async () => {
    const username = document.getElementById('usernameInput').value.trim();

    if (!username) return alert("Enter username");

    try {
        const res = await fetch(`${API_BASE}/api/users/username`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, username })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

    } catch (err) {
        console.error(err);
        alert("Username update failed (backend missing?)");
    }
});


// ===============================
// EMAIL
// ===============================
document.getElementById('emailBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value.trim();

    if (!email) return alert("Enter email");

    try {
        const res = await fetch(`${API_BASE}/api/users/email`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, email })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

    } catch (err) {
        console.error(err);
        alert("Email update failed (backend missing?)");
    }
});


// ===============================
// PASSWORD
// ===============================
document.getElementById('passwordBtn')?.addEventListener('click', async () => {

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/users/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, newPassword })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

    } catch (err) {
        console.error(err);
        alert("Password update failed (backend missing?)");
    }
});


// ===============================
// DELETE ACCOUNT
// ===============================
document.querySelector('#confirm-delete')?.addEventListener('click', async () => {

    try {
        const res = await fetch(`${API_BASE}/api/users/${user_id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        alert(data.message || "Account deleted");

        localStorage.removeItem("user");
        window.location.href = "login.html";

    } catch (err) {
        console.error(err);
        alert("Delete failed (backend missing?)");
    }
});