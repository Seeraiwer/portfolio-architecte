// =============================================
// LOGIQUE LOGIN
// =============================================

const loginUrl = "http://localhost:5678/api/users/login"; // URL de l'API pour l'authentification

// Sélection des éléments du formulaire
const inputEmail = document.getElementById("email"); // Champ email
const inputPassword = document.getElementById("password"); // Champ mot de passe
const submitBtn = document.querySelector("input[type='submit']"); // Bouton de soumission
const form = document.getElementById("loginForm"); // Formulaire de connexion
const loginError = document.querySelector(".loginError"); // Message d'erreur général
const passwordError = document.querySelector(".passwordError"); // Message d'erreur spécifique au mot de passe

// Objet pour stocker temporairement les informations utilisateur avant l'envoi
const logUser = {
  email: "",
  password: "",
};

// =============================================
// LOGIQUE DU FORMULAIRE
// =============================================

// Événement déclenché lors de la soumission du formulaire
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Empêche le rechargement de la page lors de la soumission
  loginUser(); // Appelle la fonction pour gérer l'authentification
});

// Mise à jour de `logUser.email` lorsque l'utilisateur saisit son email
inputEmail.addEventListener("input", (e) => {
  logUser.email = e.target.value.trim(); // Enregistre l'email sans espaces superflus
  inputEmail.classList.remove("error"); // Supprime l'état d'erreur visuelle si corrigé
  loginError.style.display = "none"; // Cache le message d'erreur si l'utilisateur corrige son entrée
});

// Mise à jour de `logUser.password` lorsque l'utilisateur saisit son mot de passe
inputPassword.addEventListener("input", (e) => {
  logUser.password = e.target.value.trim(); // Enregistre le mot de passe sans espaces superflus
  inputPassword.classList.remove("error"); // Supprime l'état d'erreur visuelle si corrigé
  passwordError.style.display = "none"; // Cache le message d'erreur si corrigé
});

// Vérification des champs lorsque la page est chargée
document.addEventListener("DOMContentLoaded", () => {
  logUser.email = inputEmail.value.trim(); // Initialise l'objet avec la valeur du champ email
  logUser.password = inputPassword.value.trim(); // Initialise l'objet avec la valeur du champ mot de passe
});

// =============================================
// FONCTION DE CONNEXION À L'API
// =============================================

async function loginUser() {
  // Vérifie si les champs sont remplis avant l'envoi
  if (!logUser.email || !logUser.password) {
    loginError.textContent = "Veuillez remplir tous les champs.";
    loginError.style.display = "block"; // Affiche l'erreur à l'utilisateur
    return;
  }

  // Vérifie si l'email est valide avant l'envoi
  if (!inputEmail.checkValidity()) {
    loginError.textContent = "Veuillez entrer une adresse email valide.";
    loginError.style.display = "block"; // Affiche une erreur de validation
    return;
  }

  try {
    // Envoi de la requête à l'API de connexion
    const response = await fetch(loginUrl, {
      method: "POST", // Méthode POST pour l'authentification
      headers: {
        "Content-Type": "application/json", // Indique que l'on envoie du JSON
      },
      body: JSON.stringify(logUser), // Convertit les données utilisateur en JSON
    });

    const data = await response.json(); // Convertit la réponse en JSON

    // Gestion des erreurs si la requête échoue
    if (!response.ok) {
      console.log("Réponse du serveur :", data); // Affiche les erreurs dans la console pour debug

      loginError.textContent = "Identifiants incorrects. Veuillez réessayer.";
      loginError.style.display = "block"; // Affiche le message d'erreur

      // Ajoute une classe CSS pour marquer les champs en erreur
      inputEmail.classList.add("error");
      inputPassword.classList.add("error");

      return; // Arrête l'exécution de la fonction
    }

    // Connexion réussie
    console.log("Connexion réussie !");
    localStorage.setItem("token", data.token); // Stocke le token de session dans le localStorage
    window.location.href = "./index.html"; // Redirige l'utilisateur vers la page d'accueil

  } catch (error) {
    // Gestion des erreurs liées à la connexion (ex: serveur hors-ligne)
    console.error("Erreur lors de la connexion :", error);
    loginError.textContent = "Impossible de se connecter au serveur.";
    loginError.style.display = "block"; // Affiche un message d'erreur générique
  }
}
