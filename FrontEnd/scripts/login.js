// =============================================
// LOGIQUE LOGIN
// =============================================

const loginUrl = "http://localhost:5678/api/users/login"; // URL de l'API pour l'authentification

// Sélection des éléments du formulaire
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const submitBtn = document.querySelector("input[type='submit']");
const form = document.getElementById("loginForm");
const loginError = document.querySelector(".loginError");
const passwordError = document.querySelector(".passwordError");

// Objet pour stocker les informations utilisateur
const logUser = {
  email: "",
  password: "",
};

// =============================================
// LOGIQUE DU FORMULAIRE
// =============================================

// Événement au submit du formulaire
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Empêche le rechargement de la page
  loginUser(); // Appelle la fonction de connexion
});

// Mise à jour de `logUser` lorsque l'utilisateur tape son e-mail
inputEmail.addEventListener("input", (e) => {
  logUser.email = e.target.value;
  inputEmail.reportValidity(); // Vérifie la validité de l'entrée
});

// Mise à jour de `logUser` lorsque l'utilisateur tape son mot de passe
inputPassword.addEventListener("input", (e) => {
  logUser.password = e.target.value;
  inputPassword.reportValidity();
});

// Vérification des champs au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  logUser.email = inputEmail.value;
  logUser.password = inputPassword.value;
  console.log(logUser);
});

// =============================================
// FONCTION DE CONNEXION À L'API
// =============================================

async function loginUser() {
  // Vérifie si les champs ne sont pas vides avant d'envoyer la requête
  if (!logUser.email || !logUser.password) {
    loginError.textContent = "Veuillez remplir tous les champs.";
    loginError.style.display = "block";
    return;
  }
  try {
    const response = await fetch(loginUrl, {
      method: "POST", // Appel à l'API POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logUser),
    });

    const data = await response.json(); // Conversion en JSON

    // Gestion des erreurs basées sur la réponse HTTP
    if (!response.ok) {
      // loginError.style.display = "block";
      // inputEmail.style.color = "red";
      console.log(logUser);
      loginError.textContent = "Identifiants incorrects. Veuillez réessayer.";
      loginError.style.display = "block";

      return;
    } else if (data.error) {
      passwordError.textContent = "Erreur dans le mot de passe !!";
      loginError.textContent = "";
      inputPassword.style.color = "red";

      if (response.status === 401) {
        loginError.textContent = "Identifiants incorrects. Veuillez réessayer.";
      } else {
        loginError.textContent =
          "Une erreur est survenue. Veuillez réessayer plus tard.";
      }
      return;
    }

    // Connexion réussie
    console.log("Connexion réussie !");
    localStorage.setItem("token", data.token); // Stocke le token
    window.location.href = "./index.html"; // Redirige vers la page d'accueil
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    loginError.textContent = "Impossible de se connecter au serveur.";
    loginError.style.display = "block";
  }
}
