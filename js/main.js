/* ==================================================
   MAIN JS — WEDDING INVITATION (FINAL CLEAN)
   Features:
   - Background music + selector
   - Hero & RSVP confetti
   - Countdown timer
   - Scroll effects
   - RSVP submit (Google Sheets)
   - Google Drive galleries w/ pagination + download
   - Lightbox (keyboard + arrows)
   - Settings panel (background + music)
================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     HELPERS
  ================================================== */
  const $  = (q) => document.querySelector(q);
  const $$ = (q) => document.querySelectorAll(q);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ==================================================
     BACKGROUND MUSIC
  ================================================== */
  const bgMusic = $("#bgMusic");
  const musicToggle = $("#musicToggle");
  let isPlaying = false;

  if (bgMusic && musicToggle) {
    bgMusic.volume = 0.3;
    bgMusic.play()
      .then(() => { isPlaying = true; musicToggle.textContent = "⏸"; })
      .catch(() => { musicToggle.textContent = "▶"; });

    musicToggle.addEventListener("click", () => {
      if (bgMusic.paused) { bgMusic.play(); musicToggle.textContent = "⏸"; isPlaying = true; }
      else { bgMusic.pause(); musicToggle.textContent = "▶"; isPlaying = false; }
    });
  }

  /* ==================================================
     CONFETTI COLORS
  ================================================== */
  const cssVars = getComputedStyle(document.documentElement);
  const CONFETTI_COLORS = [
    cssVars.getPropertyValue("--clr-secondary").trim() || "#9b779d",
    cssVars.getPropertyValue("--clr-accent").trim() || "#c9907c",
    cssVars.getPropertyValue("--clr-soft").trim() || "#f3e4e1"
  ];

  /* ==================================================
     HERO CONFETTI
  ================================================== */
  const confettiContainer = $("#confetti");

  function spawnConfetti(container) {
    if (!container) return;
    const piece = document.createElement("span");
    const size = rand(4, 10);
    piece.style.cssText = `
      position: absolute;
      left: ${rand(0, 100)}%;
      top: -10px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${pick(CONFETTI_COLORS)};
      opacity: ${rand(0.4, 0.9)};
      pointer-events: none;
    `;
    piece.animate(
      [{ transform: "translateY(0) rotate(0deg)" },
       { transform: `translateY(110vh) rotate(${rand(180, 540)}deg)` }],
      { duration: rand(4000, 6500), easing: "linear", fill: "forwards" }
    );
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 7000);
  }

  if (confettiContainer) setInterval(() => spawnConfetti(confettiContainer), 250);

  /* ==================================================
     COUNTDOWN TIMER
  ================================================== */
  const targetDate = new Date("June 20, 2027 00:00:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    $("#daysNumber").innerText = days > 0 ? days : 0;
    $("#hoursNumber").innerText = hours < 10 ? "0" + hours : hours;
    $("#minutesNumber").innerText = minutes < 10 ? "0" + minutes : minutes;
    $("#secondsNumber").innerText = seconds < 10 ? "0" + seconds : seconds;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ==================================================
     AOS INITIALIZATION
  ================================================== */
  if (window.AOS) AOS.init({ duration: 1000, once: true, easing: "ease-out-cubic" });

  /* ==================================================
     NAV SHADOW + SCROLL TO TOP
  ================================================== */
  const nav = $(".nav");
  const scrollTopBtn = $("#scrollTopBtn");

  window.addEventListener("scroll", () => {
    if (nav) nav.style.boxShadow = window.scrollY > 30 ? "0 6px 20px rgba(0,0,0,0.25)" : "none";
    if (scrollTopBtn) scrollTopBtn.classList.toggle("show", window.scrollY > 200);
  });

  scrollTopBtn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ==================================================
     RSVP CONFETTI
  ================================================== */
  function launchRSVPConfetti() {
    for (let i = 0; i < 35; i++) {
      const piece = document.createElement("span");
      const size = rand(6, 10);
      piece.style.cssText = `
        position: fixed;
        left: ${rand(0, 100)}vw;
        top: -10px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${pick(CONFETTI_COLORS)};
        z-index: 9999;
        pointer-events: none;
      `;
      piece.animate(
        [{ transform: "translateY(0) rotate(0)", opacity: 1 },
         { transform: `translateY(300px) rotate(${rand(180, 720)}deg)`, opacity: 0 }],
        { duration: 2200, easing: "ease-out", fill: "forwards" }
      );
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2300);
    }
  }

  /* ==================================================
     RSVP FORM SUBMISSION
  ================================================== */
  const rsvpForm = $(".rsvp-form");
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = new URLSearchParams({
        name: rsvpForm.name.value,
        attendance: rsvpForm.attendance.value,
        message: rsvpForm.message.value
      });
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbyMtejkOuP4GFjI2ubPV3DEmubOiLoxrASm7nWUBS6fZv5FRqd2RbMm217IZwoGPV-7/exec",
          { method: "POST", body: payload }
        );
        const result = await response.json();
        if (result.status === "success") { rsvpForm.reset(); launchRSVPConfetti(); alert("RSVP submitted! 💜"); }
        else alert("Submission failed. Please try again.");
      } catch (err) { alert("Network error. Please try again later."); }
    });
  }

  /* ==================================================
     SETTINGS PANEL (BACKGROUND ONLY)
  ================================================== */
  const settingsToggle = $("#settingsToggle");
  const settingsPanel = $("#settingsPanel");
  const bgButtons = $$(".bg-options button");

  settingsToggle?.addEventListener("click", () => {
    settingsPanel.style.display = settingsPanel.style.display === "block" ? "none" : "block";
  });

  bgButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const file = btn.dataset.bg;
      document.body.style.backgroundImage = `url("./assets/background/${file}")`;
      localStorage.setItem("bg", file);
    });
  });

  const savedBg = localStorage.getItem("bg");
  if (savedBg) document.body.style.backgroundImage = `url("./assets/background/${savedBg}")`;

  /* ==================================================
     GOOGLE DRIVE GALLERY SYSTEM
  ================================================== */
  const folders = { church: "16BPBMPTwZwZgTI2tnNV1Tk1EKKB4wMyv", prenup: "1ZoSsPSECRq062Bx4KAhKQUtnj24ePRAn", reception: "1FqqNku0QNhGgWMJAiec6944SVjXeAZ4i" };
  const apiKey = "AIzaSyBgEstYNO3_dKI4mC1KdsPRpx_p2gpDsXQ";
  const sectionMap = { church: "church-gallery", prenup: "prenup-gallery", reception: "reception-gallery" };
  const PHOTOS_PER_PAGE = 16;
  const PLACEHOLDER = "https://via.placeholder.com/400x400/c0c0c0/ffffff?text=Upload+Here";

  async function fetchImages(folderId) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType contains 'image/'&fields=files(id,name,thumbnailLink)&key=${apiKey}`;
    try { const res = await fetch(url); const data = await res.json(); return data.files || []; }
    catch (err) { console.error("Drive fetch error:", err); return []; }
  }

  function paginate(files) {
    const pages = [];
    for (let i = 0; i < files.length; i += PHOTOS_PER_PAGE) {
      const slice = files.slice(i, i + PHOTOS_PER_PAGE);
      while (slice.length < PHOTOS_PER_PAGE) slice.push({ name: "Placeholder", thumbnailLink: PLACEHOLDER });
      pages.push(slice);
    }
    return pages;
  }

  async function loadGallery(key) {
    const wrapper = $(`#${sectionMap[key]}`);
    if (!wrapper) return;

    const pagination = $(`#${key}-pagination`);
    const prevBtn = pagination?.querySelector(".prev");
    const nextBtn = pagination?.querySelector(".next");

    const files = await fetchImages(folders[key]);
    const pages = paginate(files);
    let currentPage = 0;

    function renderPage() {
      wrapper.innerHTML = "";
      pages[currentPage].forEach(file => {
        const fig = document.createElement("figure");
        fig.dataset.id = file.id || "";
        fig.dataset.name = file.name || "Photo";
        fig.innerHTML = `<img src="${file.thumbnailLink || PLACEHOLDER}" loading="lazy" alt="Wedding Photo">`;
        wrapper.appendChild(fig);
      });
    }

    renderPage();

    prevBtn?.addEventListener("click", () => { currentPage = (currentPage - 1 + pages.length) % pages.length; renderPage(); });
    nextBtn?.addEventListener("click", () => { currentPage = (currentPage + 1) % pages.length; renderPage(); });
  }

 /* ==================================================
   DRIVE POPUP + DOWNLOAD + SMOOTH ANIMATIONS
================================================== */
let currentGallery = [], currentIndex = 0;
const popup = $("#drivePopup");
const frame = $("#driveFrame");
const caption = $("#driveCaption");

// OPEN POPUP: fade in + slide up
function openDrivePreview(fileId, title, galleryArray) {
  currentGallery = galleryArray;
  currentIndex = galleryArray.findIndex(f => f.id === fileId);

  frame.src = `https://drive.google.com/file/d/${fileId}/preview`;
  caption.textContent = title;

  // Initial state: slightly below + transparent
  popup.style.display = "flex";
  popup.style.opacity = 0;
  popup.style.transform = "translateY(20%)";
  popup.style.transition = "opacity 0.35s ease, transform 0.35s ease";

  // Animate to center
  requestAnimationFrame(() => {
    popup.style.opacity = 1;
    popup.style.transform = "translateY(0)";
  });
}

// CLOSE POPUP: fade out + slide down
function closeDrivePreview() {
  popup.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  popup.style.opacity = 0;
  popup.style.transform = "translateY(20%)";
  setTimeout(() => {
    frame.src = "";
    popup.style.display = "none";
  }, 300);
}

// Animate horizontal slide for next/prev images with zoom effect
function slideToImage(newIndex, direction) {
  if (!currentGallery.length) return;

  const next = currentGallery[newIndex];
  if (!next?.id) return;

  const width = popup.offsetWidth;
  const startX = direction * width;
  const endX = 0;

  // Place new image offscreen and slightly scaled down
  frame.style.transition = "none";
  frame.style.transform = `translateX(${startX}px) scale(0.95)`;
  frame.src = `https://drive.google.com/file/d/${next.id}/preview`;
  caption.textContent = next.name;

  // Animate to center and normal scale
  requestAnimationFrame(() => {
    frame.style.transition = "transform 0.35s ease";
    frame.style.transform = `translateX(${endX}px) scale(1)`;
  });

  currentIndex = newIndex;
}


function showNext() {
  const newIndex = (currentIndex + 1) % currentGallery.length;
  slideToImage(newIndex, 1);
}

function showPrev() {
  const newIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  slideToImage(newIndex, -1);
}

// DOWNLOAD
$(".drive-download")?.addEventListener("click", () => {
  if (!currentGallery.length) return;
  const current = currentGallery[currentIndex];
  if (!current?.id) return;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${current.id}`;
  const newTab = window.open(downloadUrl, "_blank");
  if (!newTab) {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = current.name || "photo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

// CLOSE BUTTON & OUTSIDE CLICK
$(".drive-close")?.addEventListener("click", closeDrivePreview);
popup?.addEventListener("click", e => { if (e.target.id === "drivePopup") closeDrivePreview(); });

// KEYBOARD NAV
document.addEventListener("keydown", e => {
  if (popup.style.display !== "flex") return;
  if (e.key === "Escape") closeDrivePreview();
  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
});

// CLICK IMAGE TO OPEN
document.addEventListener("click", e => {
  const fig = e.target.closest(".gallery-wrapper figure");
  if (!fig) return;
  const galleryWrapper = fig.closest(".gallery-wrapper");
  const figures = Array.from(galleryWrapper.querySelectorAll("figure"));
  const galleryArray = figures.map(f => ({ id: f.dataset.id, name: f.dataset.name }));
  openDrivePreview(fig.dataset.id, fig.dataset.name, galleryArray);
});

/* ==================================================
   TOUCH SWIPE
================================================== */
let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
const swipeThreshold = 50;

popup?.addEventListener("touchstart", e => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
});

popup?.addEventListener("touchend", e => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipeGesture();
});

function handleSwipeGesture() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  // Horizontal swipe → next/prev with slide
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
    if (diffX < 0) showNext();
    else showPrev();
  }
  // Vertical swipe → close with fade/slide
  else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > swipeThreshold) {
    const dir = diffY < 0 ? -1 : 1;
    popup.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    popup.style.transform = `translateY(${dir * 100}%)`;
    popup.style.opacity = 0;
    setTimeout(() => closeDrivePreview(), 300);
  }
}



  /* ==================================================
     INIT GALLERIES
  ================================================== */
  Object.keys(folders).forEach(loadGallery);

});
