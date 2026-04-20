// ===============================
// IMPORT AUTH
// ===============================
import { requireAuth, setupLogout, getUser } from "./auth.js";

requireAuth();
setupLogout();

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
});

// ===============================
// PROFILE IMAGE LOAD
// ===============================
async function loadProfile() {
    if (!user_id) return;

    try {
        const res = await fetch(`/api/users/${user_id}`);

        if (!res.ok) throw new Error("User not found");

        const userData = await res.json();

        let imagePath;

        if (userData.profile_pic) {
            // FIXED: no BASE_URL
            imagePath = `/uploads/${userData.profile_pic}?t=${Date.now()}`;
        } else {
            imagePath = "/images/profilepic.jpg";
        }

        document.querySelectorAll(".profile-img").forEach(img => {
            img.src = imagePath;

            img.onerror = () => {
                img.src = "/images/profilepic.jpg";
            };
        });

    } catch (err) {
        console.error(err);

        document.querySelectorAll(".profile-img").forEach(img => {
            img.src = "/images/profilepic.jpg";
        });
    }
}

// ===============================
// UPLOAD PROFILE PIC
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

        const res = await fetch(`/api/users/profile-pic`, {
            method: 'PUT',
            body: formData
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

        document.querySelectorAll(".profile-img").forEach(img => {
            img.src = previewURL;
        });

        const updatedUser = { ...user, profile_pic: data.filename };
        localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (err) {
        console.error(err);
        alert("Failed to update profile picture");
    }
});

// ===============================
// USERNAME
// ===============================
document.getElementById('usernameBtn')?.addEventListener('click', async () => {
    const username = document.getElementById('usernameInput').value.trim();

    if (!username) return alert("Enter username");

    try {
        const res = await fetch(`/api/users/username`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, username })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

    } catch (err) {
        console.error(err);
        alert("Username update failed");
    }
});

// ===============================
// EMAIL
// ===============================
document.getElementById('emailBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value.trim();

    if (!email) return alert("Enter email");

    try {
        const res = await fetch(`/api/users/email`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, email })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

    } catch (err) {
        console.error(err);
        alert("Email update failed");
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
        const res = await fetch(`/api/users/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, newPassword })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

    } catch (err) {
        console.error(err);
        alert("Password update failed");
    }
});

// ===============================
// DELETE ACCOUNT
// ===============================
document.querySelector('#confirm-delete')?.addEventListener('click', async () => {

    try {
        const res = await fetch(`/api/users/${user_id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        alert(data.message || "Account deleted");

        localStorage.removeItem("user");

        //FIXED path
        window.location.replace("/login.html");

    } catch (err) {
        console.error(err);
        alert("Delete failed");
    }
});