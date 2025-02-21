/* =============================================
   CONSTANTES ET VARIABLES GLOBALES
   ============================================= */
const API_URL = "http://localhost:5678/api/";
const token = localStorage.getItem("token");

let selectedCategory = "Tous"; // Catégorie sélectionnée (par défaut "Tous")
let works = [];                // Liste des projets récupérés
let categories = [];           // Liste des catégories

// Création du conteneur des boutons de filtre
const filterButtonsContainer = document.createElement("div");
filterButtonsContainer.classList.add("filter");

// Sélection de la section portfolio et insertion du conteneur de boutons après le titre
const portfolioSection = document.querySelector("#portfolio");
const portfolioTitle = portfolioSection.querySelector("h2");
portfolioTitle.insertAdjacentElement("afterend", filterButtonsContainer);

/* =============================================
   MODULE API : GESTION DES APPELS API
   ============================================= */
const API = {
  async fetchData(endpoint) {
    const response = await fetch(API_URL + endpoint);
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    return response.json();
  },
  async getWorks() {
    return this.fetchData("works");
  },
  async getCategories() {
    return this.fetchData("categories");
  },
  async deleteWork(id) {
    const response = await fetch(`${API_URL}works/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error(response.statusText);
    return response;
  },
};

/* =============================================
   FONCTION UTILITAIRE DE GESTION DES ERREURS
   ============================================= */
function handleError(message, error) {
  console.error(message, error);
  // Vous pouvez également afficher un message à l'utilisateur ici
}

/* =============================================
   MODULE UI : GESTION DU DOM & AFFICHAGE
   ============================================= */

/**
 * Extrait les noms de catégories uniques à partir du tableau des projets.
 * @param {Array} worksArray - Liste des projets.
 * @returns {Array} Liste des noms de catégories uniques.
 */
function getUniqueCategoryTitles(worksArray) {
  return [...new Set(worksArray.map(({ category }) => category.name))];
}

/**
 * Crée et retourne un élément <figure> représentant un projet.
 * @param {Object} work - Objet projet.
 * @returns {HTMLElement} Élément figure du projet.
 */
function createWorkCard({ id, imageUrl, title, category, categoryId }) {
  const figure = document.createElement("figure");
  figure.dataset.cardId = id;
  figure.dataset.categoryId = categoryId;

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = `Photo de ${title}`;

  const caption = document.createElement("figcaption");
  caption.textContent = title;

  figure.appendChild(img);
  figure.appendChild(caption);
  return figure;
}

/**
 * Affiche les projets dans la galerie en fonction de la catégorie sélectionnée.
 */
function displayWorks() {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  const filteredWorks = works.filter(
    work => selectedCategory === "Tous" || work.category.name === selectedCategory
  );
  filteredWorks.forEach(work => gallery.appendChild(createWorkCard(work)));
}

/**
 * Crée et initialise les boutons de filtre.
 * Utilise l'event delegation pour la gestion des clics.
 * @param {Array} buttonTitles - Liste des noms de catégories uniques.
 */
function createFilterButtons(buttonTitles) {
  // Réinitialise le conteneur
  filterButtonsContainer.innerHTML = "";
  // Bouton "Tous"
  const allButton = document.createElement("button");
  allButton.classList.add("btn", "active");
  allButton.textContent = "Tous";
  filterButtonsContainer.appendChild(allButton);

  // Boutons pour chaque catégorie
  buttonTitles.forEach(name => {
    const btn = document.createElement("button");
    btn.classList.add("btn");
    btn.textContent = name;
    filterButtonsContainer.appendChild(btn);
  });

  // Gestion via event delegation
  filterButtonsContainer.addEventListener("click", event => {
    if (event.target.tagName === "BUTTON") {
      selectedCategory = event.target.textContent;
      filterButtonsContainer.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
      event.target.classList.add("active");
      displayWorks();
    }
  });
}

/* =============================================
   MODE ADMIN : CONFIGURATION & INTERFACE
   ============================================= */

/**
 * Vérifie la présence d'un token et active le mode admin le cas échéant.
 */
function checkToken() {
  if (token) {
    console.log("Token détecté, mode ADMIN activé.");
    activateAdminMode();
  } else {
    console.log("Aucun token détecté, mode utilisateur.");
  }
}

/**
 * Supprime le token et les images supprimées stockées en session.
 */
function removeToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("deletedImages");
}
window.addEventListener("unload", removeToken);

/**
 * Active les fonctionnalités du mode admin.
 */
function activateAdminMode() {
  setupAdminInterface();

  // Ouverture de la modale via le titre "Mode édition" dans la galerie
  const titleProjectRemove = document.getElementById("titleProjectRemove");
  titleProjectRemove.addEventListener("click", event => {
    event.preventDefault();
    insertModalHTML();
    openModal();
  });

  // Bouton de suppression des projets via l'API
  const deleteWorksButton = document.querySelector("body > div > button");
  if (deleteWorksButton) {
    deleteWorksButton.addEventListener("click", event => {
      event.preventDefault();
      deleteWorksFromApi();
    });
  }
}

/**
 * Configure l'interface du mode admin :
 * - Bandeau "Mode édition"
 * - Injections dans la section d'introduction et portfolio
 * - Lien de déconnexion
 */
function setupAdminInterface() {
  // Création du bandeau "Mode édition"
  const flagEditor = document.createElement("div");
  flagEditor.classList.add("flagEditor");
  flagEditor.style.zIndex = "1000"; // Toujours au-dessus

  document.body.insertAdjacentElement("afterbegin", flagEditor);

  const spanEditor = document.createElement("span");
  spanEditor.classList.add("projectRemove");
  spanEditor.textContent = "Modifier";

  const iconEditor = document.createElement("i");
  iconEditor.className = "fa-regular fa-pen-to-square";
  spanEditor.insertBefore(iconEditor, spanEditor.firstChild);

  flagEditor.appendChild(spanEditor);
  // Injection dans la section "introduction" et dans le titre du portfolio
  const introductionFigure = document.querySelector("#introduction figure");
  const portfolioTitle = document.querySelector("#portfolio > h2");

  const spanFigure = spanEditor.cloneNode(true);
  spanFigure.classList.remove("projectRemove");
  spanFigure.classList.add("figureRemove");
  introductionFigure.appendChild(spanFigure);

  const spanPortfolio = spanEditor.cloneNode(true);
  spanPortfolio.classList.remove("projectRemove");
  spanPortfolio.id = "titleProjectRemove";
  portfolioTitle.appendChild(spanPortfolio);

  // Lien de déconnexion dans le menu
  const logoutListItem = document.querySelector("body > header > nav > ul > li:nth-child(3)");
  const logoutLink = document.createElement("a");
  logoutLink.href = "./index.html";
  logoutLink.textContent = "Logout";
  logoutListItem.innerHTML = "";
  logoutListItem.appendChild(logoutLink);
  logoutLink.addEventListener("click", event => {
    event.preventDefault();
    removeToken();
    window.location.assign("./index.html");
  });

  // Ajoute une marge supérieure pour ne pas masquer le contenu
  document.body.classList.add("marginTop");
  // Optionnel : retirer les boutons de filtre en mode admin
  filterButtonsContainer.remove();
}

/* =============================================
   MODALE : AFFICHAGE, ACTIVATION & FERMETURE
   ============================================= */

/**
 * Ouvre et affiche la modale de suppression.
 */
function openModal() {
  // Réinitialise la grille modale
  document.getElementById("modalGrid").innerHTML = "";

  // Récupère les URLs uniques de la galerie
  const images = [...document.querySelectorAll(".gallery img")].map(img => img.getAttribute("src"));
  const uniqueImages = new Set(images);

  // Crée pour chaque image un élément figure dans la modale
  const imageElements = [...uniqueImages].map((imgSrc, index) => {
    const figure = document.createElement("figure");
    figure.dataset.cardId = works[index].id;

    const img = document.createElement("img");
    img.src = imgSrc;

    const caption = document.createElement("p");
    caption.textContent = "";

    const deleteIcon = document.createElement("i");
    deleteIcon.id = "deleteIcon";
    deleteIcon.classList.add("fa-solid", "fa-trash-can", "iconModal");
    deleteIcon.setAttribute("aria-hidden", "true");

    figure.appendChild(img);
    figure.appendChild(caption);
    figure.appendChild(deleteIcon);

    // Suppression de l'image via la modale
    deleteIcon.addEventListener("click", async event => {
      event.preventDefault();
      const cardId = figure.dataset.cardId;
      removeWorkCard(cardId);
      updateDeletedImages(cardId);
    });

    return figure;
  });

  document.getElementById("modalGrid").append(...imageElements);
  displayModal();
}

/**
 * Ferme la modale et réactive le défilement de la page.
 */
function closeModal() {
  document.getElementById("modal").remove();
  enableScroll();
}

/**
 * Affiche la modale et gère sa fermeture.
 */
function displayModal() {
  const modal = document.querySelector("#modal");
  const closeModalBtn = document.querySelector("#closeModal");
  closeModalBtn.addEventListener("click", closeModal);
  window.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });
  disableScroll();
}

/**
 * Désactive le défilement de la page.
 */
function disableScroll() {
  document.body.classList.add("modalOpen");
}

/**
 * Réactive le défilement de la page.
 */
function enableScroll() {
  document.body.classList.remove("modalOpen");
}

/**
 * Insère le HTML de la modale dans le DOM.
 * Seule la section Galerie est conservée ; la partie formulaire d'ajout a été retirée.
 */
function insertModalHTML() {
  // Si une modale existe déjà, ne rien faire
  if (document.getElementById("modal")) return;

  document.body.insertAdjacentHTML("beforeend", `
      <aside id="modal" class="modal" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
        <div id="modalContainer">
          <span class="fa-solid fa-xmark" id="closeModal"></span>
           <i id="previewModal" class="fa-solid fa-arrow-left"></i>
           <section class="modalTemplate" id="modalEdit">
             <div id="editionGallery">
          <h2 class="modalTitle">Galerie photo</h2>
          <div id="modalGrid"></div>
             </div>
          <div class="footerModal">
            <hr>
               <input type="submit" value="Ajouter une photo" id="editModal">
             </div>
           </section>
           <!-- Formulaire d'ajout d'image -->
           <section class="modalTemplate" id="editSection" style="display:none">
             <h2 class="modalTitle">Ajout photo</h2>
             <form id="editWorks">
               <div id="addImageContainer">
                 <i class="fa-solid fa-image"></i>
                 <div id="inputFile">
                   <label for="filetoUpload" class="fileLabel">
                     <span>+ Ajouter une photo</span>
                     <input type="file" id="filetoUpload" name="image" accept="image/png, image/jpeg" class="file-input">
                   </label>
                 </div>
                 <span class="filesize">jpg, png : 4mo max</span>
                 <span id="errorImg"></span>
               </div>
               <div class="inputEdit" id="addTitle">
                 <label for="title">Titre</label>
                 <input type="text" name="title" id="title" class="inputCss" required>
                 <span id="ErrorTitleSubmit" class="errormsg"></span>
               </div>
               <div class="inputEdit" id="addCategory">
                 <label for="category">Catégorie</label>
                 <select name="category" id="category" data-id="" class="inputCss"></select>
                 <span id="ErrorCategorySubmit" class="errormsg"></span>
               </div>
               <div class="footerModal editFooter">
                 <hr>
                 <input type="submit" value="Valider">
          </div>
             </form>
           </section>
        </div>
      </aside>
    `);
}

/**
 * Supprime une carte de projet du DOM.
 * @param {string} cardId - ID de la carte.
 */
function removeWorkCard(cardId) {
  const card = document.querySelector(`[data-card-id="${cardId}"]`);
  if (card && card.parentNode) card.parentNode.removeChild(card);
}

/**
 * Met à jour la liste des images supprimées dans le sessionStorage.
 * @param {string} cardId - ID de l'image supprimée.
 */
function updateDeletedImages(cardId) {
  const deleted = JSON.parse(sessionStorage.getItem("deletedImages")) || {};
  deleted[cardId] = true;
  sessionStorage.setItem("deletedImages", JSON.stringify(deleted));
}

/**
 * Supprime les images marquées comme supprimées via l'API.
 */
function deleteWorksFromApi() {
  const deleted = JSON.parse(sessionStorage.getItem("deletedImages"));
  if (!deleted) return;
  Object.keys(deleted).forEach(async id => {
    try {
      if (!token) return console.log({ error: "Pas connecté" });
      await API.deleteWork(id);
      console.log(`Image avec ID ${id} supprimée`);
    } catch (error) {
      handleError(`Erreur lors de la suppression de l'image avec ID ${id}:`, error);
    }
  });
}

/* =============================================
   INITIALISATION
   ============================================= */
async function initialize() {
  try {
    works = await API.getWorks();
    const buttonTitles = getUniqueCategoryTitles(works);
    createFilterButtons(buttonTitles);
    displayWorks();
    categories = await API.getCategories();
  } catch (error) {
    handleError("Erreur lors du chargement initial :", error);
  }
  checkToken();
}

window.addEventListener("DOMContentLoaded", initialize);
