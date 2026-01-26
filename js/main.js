/* ==================================================
   MAIN JS FOR WEDDING INVITATION
   Features: Background music, confetti, countdown,
             scroll-to-top, AOS, RSVP confetti,
             Universal Save the Date button
================================================== */
document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------
     HELPER FUNCTIONS
  ---------------------------- */
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ----------------------------
     BACKGROUND MUSIC
  ---------------------------- */
  const bgMusic = $("#bgMusic");
  const musicToggle = $("#musicToggle");

  let isPlaying = false;

  if (bgMusic && musicToggle) {
    // Set initial volume
    bgMusic.volume = 0.3;

    // Try autoplay (may fail due to browser restrictions)
    bgMusic.play().then(() => {
      isPlaying = true;
      musicToggle.textContent = "⏸";
    }).catch(() => {
      console.log("Autoplay blocked. Music will start on user interaction.");
      musicToggle.textContent = "▶";
    });

    // Play/pause toggle
    musicToggle.addEventListener("click", () => {
      if (bgMusic.paused) {
        bgMusic.play();
        isPlaying = true;
        musicToggle.textContent = "⏸";
      } else {
        bgMusic.pause();
        isPlaying = false;
        musicToggle.textContent = "▶";
      }
    });
  }

  /* ----------------------------
     CONFETTI COLORS
  ---------------------------- */
  const cssVars = getComputedStyle(document.documentElement);
  const CONFETTI_COLORS = [
    cssVars.getPropertyValue("--clr-accent-primary")?.trim() || "#9b779d",
    cssVars.getPropertyValue("--clr-accent-strong")?.trim() || "#ccb4ce",
    cssVars.getPropertyValue("--clr-accent-soft")?.trim() || "#c9907c"
  ];

  /* ----------------------------
     HERO CONFETTI
  ---------------------------- */
  const confettiContainer = $("#confetti");

  function createConfetti(container, sizeRange = [4, 10], yStart = -10, yEnd = 110) {
    if (!container) return;

    const conf = document.createElement("span");
    const size = rand(sizeRange[0], sizeRange[1]);

    conf.style.cssText = `
      position: absolute;
      left: ${rand(0, 100)}%;
      top: ${yStart}px;
      width: ${size}px;
      height: ${size}px;
      background-color: ${randomFrom(CONFETTI_COLORS)};
      border-radius: 50%;
      opacity: ${rand(0.4, 0.9)};
      pointer-events: none;
    `;

    conf.animate(
      [
        { transform: "translateY(0) rotate(0deg)" },
        { transform: `translateY(${yEnd}vh) rotate(${rand(180, 540)}deg)` },
      ],
      { duration: rand(4000, 6500), easing: "linear", fill: "forwards" }
    );

    container.appendChild(conf);
    setTimeout(() => conf.remove(), 7000);
  }

  if (confettiContainer) setInterval(() => createConfetti(confettiContainer), 250);

  /* ----------------------------
     COUNTDOWN TIMER
  ---------------------------- */
  const countdownEl = $("#countdown");
  if (countdownEl) {
    const weddingDate = new Date("June 20, 2027 14:00:00").getTime();

    const parts = {
      days: $("#days"),
      hours: $("#hours"),
      minutes: $("#minutes"),
      seconds: $("#seconds"),
    };

    const updateCountdown = () => {
      const diff = weddingDate - Date.now();
      if (diff <= 0) {
        countdownEl.textContent = "Today is the big day 💍";
        return;
      }
      const values = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
      Object.keys(values).forEach(key => {
        parts[key].textContent = String(values[key]).padStart(2, "0");
      });
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ----------------------------
     INITIALIZE AOS
  ---------------------------- */
  if (window.AOS) {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }

  /* ----------------------------
     NAV SCROLL SHADOW
  ---------------------------- */
  const nav = $(".nav");
  if (nav) {
    window.addEventListener("scroll", () => {
      nav.style.boxShadow = window.scrollY > 30 ? "0 6px 20px rgba(0,0,0,0.25)" : "none";
    });
  }

  /* ----------------------------
     SCROLL TO TOP BUTTON
  ---------------------------- */
  const scrollBtn = $("#scrollTopBtn");
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.classList.toggle("show", window.scrollY > 200);
    });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----------------------------
     RSVP CONFETTI
  ---------------------------- */
  const attendance = $("#attendance");
  function launchRSVPConfetti() {
    const pieces = 35;
    for (let i = 0; i < pieces; i++) {
      const conf = document.createElement("span");
      const size = rand(6, 10);

      conf.style.cssText = `
        position: fixed;
        left: ${rand(0, 100)}vw;
        top: -10px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${randomFrom(CONFETTI_COLORS)};
        pointer-events: none;
        z-index: 9999;
      `;

      conf.animate(
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          { transform: `translateY(300px) rotate(${rand(180, 720)}deg)`, opacity: 0 },
        ],
        { duration: 2200, easing: "ease-out", fill: "forwards" }
      );

      setTimeout(() => conf.remove(), 2300);
    }
  }

  /* ----------------------------
     UNIVERSAL SAVE THE DATE BUTTON
  ---------------------------- */
  const saveBtn = document.getElementById("saveDateButton");
  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (!isMobile) {
        e.preventDefault();
        window.open(
          "https://www.google.com/calendar/render?action=TEMPLATE&text=Aldrin+&+Sharmaine+Wedding&dates=20270620T160000/20270620T200000&details=We+can’t+wait+to+celebrate+with+you!&location=Mary,+Mother+of+Good+Counsel+Parish+Church",
          "_blank"
        );
      }
    });
  }

  /* ----------------------------
     RSVP FORM SUBMISSION
  ---------------------------- */
  const rsvpForm = $(".rsvp-form");
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        name: rsvpForm.querySelector('[name="name"]').value,
        attendance: rsvpForm.querySelector('[name="attendance"]').value,
        message: rsvpForm.querySelector('[name="message"]').value
      };

      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbyMtejkOuP4GFjI2ubPV3DEmubOiLoxrASm7nWUBS6fZv5FRqd2RbMm217IZwoGPV-7/exec",
          {
            method: "POST",
            body: new URLSearchParams(data)
          }
        );
        const json = await res.json();
        if (json.status === "success") {
          rsvpForm.reset();
          launchRSVPConfetti();

          const popup = document.createElement("div");
          popup.textContent = "RSVP submitted! 💜";
          popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background-color: rgba(255,255,255,0.95);
            color: #9b779d;
            padding: 25px 40px;
            border-radius: 16px;
            font-size: 1.2rem;
            font-weight: 700;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            transition: transform 0.4s ease, opacity 0.4s ease;
          `;
          document.body.appendChild(popup);
          requestAnimationFrame(() => {
            popup.style.transform = "translate(-50%, -50%) scale(1)";
          });
          setTimeout(() => {
            popup.style.transform = "translate(-50%, -50%) scale(0)";
            popup.style.opacity = "0";
            setTimeout(() => popup.remove(), 400);
          }, 2000);
        } else {
          alert("Something went wrong. Please try again.");
        }
      } catch (err) {
        console.error(err);
        alert("Unable to submit RSVP. Please try again later.");
      }
    });
  }

  /* ----------------------------
     SETTINGS PANEL: BACKGROUND + MUSIC
  ---------------------------- */
  const settingsToggle = $("#settingsToggle");
  const settingsPanel = $("#settingsPanel");
  const bgButtons = $$(".bg-options button");
  const musicSelector = $("#musicSelector"); // select element inside settings for tracks
  const musicToggleBtn = $("#musicToggle"); // same toggle in nav

  // BACKGROUND
  const applyBackground = (file) => {
    if (!file) return;
    const url = encodeURI(`./assets/background/${file}`);
    document.body.style.backgroundImage = `url("${url}")`;
    localStorage.setItem("bodyBackground", file);
  };

  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener("click", () => {
      settingsPanel.style.display = settingsPanel.style.display === "block" ? "none" : "block";
    });
  }

  bgButtons.forEach(btn => {
    btn.addEventListener("click", () => applyBackground(btn.dataset.bg));
  });

  // Load saved background
  const savedBg = localStorage.getItem("bodyBackground");
  if (savedBg) applyBackground(savedBg);

  // MUSIC
  musicSelector?.addEventListener("change", () => {
    const track = musicSelector.value;
    if (track) {
      bgMusic.src = track;
      bgMusic.play();
      isPlaying = true;
      musicToggleBtn.textContent = "⏸";
      localStorage.setItem("bgMusicTrack", track);
    } else {
      bgMusic.pause();
      isPlaying = false;
      musicToggleBtn.textContent = "▶";
      localStorage.removeItem("bgMusicTrack");
    }
  });

  // Load saved track
  const savedTrack = localStorage.getItem("bgMusicTrack");
  if (savedTrack) {
    musicSelector.value = savedTrack;
    bgMusic.src = savedTrack;
    bgMusic.play();
    isPlaying = true;
    musicToggleBtn.textContent = "⏸";
  }

});
