// ===========================
// CONFIGURATION
// ===========================
const folders = {
  church: "16BPBMPTwZwZgTI2tnNV1Tk1EKKB4wMyv",
  prenup: "1ZoSsPSECRq062Bx4KAhKQUtnj24ePRAn",
  reception: "1FqqNku0QNhGgWMJAiec6944SVjXeAZ4i"
};

const apiKey = "AIzaSyBgEstYNO3_dKI4mC1KdsPRpx_p2gpDsXQ";

const sectionMap = {
  church: "church-gallery",
  prenup: "prenup-gallery",
  reception: "reception-gallery"
};

const PHOTOS_PER_PAGE = 9;
const PLACEHOLDER = "https://via.placeholder.com/400x400/c0c0c0/ffffff?text=Upload+Here";

// ---------------------------
// FETCH IMAGES FROM GOOGLE DRIVE
// ---------------------------
async function fetchImages(folderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='image/jpeg'&fields=files(id,name,webContentLink,thumbnailLink)&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.files || [];
  } catch (err) {
    console.error("Error fetching images:", err);
    return [];
  }
}

// ---------------------------
// CREATE FIGURE ELEMENT
// ---------------------------
function createFigure(file, index) {
  const figure = document.createElement("figure");
  figure.dataset.index = index;

  const img = document.createElement("img");
  img.src = file.thumbnailLink || file.webContentLink || PLACEHOLDER;
  img.alt = file.name || "Placeholder";

  const caption = document.createElement("figcaption");
  caption.textContent = file.name || "Placeholder";

  figure.appendChild(img);
  figure.appendChild(caption);

  return figure;
}

// ---------------------------
// PAGINATION UTILITY
// ---------------------------
function paginateArray(array, perPage) {
  const pages = [];
  for (let i = 0; i < array.length; i += perPage) {
    let slice = array.slice(i, i + perPage);

    // Fill up to perPage with placeholders
    while (slice.length < perPage) {
      slice.push({ name: "Placeholder", thumbnailLink: PLACEHOLDER, webContentLink: PLACEHOLDER });
    }

    pages.push(slice);
  }
  return pages;
}

// ---------------------------
// LOAD GALLERY WITH PAGINATION
// ---------------------------
async function loadGallery(folderKey) {
  const sectionId = sectionMap[folderKey];
  const container = document.getElementById(sectionId);
  if (!container) return;

  const files = await fetchImages(folders[folderKey]);
  const pages = paginateArray(files, PHOTOS_PER_PAGE);

  let currentPage = 0;

  // fixed wrapper for gallery grid
  const galleryWrapper = document.createElement("div");
  galleryWrapper.classList.add("gallery-wrapper");
  container.appendChild(galleryWrapper);

  // render a single page
  function renderPage(pageIndex) {
    galleryWrapper.innerHTML = "";
    pages[pageIndex].forEach((file, idx) => {
      const figure = createFigure(file, idx + pageIndex * PHOTOS_PER_PAGE);
      galleryWrapper.appendChild(figure);
    });
    attachLightbox(container);
  }

  renderPage(currentPage);

  // pagination buttons
  if (pages.length > 1) {
    const pagination = document.createElement("div");
    pagination.classList.add("pagination");

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.addEventListener("click", () => {
      currentPage = (currentPage - 1 + pages.length) % pages.length;
      renderPage(currentPage);
    });

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", () => {
      currentPage = (currentPage + 1) % pages.length;
      renderPage(currentPage);
    });

    pagination.appendChild(prevBtn);
    pagination.appendChild(nextBtn);
    container.appendChild(pagination);
  }
}

// ---------------------------
// LIGHTBOX
// ---------------------------
function attachLightbox(container) {
  const figures = container.querySelectorAll("figure");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.querySelector(".lightbox-img");
  const lightboxCaption = document.querySelector(".lightbox-caption");
  const closeBtn = document.querySelector(".close");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  let currentIndex = 0;

  function openLightbox(index) {
    const figure = figures[index];
    if (!figure) return;
    lightbox.style.display = "flex";
    lightboxImg.src = figure.querySelector("img").src;
    lightboxCaption.textContent = figure.querySelector("figcaption").textContent;
    currentIndex = index;
  }

  function closeLightbox() {
    lightbox.style.display = "none";
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % figures.length;
    openLightbox(currentIndex);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + figures.length) % figures.length;
    openLightbox(currentIndex);
  }

  figures.forEach((fig, i) => fig.addEventListener("click", () => openLightbox(i)));
  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "flex") {
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") closeLightbox();
    }
  });
}

// ---------------------------
// INITIALIZE
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  Object.keys(folders).forEach(folderKey => loadGallery(folderKey));
});
