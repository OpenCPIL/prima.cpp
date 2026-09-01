import { presetConversations } from "./preset-conversations.js?v=appended-presets-v2-20260823";
import { hy4ReplayData } from "./hy4-replay-data.js?v=hy4-prima-098-v11-20260828";
import { renderMarkdownInto } from "./markdown-renderer.js";

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector(".site-header");
const main = document.querySelector("main");
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

  const mainScrolls = window.innerWidth > 900 && ["home", "blog"].includes(document.body.dataset.route);
  const scrollTop = mainScrolls ? main?.scrollTop || 0 : window.scrollY;
  const scrollHeight = mainScrolls ? main?.scrollHeight || 0 : document.documentElement.scrollHeight;
  const viewportHeight = mainScrolls ? main?.clientHeight || window.innerHeight : window.innerHeight;
  const scrollable = Math.max(0, scrollHeight - viewportHeight);
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;

  header?.classList.toggle("is-scrolled", scrollTop > 12);
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
main?.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
updateScrollUI();

const routeViews = [...document.querySelectorAll("[data-route-view]")];
const routeLinks = [...document.querySelectorAll("[data-route-link]")];
const routeNames = new Set(["home", "playground", "blog"]);
const routeStorageKey = "prima-route";
const blogPostStorageKey = "prima-blog-post";
const blogPostTitles = new Map([
  ["inside-hy4-770b-experiment", "Inside the PRIMA Hy4 preview 770B Experiment: How We Ran It Across Two Machines"],
  ["workstation-already-in-room", "The workstation you need may already be in the room"],
  ["hunyuan4-770b-local-devices", "Scalability Matters More Than a Bigger Machine: What PRIMA’s Hy4 preview 770B Experiment Reveals About Local AI"],
]);
const blogPostNames = new Set(blogPostTitles.keys());
const blogIndexView = document.querySelector("[data-blog-index]");
const blogPostViews = [...document.querySelectorAll("[data-blog-post]")];
const blogLanguageStorageKey = "prima-blog-language";
const blogLanguageRoots = [...document.querySelectorAll("[data-blog-language-root]")];
const blogLanguagePanels = [...document.querySelectorAll("[data-blog-language-panel]")];
const blogLanguageButtons = [...document.querySelectorAll("[data-blog-language]")];
const blogPostChineseTitles = new Map([
  ["inside-hy4-770b-experiment", "解密 PRIMA：如何在两台异构设备上运行 Hy4 preview 770B"],
  ["hunyuan4-770b-local-devices", "不可忽视的可扩展性：PRIMA 的 Hy4 preview 770B 压测揭示本地 AI 新方向"],
]);
let activeBlogLanguage = "en";

try {
  if (window.sessionStorage.getItem(blogLanguageStorageKey) === "zh") activeBlogLanguage = "zh";
} catch {
  activeBlogLanguage = "en";
}

function blogPostTitle(post) {
  if (activeBlogLanguage === "zh" && blogPostChineseTitles.has(post)) return blogPostChineseTitles.get(post);
  return blogPostTitles.get(post);
}

function setBlogLanguage(language, { persist = true } = {}) {
  const mainScrollTop = main?.scrollTop || 0;
  const windowScrollTop = window.scrollY;
  activeBlogLanguage = language === "zh" ? "zh" : "en";

  blogLanguagePanels.forEach((panel) => {
    panel.hidden = panel.dataset.blogLanguagePanel !== activeBlogLanguage;
  });
  blogLanguageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.blogLanguage === activeBlogLanguage));
  });

  blogLanguageRoots.forEach((root) => {
    root.lang = activeBlogLanguage === "zh" ? "zh-CN" : "en";
    const activePanel = root.querySelector(`[data-blog-language-panel="${activeBlogLanguage}"]`);
    const activeTitle = activePanel?.querySelector("h1[id]");
    if (activeTitle) root.setAttribute("aria-labelledby", activeTitle.id);
  });

  if (persist) {
    try {
      window.sessionStorage.setItem(blogLanguageStorageKey, activeBlogLanguage);
    } catch {
      // The selected language still applies to the current page when storage is unavailable.
    }
  }

  const activePost = document.body.dataset.blogPost;
  if (blogPostNames.has(activePost) && blogPostChineseTitles.has(activePost)) {
    document.title = `${blogPostTitle(activePost)} — Prima Lab`;
  }

  // Swapping two long documents can trigger browser scroll anchoring. Keep the
  // reader at the same position, especially when switching languages near the top.
  blogLanguageRoots.forEach((root) => void root.offsetHeight);
  if (main) main.scrollTop = mainScrollTop;
  window.scrollTo(0, windowScrollTop);
  requestScrollUpdate();
}

blogLanguageButtons.forEach((button) => {
  button.addEventListener("click", () => setBlogLanguage(button.dataset.blogLanguage));
});

setBlogLanguage(activeBlogLanguage, { persist: false });

function routeFromPathname() {
  const segments = window.location.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const segment = segments.at(-1);
  if (routeNames.has(segment)) return segment;
  return segments.includes("blog") ? "blog" : null;
}

function blogPostFromPathname() {
  const segments = window.location.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const blogIndex = segments.lastIndexOf("blog");
  const post = blogIndex >= 0 ? segments[blogIndex + 1] : null;
  return blogPostNames.has(post) ? post : null;
}

function basePathFromLocation() {
  let path = window.location.pathname.replace(/\/+$/, "");
  path = path.replace(/\/index\.html$/, "");
  path = path.replace(/\/(?:home|playground|blog)(?:\/.*)?$/, "");
  return path === "/" ? "" : path;
}

const routeBasePath = basePathFromLocation();

function pathForRoute(route) {
  return `${routeBasePath}/${route}` || `/${route}`;
}

function pathForBlogPost(post) {
  return `${pathForRoute("blog")}/${post}`;
}

function currentRouteScrollTop() {
  return window.innerWidth > 900 ? main?.scrollTop || 0 : window.scrollY;
}

function setRouteScrollTop(scrollTop) {
  const nextScrollTop = Math.max(0, Number(scrollTop) || 0);
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  const previousScrollSnapType = root.style.scrollSnapType;
  const previousOverflowAnchor = root.style.overflowAnchor;

  root.style.scrollBehavior = "auto";
  root.style.scrollSnapType = "none";
  root.style.overflowAnchor = "none";

  const positionRoute = () => {
    if (window.innerWidth > 900) {
      if (main) main.scrollTop = nextScrollTop;
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, nextScrollTop);
      if (main) main.scrollTop = 0;
    }
  };

  positionRoute();
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      positionRoute();
      root.style.scrollBehavior = previousScrollBehavior;
      root.style.scrollSnapType = previousScrollSnapType;
      root.style.overflowAnchor = previousOverflowAnchor;
      updateScrollUI();
    });
  });
}

function applyRoute(route, scrollTop = 0, blogPost = null) {
  const nextRoute = routeNames.has(route) ? route : "home";
  const nextBlogPost = nextRoute === "blog" && blogPostNames.has(blogPost) ? blogPost : null;
  document.documentElement.dataset.route = nextRoute;
  document.body.dataset.route = nextRoute;
  if (nextBlogPost) document.body.dataset.blogPost = nextBlogPost;
  else delete document.body.dataset.blogPost;
  routeViews.forEach((view) => {
    view.hidden = view.dataset.routeView !== nextRoute;
  });
  if (blogIndexView) blogIndexView.hidden = nextRoute !== "blog" || Boolean(nextBlogPost);
  blogPostViews.forEach((post) => {
    post.hidden = nextRoute !== "blog" || post.dataset.blogPost !== nextBlogPost;
  });
  if (nextBlogPost) {
    const activePost = blogPostViews.find((post) => post.dataset.blogPost === nextBlogPost);
    activePost?.querySelectorAll("[data-blog-image]").forEach((image) => {
      if (!image.getAttribute("src")) {
        image.src = `${routeBasePath}/assets/${encodeURIComponent(image.dataset.blogImage)}`;
      }
    });
  }
  routeLinks.forEach((link) => {
    if (link.dataset.routeLink === nextRoute) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.title =
    nextRoute === "playground"
      ? "Prima Lab — Playground"
      : nextBlogPost
        ? `${blogPostTitle(nextBlogPost)} — Prima Lab`
        : nextRoute === "blog"
          ? "Prima Lab — Blog"
        : "Prima Lab — Local AI, beyond one device";
  setRouteScrollTop(scrollTop);
}

function saveCurrentRouteScroll() {
  const stateRoute = history.state?.route || routeFromPathname() || document.body.dataset.route || "home";
  const stateBlogPost = stateRoute === "blog" ? history.state?.blogPost || blogPostFromPathname() : null;
  history.replaceState(
    { ...history.state, route: stateRoute, blogPost: stateBlogPost, scrollTop: currentRouteScrollTop() },
    "",
    stateBlogPost ? pathForBlogPost(stateBlogPost) : pathForRoute(stateRoute),
  );
}

function navigateToRoute(route) {
  const currentRoute = document.body.dataset.route || "home";
  if (route === currentRoute) {
    if (route === "blog" && document.body.dataset.blogPost) {
      saveCurrentRouteScroll();
      history.pushState({ route: "blog", blogPost: null, scrollTop: 0 }, "", pathForRoute("blog"));
      applyRoute("blog", 0, null);
      return;
    }
    setRouteScrollTop(0);
    return;
  }
  saveCurrentRouteScroll();
  history.pushState({ route, blogPost: null, scrollTop: 0 }, "", pathForRoute(route));
  applyRoute(route, 0, null);
}

routeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateToRoute(link.dataset.routeLink);
  });
});

document.querySelectorAll("[data-blog-post-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const blogPost = link.dataset.blogPostLink;
    if (!blogPostNames.has(blogPost)) return;
    event.preventDefault();
    saveCurrentRouteScroll();
    history.pushState({ route: "blog", blogPost, scrollTop: 0 }, "", pathForBlogPost(blogPost));
    applyRoute("blog", 0, blogPost);
  });
});

document.querySelectorAll("[data-blog-index-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateToRoute("blog");
  });
});

window.addEventListener("popstate", (event) => {
  const route = event.state?.route || routeFromPathname() || "home";
  const blogPost = route === "blog" ? event.state?.blogPost || blogPostFromPathname() : null;
  applyRoute(route, event.state?.scrollTop || 0, blogPost);
});

history.scrollRestoration = "manual";
let storedRoute = null;
let storedBlogPost = null;
try {
  storedRoute = window.sessionStorage.getItem(routeStorageKey);
  storedBlogPost = window.sessionStorage.getItem(blogPostStorageKey);
  window.sessionStorage.removeItem(routeStorageKey);
  window.sessionStorage.removeItem(blogPostStorageKey);
} catch {
  storedRoute = null;
  storedBlogPost = null;
}
const hashRoute = window.location.hash === "#simulation" ? "playground" : window.location.hash === "#intro" ? "home" : null;
const initialRoute = routeFromPathname() || (routeNames.has(storedRoute) ? storedRoute : null) || hashRoute || "home";
const initialBlogPost =
  initialRoute === "blog" && blogPostNames.has(storedBlogPost)
    ? storedBlogPost
    : initialRoute === "blog"
      ? blogPostFromPathname()
      : null;
history.replaceState(
  { route: initialRoute, blogPost: initialBlogPost, scrollTop: 0 },
  "",
  initialBlogPost ? pathForBlogPost(initialBlogPost) : pathForRoute(initialRoute),
);
applyRoute(initialRoute, 0, initialBlogPost);

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

function initMeasuredPlayback() {
  const form = document.querySelector("[data-sim-form]");
  if (!form) return;

  const testbedSelect = document.querySelector("[data-sim-testbed]");
  const serverImage = document.querySelector("[data-sim-server-image]");
  const serverGpu = document.querySelector("[data-sim-server-gpu]");
  const serverVram = document.querySelector("[data-sim-server-vram]");
  const serverSummary = document.querySelector("[data-sim-server-summary]");
  const prompt = form.querySelector("[data-sim-prompt]");
  const output = form.querySelector("[data-sim-output]");
  const send = form.querySelector("[data-sim-send]");
  const reset = form.querySelector("[data-sim-reset]");
  const pause = form.querySelector("[data-sim-pause]");
  const model = form.querySelector("[data-sim-model]");
  const dflash = form.querySelector("[data-sim-dflash]");
  const dflashControl = form.querySelector("[data-sim-dflash-control]");
  const dflashState = form.querySelector("[data-sim-dflash-state]");
  const status = form.querySelector("[data-sim-status]");
  const elapsed = form.querySelector("[data-sim-elapsed]");
  const tokenCount = form.querySelector("[data-sim-token-count]");
  const rate = form.querySelector("[data-sim-rate]");
  const packetStream = document.querySelector("[data-sim-packet-stream]");
  const simulator = form.closest("[data-simulator]") || form;
  const simulationSection = form.closest("[data-slide]") || simulator;
  const results = [...form.querySelectorAll("[data-sim-result]")].map((panel) => ({
    id: panel.dataset.simResultId,
    panel,
    output: panel.querySelector("[data-sim-result-output]"),
    status: panel.querySelector("[data-sim-result-status]"),
    elapsed: panel.querySelector("[data-sim-result-elapsed]"),
    tokenCount: panel.querySelector("[data-sim-result-token-count]"),
    rateOutput: panel.querySelector("[data-sim-result-rate-output]"),
    rateOff: Number(panel.dataset.simRateOff || 0),
    rateOn: Number(panel.dataset.simRateOn || 0),
    ttftOff: Number(panel.dataset.simTtftOff || 0),
    ttftOn: Number(panel.dataset.simTtftOn || 0),
    playbackRate: Number(panel.dataset.simRateOn || 0),
    ttftMs: Number(panel.dataset.simTtftOn || 0),
    recordedEvents: null,
    observedMeanInterEventSeconds: null,
    visibleTokens: 0,
  }));

  if (!(testbedSelect instanceof HTMLSelectElement) || !(serverImage instanceof HTMLImageElement) || !serverGpu || !serverVram || !serverSummary || !prompt || !output || !send || !reset || !pause || !model || !dflash || !status || !elapsed || !tokenCount || !rate || results.length !== 3 || results.some((result) => !result.id || !result.output || !result.status || !result.elapsed || !result.tokenCount || !result.rateOutput)) {
    return;
  }

  let playbackRate = 15.2;
  const defaultTestbed = "testbed-1";
  const defaultPrompt = presetConversations[0].id;
  const presetResponses = new Map(presetConversations.map((preset) => [preset.id, preset]));
  const promptOptions = new Map([
    ["testbed-1", Object.entries(hy4ReplayData.prompts).map(([value, replay]) => ({ value, label: replay.prompt }))],
    ["testbed-2", presetConversations.map((preset) => ({ value: preset.id, label: preset.prompt }))],
  ]);
  const testbedConfigurations = new Map([
    ["testbed-1", {
      label: "TESTBED 1",
      model: "hy4-770b-iq1",
      prompt: "model-name",
      dflash: false,
      serverImage: "./assets/gpu-server-a4000-x4.webp",
      serverImageAlt: "GPU server tower with four small A4000-class GPU cards beside it",
      serverGpu: "NVIDIA RTX A4000 x4",
      serverGpuCount: "4",
      serverVram: "16 GB x4",
      serverSummary: "Remote LAN · subnet B. GPU server with an Intel Core i7-12700 CPU, four NVIDIA RTX A4000 GPUs with 16 GB VRAM each, 32 GB system memory, 1 gigabit per second uplink and downlink, and RTT approximately 50 milliseconds.",
    }],
    ["testbed-2", {
      label: "TESTBED 2",
      model: "qwen38-27b-q8",
      prompt: defaultPrompt,
      dflash: true,
      serverImage: "./assets/gpu-server-a4000.webp",
      serverImageAlt: "GPU server tower with one small A4000-class GPU card beside it",
      serverGpu: "NVIDIA RTX A4000 x1",
      serverGpuCount: "1",
      serverVram: "16 GB",
      serverSummary: "Remote LAN · subnet B. GPU server with an Intel Core i7-12700 CPU, one NVIDIA RTX A4000 GPU with 16 GB VRAM, 32 GB system memory, 1 gigabit per second uplink and downlink, and RTT approximately 50 milliseconds.",
    }],
  ]);
  const modelTestbeds = new Map([
    ["hy4-770b-iq1", ["testbed-1"]],
    ["qwen38-27b-q8", ["testbed-2"]],
  ]);

  function makePlaybackTokens(preset) {
    const tokens = Array.isArray(preset.tokens) ? preset.tokens : [];
    if (tokens.length !== preset.tokenCount || tokens.join("") !== preset.output) {
      throw new Error(`Invalid playback token sequence for preset: ${preset.id}`);
    }
    return [...tokens];
  }

  function syncPromptOptions(testbedId) {
    const options = promptOptions.get(testbedId) || promptOptions.get(defaultTestbed);
    prompt.replaceChildren(...options.map(({ value, label }) => new Option(label, value)));
  }

  function syncTestbedOptions(modelId, preferredTestbedId) {
    const availableTestbeds = modelTestbeds.get(modelId) || [defaultTestbed];
    const selectedTestbed = availableTestbeds.includes(preferredTestbedId)
      ? preferredTestbedId
      : availableTestbeds[0];
    testbedSelect.replaceChildren(...availableTestbeds.map((testbedId) => {
      const configuration = testbedConfigurations.get(testbedId);
      return new Option(configuration?.label || testbedId.toUpperCase(), testbedId);
    }));
    testbedSelect.value = selectedTestbed;
    return selectedTestbed;
  }

  let playbackTokens = makePlaybackTokens(presetResponses.get(defaultPrompt));
  let simulatedDurationMs = 0;
  let playbackState = "idle";
  let playbackFrame = 0;
  let elapsedMs = 0;
  let lastFrameTime = 0;
  let visibleTokens = 0;
  let simulationInView = true;
  let suspensionReason = "outside viewport";

  prompt.value = prompt.value.trim() || defaultPrompt;
  playbackTokens = makePlaybackTokens(presetResponses.get(prompt.value) || presetResponses.get(defaultPrompt));

  function isDflashEnabled() {
    if (dflash instanceof HTMLInputElement) return dflash.checked;
    return dflash.getAttribute("aria-checked") !== "false";
  }

  function setDflashEnabled(enabled) {
    if (dflash instanceof HTMLInputElement) dflash.checked = enabled;
    dflash.setAttribute("aria-checked", String(enabled));
  }

  function supportsDflash() {
    return testbedSelect.value === "testbed-2" && model instanceof HTMLSelectElement && model.value === "qwen38-27b-q8";
  }

  function getRecordedPrompt() {
    if (testbedSelect.value !== "testbed-1" || !(model instanceof HTMLSelectElement) || model.value !== "hy4-770b-iq1") return null;
    return hy4ReplayData.prompts[prompt.value] || null;
  }

  function hasPlaybackData() {
    return supportsDflash() || Boolean(getRecordedPrompt());
  }

  function formatTokenRate(value) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  function formatReplayTpot(value) {
    const fractionDigits = value < 1 ? 2 : 1;
    return value.toLocaleString("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }

  function getResultEventCount(result) {
    return result.recordedEvents?.length ?? playbackTokens.length;
  }

  function getResultDurationMs(result) {
    if (result.recordedEvents?.length) return result.recordedEvents.at(-1)[0] * 1000;
    if (result.playbackRate <= 0 || playbackTokens.length === 0) return 0;
    const generationDurationMs = ((Math.max(0, playbackTokens.length - 1)) / result.playbackRate) * 1000;
    return result.ttftMs + generationDurationMs;
  }

  function getVisibleTokenCount(result) {
    if (result.recordedEvents) {
      let low = 0;
      let high = result.recordedEvents.length;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (result.recordedEvents[middle][0] * 1000 <= elapsedMs) low = middle + 1;
        else high = middle;
      }
      return low;
    }
    if (result.playbackRate <= 0 || elapsedMs < result.ttftMs || playbackTokens.length === 0) return 0;
    const generationElapsedMs = Math.max(0, elapsedMs - result.ttftMs);
    return Math.min(playbackTokens.length, 1 + Math.floor((generationElapsedMs / 1000) * result.playbackRate));
  }

  function syncResultRates() {
    const recordedPrompt = getRecordedPrompt();
    if (recordedPrompt) {
      results.forEach((result) => {
        const measurement = recordedPrompt.results[result.id];
        const sourceEvents = measurement?.replayExcludesFinalEos
          ? measurement.events.slice(0, -1)
          : measurement?.events;
        const firstTokenAtSeconds = sourceEvents?.[0]?.[0] ?? 0;
        let removedReplaySeconds = 0;
        result.recordedEvents = sourceEvents?.map(([atSeconds, gapSeconds, delta, ...metadata], index) => {
          const tokenOrdinal = index + 1;
          const overriddenGapSeconds = measurement.replayGapOverridesSeconds?.[tokenOrdinal] ?? gapSeconds;
          const replayGapSeconds = overriddenGapSeconds === null
            ? null
            : Math.max(0, overriddenGapSeconds + (measurement.replayGapAdjustmentSeconds ?? 0));
          if (gapSeconds !== null && replayGapSeconds < gapSeconds) {
            removedReplaySeconds += gapSeconds - replayGapSeconds;
          }
          return [
            Math.max(0, atSeconds - firstTokenAtSeconds - removedReplaySeconds),
            replayGapSeconds,
            delta,
            ...metadata,
          ];
        }) || null;
        result.observedMeanInterEventSeconds = measurement?.replayTpotSeconds
          ?? measurement?.requestLevelAverageTpotSeconds
          ?? measurement?.observedMeanInterTokenSeconds
          ?? measurement?.observedMeanInterEventSeconds
          ?? null;
        result.ttftMs = 0;
        result.playbackRate = result.observedMeanInterEventSeconds ? 1 / result.observedMeanInterEventSeconds : 0;
        result.panel.classList.toggle("is-measurement-missing", !measurement);
      });
      playbackRate = results.find((result) => result.id === "prima")?.playbackRate || 0;
      simulatedDurationMs = Math.max(...results.map(getResultDurationMs), 0);
      return;
    }

    const dflashEnabled = isDflashEnabled();
    results.forEach((result) => {
      result.recordedEvents = null;
      result.observedMeanInterEventSeconds = null;
      result.playbackRate = dflashEnabled ? result.rateOn : result.rateOff;
      result.ttftMs = 0;
      result.panel.classList.toggle("is-measurement-missing", result.playbackRate === 0);
    });
    const measuredRates = results.map((result) => result.playbackRate).filter((resultRate) => resultRate > 0);
    playbackRate = measuredRates.length ? Math.min(...measuredRates) : 0;
    simulatedDurationMs = Math.max(...results.map(getResultDurationMs), 0);
  }

  function syncConfiguration() {
    const dflashAvailable = supportsDflash();
    if (dflashControl) dflashControl.hidden = !dflashAvailable;
    if (!dflashAvailable) setDflashEnabled(false);
    syncResultRates();
  }

  function setButtonLabel(button, label) {
    const labelNode = button.querySelector("[data-label], span");
    if (labelNode) labelNode.textContent = label;
  }

  function cancelPlaybackFrame() {
    if (!playbackFrame) return;
    window.cancelAnimationFrame(playbackFrame);
    playbackFrame = 0;
  }

  function setOutputText(result, text) {
    renderMarkdownInto(result.output, text);
  }

  function updateTelemetry() {
    const recordedReplay = Boolean(getRecordedPrompt());
    const available = hasPlaybackData();
    elapsed.textContent = `${(elapsedMs / 1000).toFixed(1)} s`;
    tokenCount.textContent = playbackState === "idle" || playbackState === "unavailable" ? "0" : `${visibleTokens}`;
    rate.textContent = recordedReplay
      ? `${formatReplayTpot(getRecordedPrompt().results.prima.replayTpotSeconds)} s/tok`
      : available
        ? `${formatTokenRate(playbackRate)} tok/s`
        : "—";

    results.forEach((result) => {
      const resultDurationMs = getResultDurationMs(result);
      const resultElapsedMs = Math.min(elapsedMs, resultDurationMs);
      result.elapsed.textContent = `${(resultElapsedMs / 1000).toFixed(1)} s`;
      result.tokenCount.textContent = playbackState === "idle" || playbackState === "unavailable" ? "0" : `${result.visibleTokens}`;
      result.rateOutput.textContent = recordedReplay
        ? result.observedMeanInterEventSeconds
          ? `${formatReplayTpot(result.observedMeanInterEventSeconds)} s/tok`
          : "—"
        : available
          ? `${formatTokenRate(result.playbackRate)} tok/s`
          : "—";
      result.rateOutput.title = recordedReplay ? "Average replay time per output token" : "Measured output rate";
      const waitingForFirstToken = playbackState === "streaming" && result.playbackRate > 0 && elapsedMs < result.ttftMs;
      result.panel.classList.toggle("is-awaiting-first-token", waitingForFirstToken);
      if (playbackState === "streaming") {
        if (result.playbackRate === 0) result.status.textContent = "Unavailable";
        else if (waitingForFirstToken) result.status.textContent = "Waiting";
        else if (result.visibleTokens >= getResultEventCount(result)) result.status.textContent = "Complete";
        else result.status.textContent = "Running";
      }
    });

    const totalEvents = Math.max(...results.map(getResultEventCount), 0);
    const progress = totalEvents ? visibleTokens / totalEvents : 0;
    packetStream?.style.setProperty("--sim-progress", progress.toFixed(4));
    packetStream?.style.setProperty("--sim-progress-percent", `${(progress * 100).toFixed(2)}%`);
    if (packetStream) packetStream.dataset.pulse = String(visibleTokens % 4);
  }

  function updateInterface() {
    const enabled = hasPlaybackData();
    const active = playbackState === "streaming" || playbackState === "paused" || playbackState === "suspended";
    const streaming = playbackState === "streaming";

    simulator.dataset.simState = playbackState;
    simulator.classList.toggle("is-streaming", streaming);
    simulator.classList.toggle("is-paused", playbackState === "paused" || playbackState === "suspended");
    simulator.classList.toggle("is-suspended", playbackState === "suspended");
    simulator.classList.toggle("is-complete", playbackState === "complete");
    simulator.classList.toggle("is-unavailable", !enabled);

    packetStream?.classList.toggle("is-active", streaming);
    packetStream?.classList.toggle("is-paused", playbackState === "paused" || playbackState === "suspended");

    results.forEach((result) => result.output.setAttribute("aria-busy", String(streaming)));
    send.disabled = !enabled;
    send.classList.toggle("is-stop", active);
    send.setAttribute("aria-label", active ? "Stop all simulations" : "Run all simulations from the beginning");
    setButtonLabel(send, active ? "Stop" : "Run");
    pause.disabled = !active || playbackState === "suspended";
    pause.setAttribute("aria-pressed", String(playbackState === "paused"));
    pause.setAttribute("aria-label", playbackState === "paused" ? "Resume measured output simulation" : "Pause measured output simulation");
    setButtonLabel(pause, playbackState === "paused" ? "Resume" : "Pause");
    reset.disabled = playbackState === "idle" || playbackState === "unavailable";

    if ("disabled" in dflash) dflash.disabled = active;
    dflash.setAttribute("aria-disabled", String(active));

    if (dflashState) {
      dflashState.textContent = isDflashEnabled()
        ? active
          ? "ON · playback in progress"
          : "ON · DFlash2 measurements"
        : "OFF · standard measurements";
    }

    const statusText = {
      idle: "Ready",
      unavailable: "Unavailable",
      streaming: "Running",
      paused: "Paused",
      suspended: `Paused · ${suspensionReason}`,
      stopped: "Stopped",
      complete: "Complete",
    };
    status.textContent = statusText[playbackState];
    results.forEach((result) => {
      const resultComplete = result.playbackRate > 0 && result.visibleTokens >= getResultEventCount(result);
      if (result.playbackRate === 0) result.status.textContent = "Unavailable";
      else if (playbackState === "streaming" && resultComplete) result.status.textContent = "Complete";
      else result.status.textContent = statusText[playbackState];
    });
    updateTelemetry();
  }

  function renderVisibleTokens() {
    visibleTokens = 0;
    results.forEach((result) => {
      const nextVisibleTokens = getVisibleTokenCount(result);
      if (nextVisibleTokens !== result.visibleTokens || result.playbackRate === 0) {
        result.visibleTokens = nextVisibleTokens;
        const visibleOutput = result.recordedEvents
          ? result.recordedEvents.slice(0, result.visibleTokens).map((event) => event[2]).join("")
          : playbackTokens.slice(0, result.visibleTokens).join("");
        setOutputText(
          result,
          result.visibleTokens > 0
            ? visibleOutput
            : result.playbackRate === 0
              ? "No measured playback for this configuration."
              : "",
        );
      }
      visibleTokens = Math.max(visibleTokens, result.visibleTokens);
    });
    updateTelemetry();
  }

  function completePlayback() {
    cancelPlaybackFrame();
    elapsedMs = simulatedDurationMs;
    renderVisibleTokens();
    playbackState = "complete";
    updateInterface();
  }

  function playbackTick(timestamp) {
    if (playbackState !== "streaming") return;

    const frameDelta = Math.max(0, timestamp - lastFrameTime);
    lastFrameTime = timestamp;
    elapsedMs = Math.min(simulatedDurationMs, elapsedMs + frameDelta);

    renderVisibleTokens();

    if (elapsedMs >= simulatedDurationMs) {
      completePlayback();
      return;
    }

    playbackFrame = window.requestAnimationFrame(playbackTick);
  }

  function resetPlayback() {
    cancelPlaybackFrame();
    elapsedMs = 0;
    visibleTokens = 0;
    playbackState = hasPlaybackData() ? "idle" : "unavailable";
    results.forEach((result) => {
      result.visibleTokens = 0;
      setOutputText(
        result,
        result.playbackRate > 0
          ? "Press Run to begin."
          : hasPlaybackData()
            ? "No measured playback for this configuration."
            : "No measured playback for this model.",
      );
    });
    updateInterface();
  }

  function applyTestbedConfiguration(testbedId) {
    const resolvedTestbed = testbedConfigurations.has(testbedId) ? testbedId : defaultTestbed;
    const configuration = testbedConfigurations.get(resolvedTestbed);
    model.value = configuration.model;
    syncTestbedOptions(configuration.model, resolvedTestbed);
    syncPromptOptions(resolvedTestbed);
    prompt.value = configuration.prompt;
    serverImage.src = configuration.serverImage;
    serverImage.alt = configuration.serverImageAlt;
    serverGpu.textContent = configuration.serverGpu;
    serverGpu.dataset.simGpuCount = configuration.serverGpuCount;
    serverVram.textContent = configuration.serverVram;
    serverSummary.textContent = configuration.serverSummary;
    setDflashEnabled(configuration.dflash);
    if (resolvedTestbed === "testbed-2") {
      playbackTokens = makePlaybackTokens(presetResponses.get(configuration.prompt) || presetResponses.get(defaultPrompt));
    }
    syncConfiguration();
    resetPlayback();
  }

  function startPlayback() {
    if (!hasPlaybackData()) {
      resetPlayback();
      return;
    }

    cancelPlaybackFrame();
    elapsedMs = 0;
    visibleTokens = 0;
    results.forEach((result) => {
      result.visibleTokens = 0;
      setOutputText(result, result.playbackRate === 0 ? "No measured playback for this configuration." : "");
    });

    if (reduceMotion.matches) {
      completePlayback();
      return;
    }

    playbackState = "streaming";
    lastFrameTime = performance.now();
    renderVisibleTokens();
    updateInterface();
    syncAutomaticPlayback();
    if (playbackState === "streaming") playbackFrame = window.requestAnimationFrame(playbackTick);
  }

  function stopPlayback() {
    cancelPlaybackFrame();
    playbackState = "stopped";
    updateInterface();
  }

  function syncAutomaticPlayback() {
    const shouldSuspend = document.hidden || !simulationInView;

    if (playbackState === "streaming" && shouldSuspend) {
      cancelPlaybackFrame();
      suspensionReason = document.hidden ? "tab inactive" : "outside viewport";
      playbackState = "suspended";
      updateInterface();
      return;
    }

    if (playbackState === "suspended" && !shouldSuspend) {
      playbackState = "streaming";
      lastFrameTime = performance.now();
      updateInterface();
      playbackFrame = window.requestAnimationFrame(playbackTick);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (playbackState === "streaming" || playbackState === "paused" || playbackState === "suspended") {
      stopPlayback();
      return;
    }
    startPlayback();
  });

  pause.addEventListener("click", () => {
    if (playbackState === "streaming") {
      cancelPlaybackFrame();
      playbackState = "paused";
      updateInterface();
      return;
    }

    if (playbackState === "paused") {
      playbackState = "streaming";
      lastFrameTime = performance.now();
      updateInterface();
      playbackFrame = window.requestAnimationFrame(playbackTick);
    }
  });

  reset.addEventListener("click", resetPlayback);

  if (dflash instanceof HTMLInputElement) {
    dflash.addEventListener("change", () => {
      syncResultRates();
      resetPlayback();
    });
  } else {
    dflash.addEventListener("click", () => {
      if (playbackState === "streaming" || playbackState === "paused") return;
      setDflashEnabled(!isDflashEnabled());
      syncResultRates();
      resetPlayback();
    });
  }

  model.addEventListener("change", () => {
    const testbedId = syncTestbedOptions(model.value, testbedSelect.value);
    applyTestbedConfiguration(testbedId);
  });

  prompt.addEventListener("change", () => {
    if (testbedSelect.value === "testbed-2") {
      playbackTokens = makePlaybackTokens(presetResponses.get(prompt.value) || presetResponses.get(defaultPrompt));
    }
    syncResultRates();
    resetPlayback();
  });

  testbedSelect.addEventListener("change", () => applyTestbedConfiguration(testbedSelect.value));

  document.addEventListener("visibilitychange", syncAutomaticPlayback);

  if ("IntersectionObserver" in window) {
    const playbackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== simulationSection) return;
          simulationInView = entry.isIntersecting;
          syncAutomaticPlayback();
        });
      },
      { threshold: 0.08 },
    );
    playbackObserver.observe(simulationSection);
  }

  function applySimulationMotionPreference() {
    if (reduceMotion.matches && (playbackState === "streaming" || playbackState === "paused" || playbackState === "suspended")) {
      completePlayback();
    }
  }

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", applySimulationMotionPreference);
  } else {
    reduceMotion.addListener(applySimulationMotionPreference);
  }

  applyTestbedConfiguration(testbedSelect.value);
}

initMeasuredPlayback();
