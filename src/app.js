const slides = [...document.querySelectorAll("[data-slide]")];
const railLinks = [...document.querySelectorAll("[data-rail]")];
const header = document.querySelector(".site-header");
const demo = document.querySelector(".feature-demo");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelector("[data-year]").textContent = String(new Date().getFullYear());

function renderIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
  }
}

function markSlideVisible(slide) {
  slide.classList.add("is-visible");
  const id = slide.dataset.slide;
  railLinks.forEach((link) => {
    const active = link.dataset.rail === id;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

const slideObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });

    if (visible) markSlideVisible(visible.target);
  },
  { threshold: [0.28, 0.55, 0.72] },
);

slides.forEach((slide) => slideObserver.observe(slide));
if (slides[0]) markSlideVisible(slides[0]);

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const tabs = [...document.querySelectorAll("[data-feature]")];
const panels = [...document.querySelectorAll("[data-panel]")];

function replayDemo() {
  if (!demo || demo.classList.contains("is-paused") || reduceMotion.matches) return;
  demo.classList.remove("is-playing");
  void demo.offsetWidth;
  demo.classList.add("is-playing");
}

function selectFeature(name, shouldFocus = false) {
  tabs.forEach((tab) => {
    const selected = tab.dataset.feature === name;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && shouldFocus) tab.focus();
  });

  panels.forEach((panel) => {
    const selected = panel.dataset.panel === name;
    panel.hidden = !selected;
    panel.classList.toggle("is-active", selected);
  });

  demo.dataset.demo = name;
  replayDemo();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectFeature(tab.dataset.feature));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    selectFeature(tabs[next].dataset.feature, true);
  });
});

selectFeature("request");

const animationToggle = document.querySelector("[data-animation-toggle]");
const replayButton = document.querySelector("[data-replay]");

function setPaused(paused) {
  if (!demo || !animationToggle) return;
  demo.classList.toggle("is-paused", paused);
  demo.classList.toggle("is-playing", !paused);
  animationToggle.setAttribute("aria-pressed", String(paused));
  animationToggle.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");
  const label = animationToggle.querySelector("span");
  if (label) label.textContent = paused ? "Play" : "Pause";
  const icon = animationToggle.querySelector("svg");
  if (icon) icon.setAttribute("data-lucide", paused ? "play" : "pause");
  if (replayButton) replayButton.disabled = paused;
  renderIcons();
}

animationToggle?.addEventListener("click", () => {
  if (reduceMotion.matches) return;
  setPaused(!demo.classList.contains("is-paused"));
});

replayButton?.addEventListener("click", replayDemo);

function applyMotionPreference() {
  if (!demo || !animationToggle) return;
  if (reduceMotion.matches) {
    setPaused(true);
    animationToggle.disabled = true;
    animationToggle.setAttribute("aria-label", "Animation disabled by reduced motion preference");
    const label = animationToggle.querySelector("span");
    if (label) label.textContent = "Reduced motion";
  } else {
    animationToggle.disabled = false;
    setPaused(false);
  }
}

reduceMotion.addEventListener?.("change", applyMotionPreference);
applyMotionPreference();

const featureSection = document.querySelector("#features");
if (featureSection && demo && !reduceMotion.matches) {
  const demoObserver = new IntersectionObserver(
    ([entry]) => {
      if (demo.classList.contains("is-paused")) return;
      demo.classList.toggle("is-playing", entry.isIntersecting);
    },
    { threshold: 0.25 },
  );
  demoObserver.observe(featureSection);
}

document.documentElement.classList.add("js");
renderIcons();
window.addEventListener("load", renderIcons, { once: true });
