document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector(".site-header");
const progressBar = document.querySelector("[data-scroll-progress]");
const sections = [...document.querySelectorAll("[data-slide]")];
const scenes = [...document.querySelectorAll("[data-animation-section]")];
const rails = [...document.querySelectorAll("[data-token-rail]")];

document.querySelectorAll("[data-year]").forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

function renderIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
  }
}

function revealSections() {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -12%",
      threshold: 0.16,
    },
  );

  sections.forEach((section) => observer.observe(section));
  sections[0]?.classList.add("is-visible");
}

let scrollFrame = 0;

function updateScrollUI() {
  scrollFrame = 0;

  const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;

  header?.classList.toggle("is-scrolled", window.scrollY > 12);
  header?.style.setProperty("--scroll-progress", String(progress));
  progressBar?.style.setProperty("--scroll-progress", String(progress));

  if (progressBar) {
    progressBar.style.transform = `scaleX(${progress})`;
  }
}

function requestScrollUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollUI);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
updateScrollUI();

const sceneStates = new Map();

function syncScene(scene) {
  const state = sceneStates.get(scene);
  if (!state) return;

  const motionDisabled = reduceMotion.matches;
  const paused = motionDisabled || state.manuallyPaused;
  const active = state.inView && !motionDisabled;

  scene.classList.toggle("is-playing", active);
  scene.classList.toggle("is-paused", paused);
  scene.classList.toggle("is-reduced-motion", motionDisabled);

  if (state.toggle) {
    state.toggle.disabled = motionDisabled;
    state.toggle.setAttribute("aria-pressed", String(paused));
    state.toggle.setAttribute(
      "aria-label",
      motionDisabled
        ? "Animation disabled by reduced motion preference"
        : state.manuallyPaused
          ? "Play animation"
          : "Pause animation",
    );

    const label = state.toggle.querySelector("span");
    if (label) {
      label.textContent = motionDisabled ? "Reduced motion" : state.manuallyPaused ? "Play" : "Pause";
    }
  }

  if (state.replay) {
    state.replay.disabled = motionDisabled || state.manuallyPaused;
  }
}

function replayScene(scene) {
  const state = sceneStates.get(scene);
  if (!state || reduceMotion.matches || state.manuallyPaused) return;

  scene.classList.remove("is-playing");
  void scene.offsetWidth;
  if (state.inView) scene.classList.add("is-playing");
}

scenes.forEach((scene) => {
  const state = {
    inView: false,
    manuallyPaused: false,
    toggle: scene.querySelector("[data-animation-toggle]"),
    replay: scene.querySelector("[data-replay]"),
  };

  sceneStates.set(scene, state);

  state.toggle?.addEventListener("click", () => {
    if (reduceMotion.matches) return;
    state.manuallyPaused = !state.manuallyPaused;
    syncScene(scene);
  });

  state.replay?.addEventListener("click", () => replayScene(scene));
});

if ("IntersectionObserver" in window) {
  const sceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const state = sceneStates.get(entry.target);
        if (!state) return;
        state.inView = entry.isIntersecting;
        syncScene(entry.target);
      });
    },
    { threshold: 0.18 },
  );

  scenes.forEach((scene) => sceneObserver.observe(scene));
} else {
  scenes.forEach((scene) => {
    sceneStates.get(scene).inView = true;
    syncScene(scene);
  });
}

let travelFrame = 0;

function syncTravel() {
  travelFrame = 0;

  rails.forEach((rail) => {
    const train = rail.querySelector("[data-token-train]");
    if (!train) return;

    const vertical = rail.clientHeight > rail.clientWidth;
    rail.classList.toggle("is-vertical", vertical);

    const travelX = Math.max(0, Math.round(rail.clientWidth - train.offsetWidth));
    const travelY = Math.max(0, Math.round(rail.clientHeight - train.offsetHeight));
    const travel = vertical ? travelY : travelX;

    rail.style.setProperty("--travel", `${travel}px`);
    rail.style.setProperty("--travel-x", `${vertical ? 0 : travelX}px`);
    rail.style.setProperty("--travel-y", `${vertical ? travelY : 0}px`);
  });
}

function requestTravelSync() {
  if (travelFrame) return;
  travelFrame = window.requestAnimationFrame(syncTravel);
}

if ("ResizeObserver" in window) {
  const railObserver = new ResizeObserver(requestTravelSync);
  rails.forEach((rail) => railObserver.observe(rail));
}

window.addEventListener("resize", requestTravelSync, { passive: true });
window.addEventListener("load", requestTravelSync, { once: true });
document.fonts?.ready.then(requestTravelSync);
requestTravelSync();

function applyMotionPreference() {
  if (reduceMotion.matches) {
    sections.forEach((section) => section.classList.add("is-visible"));
  }

  scenes.forEach(syncScene);
}

if (reduceMotion.addEventListener) {
  reduceMotion.addEventListener("change", applyMotionPreference);
} else {
  reduceMotion.addListener(applyMotionPreference);
}

applyMotionPreference();
revealSections();
renderIcons();
window.addEventListener("load", renderIcons, { once: true });
