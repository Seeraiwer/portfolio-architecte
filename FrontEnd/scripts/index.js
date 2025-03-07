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
  // Effectue une requête fetch sur l'endpoint donné et renvoie le résultat en JSON.
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
  // Fonction asynchrone pour ajouter un nouveau projet via une requête POST à l'API
  async addWork(formData) {
    const response = await fetch(API_URL + "works", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error("La requête POST a échoué");
    return response.json();
  }
};

/* =============================================
   FONCTION UTILITAIRE DE GESTION DES ERREURS
   ============================================= */
// Affiche l'erreur dans la console et peut être étendu pour informer l'utilisateur
function handleError(message, error) {
  console.error(message, error);
  // Vous pouvez également afficher un message à l'utilisateur ici
}

/* =============================================
   MODULE UI : GESTION DU DOM & AFFICHAGE
   ============================================= */

/**
 * Extrait les noms de catégories uniques à partir du tableau des projets.
 * L'utilisation de Set permet d'éviter les doublons.
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
 * Vérifie que l'élément .gallery existe.
 */
function displayWorks() {
  const gallery = document.querySelector(".gallery");
  if (!gallery) {
    console.warn("Élément .gallery introuvable dans le DOM.");
    return;
  }
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
  // Réinitialise le conteneur pour éviter les doublons de boutons
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
      // Met à jour le style pour indiquer le bouton actif
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
 * Vérifie la présence d'un token et active le mode admin si présent.
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

/**
 * Active les fonctionnalités du mode admin.
 */
function activateAdminMode() {
  setupAdminInterface();

  // Ouverture de la modale via le titre "Mode édition" dans la galerie
  const titleProjectRemove = document.getElementById("titleProjectRemove");
  if (titleProjectRemove) {
    titleProjectRemove.addEventListener("click", event => {
      event.preventDefault();
      if (!document.getElementById("modal")) {
        insertModalHTML(); // Insère le HTML de la modale seulement si elle n'existe pas
      }
      openModal();
      setupEditModal();
    });

  }

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

  // Création d'un span avec le libellé "Mode édition" et une icône
  const spanEditor = document.createElement("span");
  spanEditor.classList.add("projectRemove");
  spanEditor.textContent = "Mode édition";
  const iconEditor = document.createElement("i");
  iconEditor.className = "fa-regular fa-pen-to-square";
  spanEditor.insertBefore(iconEditor, spanEditor.firstChild);
  flagEditor.appendChild(spanEditor);

  // Création et ajout du bouton "Modifier" pour ouvrir la modale d'ajout de médias
  const modifyButton = document.createElement("button");
  modifyButton.id = "modifyButton";
  modifyButton.textContent = "Modifier";
  modifyButton.classList.add("btn");
  flagEditor.appendChild(modifyButton);

  // Injection dans la section "introduction" et dans le titre du portfolio
  const portfolioTitle = document.querySelector("#portfolio > h2");
  const spanPortfolio = spanEditor.cloneNode(true);
  spanPortfolio.classList.remove("projectRemove");
  spanPortfolio.id = "titleProjectRemove";
  spanPortfolio.textContent = "Modifier";
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

  // Ajoute une marge supérieure pour éviter que le bandeau ne masque le contenu
  document.body.classList.add("marginTop");
  // Optionnel : retirer les boutons de filtre en mode admin
  filterButtonsContainer.remove();
}

/* =============================================
   MODALE : AFFICHAGE, ACTIVATION & FERMETURE
   (Insertion de la modale d'édition)
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
      const cardId = figure.dataset.cardId; // Récupère l'ID du projet

      try {
        // 1. Suppression côté API
        await API.deleteWork(cardId);
        console.log(`Image avec ID ${cardId} supprimée côté serveur`);

        // 2. Suppression immédiate de l'élément du DOM (dans la modale ET la galerie principale)
        removeWorkCard(cardId);
        figure.remove(); // Supprime aussi l'élément dans la modale
        console.log(`Image avec ID ${cardId} retirée du DOM`);
      } catch (error) {
        handleError(`Erreur lors de la suppression de l'image ID ${cardId} :`, error);
      }
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
 * Seule la section Galerie est conservée
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

/**
 * Configure la modale pour l'édition et l'ajout d'images.
 */
function setupEditModal() {
  const addProjectButton = document.getElementById("editModal");
  const inputFile = document.getElementById("filetoUpload");
  const selectCategory = document.getElementById("category");
  const editSection = document.querySelector("#editSection");
  const editForm = document.getElementById("editWorks");
  const gallerySection = document.querySelector("#modalEdit");
  const previewModal = document.querySelector("#previewModal");

  let canSubmit = false;

  // Bascule entre la galerie et le formulaire
  addProjectButton.addEventListener("click", () => {
    gallerySection.style.display = "none";
    editSection.style.display = "";
    previewModal.style.display = "initial";
  });
  previewModal.addEventListener("click", () => {
    gallerySection.style.display = "";
    editSection.style.display = "none";
    previewModal.style.display = "none";
  });

  // Prévisualisation de l'image sélectionnée
  inputFile.addEventListener("change", previewImage);

  // Génère les options du <select> pour les catégories (si non déjà présentes)
  if (selectCategory.options.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "";
    selectCategory.appendChild(emptyOption);
    categories.forEach(category => {
      const option = document.createElement("option");
      option.textContent = category.name;
      option.setAttribute("data-id", category.id);
      selectCategory.appendChild(option);
    });
  }

  // Fonction pour mettre à jour uniquement l'apparence du bouton en temps réel
  function updateButtonAppearance() {
    const titleInput = document.querySelector("#title");
    const submitButton = document.querySelector("#editWorks .editFooter input[type=submit]");

    // Vérifier si le bouton existe
    if (!submitButton) return;

    const imageSelected = !!inputFile.files[0];
    const titleValid = titleInput.value.trim().length > 0;
    const categoryValid = selectCategory.value !== "";

    // Mise à jour visuelle du bouton uniquement (sans afficher les messages d'erreur)
    if (imageSelected && titleValid && categoryValid) {
      submitButton.style.background = "#1d6154";
    } else {
      submitButton.style.background = "grey";
    }
  }
  // Ajouter les écouteurs pour mettre à jour l'apparence du bouton en temps réel
  editSection.addEventListener("input", updateButtonAppearance);
  inputFile.addEventListener("change", updateButtonAppearance);

  // Fonction de validation complète (appelée uniquement lors de la soumission)
  function validateForm() {
    const titleInput = document.querySelector("#title");
    const errorImg = document.getElementById("errorImg");
    const titleError = document.querySelector("#ErrorTitleSubmit");
    const categoryError = document.querySelector("#ErrorCategorySubmit");

    const imageSelected = !!inputFile.files[0];
    const titleValid = titleInput.value.trim().length > 0;
    const categoryValid = selectCategory.value !== "";

    // Afficher les messages d'erreur uniquement si les éléments existent
    if (errorImg) errorImg.textContent = imageSelected ? "" : "Veuillez sélectionner une image";
    if (titleError) titleError.textContent = titleValid ? "" : "Ajoutez un titre";
    if (categoryError) categoryError.textContent = categoryValid ? "" : "Choisissez une catégorie";

    return imageSelected && titleValid && categoryValid;
  }
  // Soumission du formulaire d'ajout d'image
  editForm.addEventListener("submit", event => {
    event.preventDefault();

    // Appliquer la validation au moment du clic sur valider
    canSubmit = validateForm();

    if (canSubmit) {
      const imageFile = inputFile.files[0];
      const titleValue = document.querySelector("#title").value.trim();
      const selectedOption = selectCategory.selectedOptions[0];
      const categoryId = parseInt(selectedOption.getAttribute("data-id"));
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("title", titleValue);
      formData.append("category", categoryId);

      API.addWork(formData)
        .then(data => {
          console.log("Requête POST réussie :", data);
          // Actualise la galerie en récupérant les travaux mis à jour
          API.getWorks().then(fetchedWorks => {
            works = fetchedWorks;
            displayWorks();
          });
          closeModal();
          inputFile.value = ""; // Réinitialise le champ de fichier
        })
        .catch(error => handleError("Erreur lors de la requête POST :", error));
    } else {
      console.log("Formulaire invalide !");
    }
  });
  updateButtonAppearance();
}

/**
 * Prévisualise l'image sélectionnée dans le formulaire d'ajout.
 */
function previewImage() {
  const inputFile = document.getElementById("filetoUpload");
  const viewContainer = document.getElementById("addImageContainer");
  const file = inputFile.files[0];
  const maxSize = 4 * 1024 * 1024; // 4 Mo

  // Vérification de la taille du fichier
  if (file.size > maxSize) {
    document.getElementById("errorImg").textContent = "Votre image est trop volumineuse";
    console.log("Fichier > 4MO !");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", function () {
    viewContainer.innerHTML = "";
    const img = document.createElement("img");
    img.src = reader.result;
    viewContainer.appendChild(img);
    viewContainer.style.padding = "0";
  });
  reader.readAsDataURL(file);
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