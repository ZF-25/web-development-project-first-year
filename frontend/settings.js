// USER ID (temporary)
const user_id = localStorage.getItem("user_id"); // ✅ REPLACE WITH ACTUAL LOGGED-IN USER ID (e.g., from localStorage or session) 

// EDIT PROFILE PICTURE
document.querySelector('#editProfile button').addEventListener('click', async () => {
    const fileInput = document.querySelector('#editProfile input[type="file"]');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image");
        return;
    }

    // ✅ Show preview instantly
    const previewURL = URL.createObjectURL(file);

    try {
        // ✅ IMPORTANT: use FormData (for multer)
        const formData = new FormData();
        formData.append("profile_pic", file);
        formData.append("user_id", user_id);

        const res = await fetch('http://localhost:3000/api/users/profile-pic', {
            method: 'PUT',
            body: formData
        });
        
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alert(data.message);

        // ✅ Update preview instantly
        document.querySelectorAll(".profile-img").forEach(img => {
            img.src = previewURL;
        });

    } catch (err) {
        console.error(err);
        alert("Failed to update profile picture");
    }
});


// LOAD PROFILE DATA
async function loadProfile() {
    try {
        const res = await fetch(`http://localhost:3000/api/users/${user_id}`);
        const user = await res.json();

        const imagePath = user.profile_pic
            ? `http://localhost:3000/uploads/${user.profile_pic}?t=${Date.now()}`
            : "./images/profilepic.jpg";

        // ✅ Update ALL profile images
        document.querySelectorAll(".profile-img").forEach(img => {
            img.src = imagePath;
        });

    } catch (err) {
        console.error(err);
        alert("Failed to load profile");
    }
}

// Run on page load
loadProfile();


// USERNAME
document.getElementById('usernameBtn').addEventListener('click', async () => {
    const username = document.getElementById('usernameInput').value;

    try {
        const res = await fetch('http://localhost:3000/api/users/username', {
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


// EMAIL
document.getElementById('emailBtn').addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value;

    try {
        const res = await fetch('http://localhost:3000/api/users/email', {
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


// PASSWORD
document.getElementById('passwordBtn').addEventListener('click', async () => {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/users/password', {
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


// DELETE ACCOUNT (MODAL BUTTON)
document.querySelector('#confirm-delete').addEventListener('click', async () => {
    const res = await fetch('http://localhost:3000/api/users/1', {
        method: 'DELETE'
    });

    const data = await res.json();
    alert(data.message);

    window.location.href = "login.html";
});
