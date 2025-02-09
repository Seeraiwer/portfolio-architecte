// Définition de l'URL de base de l'API
const api = "http://localhost:5678/api/";

// Récupération du token utilisateur depuis le localStorage
const token = localStorage.getItem("token");

// Variables globales
let categoryIdValue = ""; // Stocke l'ID de la catégorie sélectionnée pour le filtrage
let categories = []; // Stocke la liste des catégories récupérées depuis l'API
let btnTitle = []; // Stocke les titres des boutons de filtrage

// Sélection des éléments du DOM
const btnSort = document.querySelectorAll(".btn"); // Tous les boutons de filtrage
const filterButtons = document.createElement("div"); // Conteneur des boutons de filtre
const portfolioSection = document.querySelector("#portfolio"); // Section du portfolio

// Insère le conteneur des boutons juste après le titre "Mes Projets"
portfolioSection
  .querySelector("h2")
  .insertAdjacentElement("afterend", filterButtons);

const imageUrls = []; // Stocke les URLs des images des projets

// =============================================
// RÉCUPÉRATION DES DONNÉES DE L'API
// =============================================

/**
 * Récupère la liste des projets depuis l'API et met à jour l'affichage.
 */
async function fetchApiWorks() {
  try {
    const response = await fetch(api + "works"); // Appel API pour récupérer les projets
    const data = await response.json(); // Conversion en JSON
    cards = data; // Stockage des projets

    const btnTitle = getButtonTitles(cards); // Récupération des titres uniques des catégories
    console.log(`Titres des boutons filtres : ${btnTitle.join(" / ")}`);
    console.log(cards);

    filtersBtn(btnTitle); // Génération des boutons de filtre
    workDisplay(cards); // Affichage des projets dans la galerie
  } catch (error) {
    console.error("Erreur lors du chargement des projets:", error);
  }
}

/**
 * Récupère la liste des catégories depuis l'API et met à jour la variable globale `categories`.
 */
async function fetchApiCategories() {
  try {
    const response = await fetch(api + "categories"); // Appel API pour récupérer les catégories
    categories = await response.json(); // Conversion en JSON et stockage
    console.log(categories);
  } catch (error) {
    console.error("Erreur lors du chargement des catégories:", error);
  }
}

// =============================================
// TRAITEMENT DES DONNÉES
// =============================================

/**
 * Extrait les titres de catégories uniques à partir de la liste des projets.
 * @param {Array} cards - Tableau des projets récupérés depuis l'API.
 * @returns {Array} - Tableau des noms de catégories uniques.
 */
function getButtonTitles(cards) {
  return [...new Set(cards.map((card) => card.category.name))]; // Retourne une liste unique des catégories
}

// =============================================
// CRÉATION & INJECTION DES BOUTONS DE FILTRAGE
// =============================================

/**
 * Génère les boutons de filtrage et les insère dans le DOM.
 * @param {Array} btnTitle - Liste des catégories uniques pour générer les boutons.
 */
function filtersBtn(btnTitle) {
  // Création du bouton "Tous" pour afficher tous les projets
  const allButton = document.createElement("button"); // Crée un élément <button>
  allButton.classList.add("btn", "active"); // Ajoute les classes "btn" et "active" (ce bouton est sélectionné par défaut)
  allButton.textContent = "Tous"; // Définit le texte du bouton comme "Tous"
  filterButtons.appendChild(allButton); // Ajoute le bouton au conteneur des filtres
  filterButtons.classList.add("filter"); // Ajoute une classe "filter" au conteneur pour le styliser

  // Création des boutons dynamiques pour chaque catégorie reçue en paramètre
  const buttons = [
    allButton, // Le bouton "Tous" est inclus en premier dans la liste des boutons
    ...btnTitle.map((categoryName) => {
      // Parcourt le tableau `btnTitle` contenant les noms des catégories
      const button = document.createElement("button"); // Crée un bouton pour chaque catégorie
      button.classList.add("btn"); // Ajoute la classe "btn" pour le style
      button.textContent = categoryName; // Définit le texte du bouton comme le nom de la catégorie
      filterButtons.appendChild(button); // Ajoute le bouton au conteneur des filtres
      return button; // Retourne le bouton créé pour qu'il soit ajouté au tableau `buttons`
    }),
  ];

  // Gestion des événements de clic sur chaque bouton de filtrage
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      categoryIdValue = e.target.textContent; // Stocke le texte du bouton cliqué (nom de la catégorie sélectionnée)
      console.log(categoryIdValue); // Affiche la catégorie sélectionnée dans la console (utile pour le débogage)

      // Supprime la classe "active" de tous les boutons pour désactiver l'ancien filtre
      buttons.forEach((btn) => btn.classList.remove("active"));

      // Ajoute la classe "active" au bouton qui vient d'être cliqué
      e.target.classList.add("active");

      workDisplay(); // Met à jour l'affichage des projets en fonction du filtre sélectionné
    });
  });
}

// =============================================
// GÉNÉRATION DES CARTES DE PROJETS
// =============================================

/**
 * Génère un élément de projet sous forme de carte et l'ajoute au DOM.
 * @param {Object} card - Objet contenant les informations du projet.
 * @returns {HTMLElement} - Élément figure représentant le projet.
 */
function cardsTemplate(card) {
  // Création d'un élément <figure> qui servira de conteneur pour la carte
  const cardDisplay = document.createElement("figure");

  // Ajout d'un identifiant unique pour chaque carte (utile pour les interactions dynamiques)
  cardDisplay.setAttribute("data-card-id", card.id);
  cardDisplay.setAttribute("data-category-id", card.categoryId);

  // Création de l'image du projet
  const imgCard = document.createElement("img");
  imgCard.setAttribute("src", card.imageUrl); // Définit la source de l'image
  imgCard.setAttribute("alt", "photo de " + card.title); // Texte alternatif pour l'accessibilité et le SEO

  // Création du titre du projet sous forme de légende (<figcaption>)
  const titleCard = document.createElement("figcaption");
  titleCard.textContent = card.title; // Ajoute le titre du projet

  // Ajout de l'image et du titre à l'élément <figure>
  cardDisplay.appendChild(imgCard);
  cardDisplay.appendChild(titleCard);

  // Retourne la carte créée (peut être utilisé pour d'autres manipulations si nécessaire)
  return cardDisplay;
}
// Fonction pour ajouter plusieurs cartes en une seule opération DOM
function displayCards(cardsArray) {
  const fragment = document.createDocumentFragment(); // Crée un fragment DOM pour optimiser l'ajout

  cardsArray.forEach((card) => {
    const cardElement = cardsTemplate(card); // Génère une carte
    fragment.appendChild(cardElement); // Ajoute la carte au fragment
  });

  portfolioSection.appendChild(fragment); // Ajoute toutes les cartes en une seule opération DOM
}

// =============================================
// AFFICHAGE DES PROJETS FILTRÉS
// =============================================

function workDisplay() {
  const gallery = document.querySelector(".gallery"); // Sélectionne l'élément contenant la galerie
  const cardDisplay = new Set(); // Utilisation d'un Set pour éviter les doublons
  gallery.innerHTML = ""; // Vide la galerie avant d'ajouter les nouvelles cartes filtrées

  // 🔍 Filtrage des projets en fonction de la catégorie sélectionnée
  cards.forEach((card) => {
    if (categoryIdValue === "Tous" || card.category.name === categoryIdValue) {
      cardDisplay.add(card); // Ajoute le projet au Set si la catégorie correspond
    }
  });

  // 🖼️ Ajout des projets filtrés à la galerie
  cardDisplay.forEach((card) => {
    gallery.appendChild(cardsTemplate(card)); // Génère la carte et l'ajoute à la galerie
  });
}

// =============================================
// CHARGEMENT DES DONNÉES AU DÉMARRAGE
// =============================================

window.addEventListener("load", () => {
  fetchApiWorks(); // 🔄 Récupère les projets depuis l'API
  fetchApiCategories(); // 📂 Récupère les catégories depuis l'API
  categoryIdValue = "Tous"; // 🏷️ Définit la catégorie par défaut sur "Tous"
  checkToken(); // 🔒 Vérifie si l'utilisateur est connecté pour gérer l'affichage
});
