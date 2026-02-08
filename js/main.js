


document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     HELPERS
  ========================= */
  const $ = q => document.querySelector(q);
  const $$ = q => document.querySelectorAll(q);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const CONFETTI_COLORS = ["#ff6b6b","#feca57","#48dbfb","#1dd1a1","#5f27cd"];

  /* =========================
     BACKGROUND MUSIC
  ========================= */
  const bgMusic = $("#bgMusic");
  if(bgMusic) bgMusic.volume = 0.3;

  /* =========================
     COUNTDOWN TIMER
  ========================= */
  const targetDate = new Date("June 20, 2027 00:00:00").getTime();
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    const days = Math.floor(distance / (1000*60*60*24));
    const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
    const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
    const seconds = Math.floor((distance % (1000*60)) / 1000);
    $("#daysNumber").innerText = days > 0 ? days : 0;
    $("#hoursNumber").innerText = hours < 10 ? "0"+hours : hours;
    $("#minutesNumber").innerText = minutes < 10 ? "0"+minutes : minutes;
    $("#secondsNumber").innerText = seconds < 10 ? "0"+seconds : seconds;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* =========================
     SAVE THE DATE
  ========================= */
  const saveDateBtn = $("#saveDateBtn");
  if(saveDateBtn) saveDateBtn.addEventListener("click", () => {
    const title = "Wedding of A & S";
    const location = "Mary, Mother of Good Counsel Parish Church";
    const description = "We invite you to celebrate our wedding";
    const start = new Date("June 20, 2027 08:00:00 UTC");
    const end = new Date("June 20, 2027 12:00:00 UTC");
    const formatDate = d => d.toISOString().replace(/[-:]|\.\d{3}/g,"");

    // Google Calendar
    const gCalURL = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(start)}/${formatDate(end)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(gCalURL,"_blank");

    // ICS download
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "SaveTheDate.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });

  /* =========================
     AOS INIT
  ========================= */
  if(window.AOS) AOS.init({ duration:1000, once:true, easing:"ease-out-cubic" });

  /* =========================
     MOBILE NAV LABELS
  ========================= */
  if(window.innerWidth <= 480){
    $$(".nav-bottom .nav__links a").forEach(link=>{
      const label = link.querySelector("span");
      if(!label) return;
      Object.assign(label.style,{
        transition:"none",
        opacity:"1",
        transform:"translateY(0)",
        position:"static",
        bottom:"auto",
        background:"none",
        padding:"0",
        whiteSpace:"normal"
      });
    });
  }

  /* =========================
   RSVP FORM + CONFETTI
========================= */
function launchRSVPConfetti(){
  for(let i=0;i<35;i++){
    const piece = document.createElement("span");
    const size = Math.random() * 4 + 6; // 6-10px
    piece.style.cssText = `position:fixed; left:${Math.random()*100}vw; top:-10px; width:${size}px; height:${size}px; border-radius:50%; background:${["#ff6b6b","#feca57","#48dbfb","#1dd1a1","#5f27cd"][Math.floor(Math.random()*5)]}; z-index:9999; pointer-events:none;`;
    piece.animate([{ transform:"translateY(0) rotate(0)", opacity:1 }, { transform:`translateY(300px) rotate(${Math.random()*540+180}deg)`, opacity:0 }], { duration:2200, easing:"ease-out", fill:"forwards" });
    document.body.appendChild(piece);
    setTimeout(()=>piece.remove(),2300);
  }
}

const rsvpForm = document.querySelector(".rsvp-form");
const rsvpStatus = document.getElementById("rsvpMessageStatus");

if (rsvpForm && rsvpStatus) {
  rsvpForm.addEventListener("submit", async e => {
    e.preventDefault();

    // Show loading message
    rsvpStatus.textContent = "Sending...";
    rsvpStatus.style.opacity = 1;
    rsvpStatus.style.color = "#1d274b"; // neutral color

    const payload = new URLSearchParams({
      name: rsvpForm.name.value,
      attendance: rsvpForm.attendance.value,
      message: rsvpForm.message.value
    });

    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbyMtejkOuP4GFjI2ubPV3DEmubOiLoxrASm7nWUBS6fZv5FRqd2RbMm217IZwoGPV-7/exec",
        { method: "POST", body: payload }
      );

      const result = await res.json();

      if (result.status === "success") {
        rsvpForm.reset();
        launchRSVPConfetti();

        // Success message
        rsvpStatus.textContent = "RSVP submitted! 💜";
        rsvpStatus.style.color = "#d95fbc";

        // Hide after 5s
        setTimeout(() => { rsvpStatus.style.opacity = 0; }, 5000);
      } else {
        // Failed submission
        rsvpStatus.textContent = "Submission failed. Please try again.";
        rsvpStatus.style.color = "#ff6b6b";
      }
    } catch (err) {
      // Network or CORS error
      rsvpStatus.textContent = "Network error. Please try again later.";
      rsvpStatus.style.color = "#ff6b6b";
    }
  });
}

  /* =========================
     PRENUP GALLERY SLIDESHOW
  ========================= */
  const prenupGallery = $("#prenup-gallery");
  const PHOTOS_FOLDER = "assets/prenup/";
  const PHOTOS = ["1.jpg","2.jpg","3.jpg","4.jpg","5.jpg","6.jpg","7.jpg","8.jpg"]; // Add your prenup images here
  let currentSlide = 0;

  function renderPrenup(){
    if(!prenupGallery) return;
    prenupGallery.innerHTML = PHOTOS.map((src,i)=>`<img src="${PHOTOS_FOLDER}${src}" class="${i===0?'active':''}" loading="lazy" alt="Prenup Photo">`).join("");
    // Dots
    const dotsContainer = document.createElement("div");
    dotsContainer.id="prenup-dots";
    PHOTOS.forEach((_,i)=>{
      const dot = document.createElement("span");
      if(i===0) dot.classList.add("active");
      dot.addEventListener("click",()=>{ goToSlide(i); resetAutoplay(); });
      dotsContainer.appendChild(dot);
    });
    prenupGallery.after(dotsContainer);
  }

  function goToSlide(index){
    const imgs = prenupGallery.querySelectorAll("img");
    const dots = $("#prenup-dots").querySelectorAll("span");
    imgs.forEach((img,i)=> img.classList.toggle("active", i===index));
    dots.forEach((dot,i)=> dot.classList.toggle("active", i===index));
    currentSlide = index;
  }

  function nextSlide(){ goToSlide((currentSlide+1)%PHOTOS.length); }
  let autoplay = setInterval(nextSlide, 6000);
  function resetAutoplay(){ clearInterval(autoplay); autoplay = setInterval(nextSlide,4000); }

  renderPrenup();

  /* =========================
     GALLERY LIGHTBOX
  ========================= */
  let currentGallery=[], currentIndex=0;
  const popup = $("#drivePopup"), frame = $("#driveFrame"), caption = $("#driveCaption");

  function openPreview(fileId, title, galleryArray){
    currentGallery = galleryArray;
    currentIndex = galleryArray.findIndex(f=>f.id===fileId);
    frame.src = `https://drive.google.com/file/d/${fileId}/preview`;
    caption.textContent = title;
    popup.style.display = "flex";
    popup.style.opacity = 0;
    popup.style.transform = "translateY(20%)";
    requestAnimationFrame(()=>{ popup.style.opacity=1; popup.style.transform="translateY(0)"; });
  }

  function closePreview(){
    popup.style.transition="opacity 0.3s ease, transform 0.3s ease";
    popup.style.opacity=0;
    popup.style.transform="translateY(20%)";
    setTimeout(()=>{ frame.src=""; popup.style.display="none"; },300);
  }

  function slideTo(newIndex,direction){
    if(!currentGallery.length) return;
    const next=currentGallery[newIndex];
    if(!next?.id) return;
    const width=popup.offsetWidth;
    frame.style.transition="none";
    frame.style.transform=`translateX(${direction*width}px) scale(0.95)`;
    frame.src=`https://drive.google.com/file/d/${next.id}/preview`;
    caption.textContent=next.name;
    requestAnimationFrame(()=>{ frame.style.transition="transform 0.35s ease"; frame.style.transform="translateX(0px) scale(1)"; });
    currentIndex=newIndex;
  }

  const showNext=()=>slideTo((currentIndex+1)%currentGallery.length,1);
  const showPrev=()=>slideTo((currentIndex-1+currentGallery.length)%currentGallery.length,-1);

  $(".drive-close")?.addEventListener("click",closePreview);
  popup?.addEventListener("click",e=>{ if(e.target.id==="drivePopup") closePreview(); });
  document.addEventListener("keydown",e=>{
    if(popup.style.display!=="flex") return;
    if(e.key==="Escape") closePreview();
    if(e.key==="ArrowRight") showNext();
    if(e.key==="ArrowLeft") showPrev();
  });
/* =========================
   DETAILS MAP POPUP (2 hotspots)
========================= */
/* =========================
   DETAILS MAP POPUP
========================= */
const mapModal = document.getElementById("mapModal");
const mapFrame = document.getElementById("mapFrame");
const closeMap = document.getElementById("closeMap");
const mapButtons = document.querySelectorAll(".map-hotspot");

// Updated embed URLs with satellite view
// Updated map URLs (use the actual Google Maps embed links you generated)
// Updated map URLs (use the actual Google Maps embed links you generated)
const mapURLs = {
  ceremony: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10201.083379577898!2d121.02932810783388!3d14.477099163985272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cfa9f6d78d7d%3A0x4f91183a6be3af0c!2sMary%2C%20Mother%20of%20Good%20Counsel%20Parish%20Church%20-%20Marcelo%20Green%20Village%2C%20Marcelo%20Green%2C%20Para%C3%B1aque%20City%20(Diocese%20of%20Para%C3%B1aque)!5e1!3m2!1sen!2sph!4v1770565978649!5m2!1sen!2sph",
  reception: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10201.083379577898!2d121.02932810783388!3d14.477099163985272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cf36e13bcfff%3A0xf1e71c8ca60d00c9!2sThe%20Narra%20Tree%20Clubhouse!5e1!3m2!1sen!2sph!4v1770566016665!5m2!1sen!2sph"
};




// Open modal on button click
mapButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.map; // "ceremony" or "reception"
    mapFrame.src = mapURLs[key] || "";
    mapModal.style.display = "flex";
    document.body.style.overflow = "hidden"; // prevent background scroll
  });
});

// Close modal when clicking close button
closeMap.addEventListener("click", () => {
  mapModal.style.display = "none";
  mapFrame.src = ""; // clear iframe
  document.body.style.overflow = "auto";
});

// Close modal when clicking outside content
window.addEventListener("click", e => {
  if (e.target === mapModal) {
    mapModal.style.display = "none";
    mapFrame.src = "";
    document.body.style.overflow = "auto";
  }
});







  /* =========================
     TOUCH SWIPE
  ========================= */
  let touchStartX=0,touchStartY=0,touchEndX=0,touchEndY=0, swipeThreshold=50;
  popup?.addEventListener("touchstart",e=>{ touchStartX=e.changedTouches[0].screenX; touchStartY=e.changedTouches[0].screenY; });
  popup?.addEventListener("touchend",e=>{
    touchEndX=e.changedTouches[0].screenX;
    touchEndY=e.changedTouches[0].screenY;
    const diffX=touchEndX-touchStartX, diffY=touchEndY-touchStartY;
    if(Math.abs(diffX)>Math.abs(diffY) && Math.abs(diffX)>swipeThreshold) diffX<0?showNext():showPrev();
    else if(Math.abs(diffY)>Math.abs(diffX) && Math.abs(diffY)>swipeThreshold){
      const dir=diffY<0?-1:1;
      popup.style.transition="opacity 0.3s ease, transform 0.3s ease";
      popup.style.transform=`translateY(${dir*100}%)`;
      popup.style.opacity=0;
      setTimeout(closePreview,300);
    }
  });

});
