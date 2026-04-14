export function requireAuth() {
  const user = localStorage.getItem("user");

  if (!user) {
    window.location.replace("login.html");
  }
}

export function redirectIfLoggedIn() {
  const user = localStorage.getItem("user");

  if (user) {
    window.location.replace("home.html");
  }
}