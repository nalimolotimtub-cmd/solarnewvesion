// ===== Burger menu + year =====
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const year = document.getElementById("year");

if (year) year.textContent = new Date().getFullYear();

function setOpen(open) {
  if (!nav || !burger) return;

  nav.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");

  // lock scroll when mobile menu is open (safer than html overflow)
  document.body.classList.toggle("is-locked", open);
}

if (burger && nav) {
  if (!burger.hasAttribute("aria-controls")) burger.setAttribute("aria-controls", "nav");

  burger.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  // close after clicking a nav link
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  // close on outside click
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(e.target) || burger.contains(e.target)) return;
    setOpen(false);
  });

  // close on Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // close on resize/orientation change
  window.addEventListener("resize", () => setOpen(false));

  setOpen(false);
}

// =======================
// Simple autoplay slider + swipe
// =======================
(function initSlider() {
  const slider = document.querySelector(".slider");
  if (!slider) return;

  const track = slider.querySelector(".slider__track");
  const slides = Array.from(slider.querySelectorAll(".slider__slide"));
  const btnPrev = slider.querySelector(".slider__btn--prev");
  const btnNext = slider.querySelector(".slider__btn--next");
  const dotsWrap = slider.querySelector(".slider__dots");

  if (!track || slides.length === 0) return;

  const autoplay = slider.dataset.autoplay !== "false";
  const interval = Number(slider.dataset.interval || 4500);

  let index = 0;
  let timer = null;

  // clear dots (prevent duplicates if init runs again)
  if (dotsWrap) dotsWrap.innerHTML = "";

  // build dots
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slider__dot" + (i === 0 ? " is-active" : "");
    b.setAttribute("aria-label", `ไปสไลด์ที่ ${i + 1}`);
    b.addEventListener("click", () => goTo(i, true));
    dotsWrap && dotsWrap.appendChild(b);
    return b;
  });

  function update() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i, userAction = false) {
    index = (i + slides.length) % slides.length;
    update();
    if (userAction) restart();
  }

  function next(userAction = false) { goTo(index + 1, userAction); }
  function prev(userAction = false) { goTo(index - 1, userAction); }

  function start() {
    if (!autoplay) return;
    stop();
    timer = window.setInterval(() => next(false), interval);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function restart() {
    stop();
    start();
  }

  // buttons
  btnNext && btnNext.addEventListener("click", () => next(true));
  btnPrev && btnPrev.addEventListener("click", () => prev(true));

  // pause on hover (desktop)
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  // swipe (touch)
  let startX = 0;
  let deltaX = 0;
  let touching = false;

  slider.addEventListener("touchstart", (e) => {
    touching = true;
    startX = e.touches[0].clientX;
    deltaX = 0;
    stop();
  }, { passive: true });

  slider.addEventListener("touchmove", (e) => {
    if (!touching) return;
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });

  slider.addEventListener("touchend", () => {
    touching = false;
    const threshold = 40; // px
    if (deltaX > threshold) prev(true);
    else if (deltaX < -threshold) next(true);
    else restart();
    deltaX = 0;
  });

  // keyboard (requires tabindex in HTML)
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev(true);
    if (e.key === "ArrowRight") next(true);
  });

  // respect reduced motion
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) start();
  update();
})();