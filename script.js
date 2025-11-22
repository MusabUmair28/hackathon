// Register User
function registerUser() {
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPass").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("User Registered!"))
    .catch(err => alert(err.message));
}

// Login User
function loginUser() {
  const email = document.getElementById("logEmail").value;
  const pass = document.getElementById("logPass").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      alert("Login Successful!");
      window.location = "index.html";
    })
    .catch(err => alert(err.message));
}

// Logout User
function logOut() {
  auth.signOut().then(() => window.location = "login.html");
}
