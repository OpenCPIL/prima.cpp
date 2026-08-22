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

function initMeasuredPlayback() {
  const form = document.querySelector("[data-sim-form]");
  if (!form) return;

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
    panel,
    output: panel.querySelector("[data-sim-result-output]"),
    status: panel.querySelector("[data-sim-result-status]"),
    elapsed: panel.querySelector("[data-sim-result-elapsed]"),
    tokenCount: panel.querySelector("[data-sim-result-token-count]"),
    rateOutput: panel.querySelector("[data-sim-result-rate-output]"),
    playbackRate: Number(panel.dataset.simResultRate || 0),
    paragraph: document.createElement("p"),
    visibleTokens: 0,
  }));

  if (!prompt || !output || !send || !reset || !pause || !model || !dflash || !status || !elapsed || !tokenCount || !rate || results.length !== 3 || results.some((result) => !result.output || !result.status || !result.elapsed || !result.tokenCount || !result.rateOutput)) {
    return;
  }

  const playbackRate = 15;
  const defaultPrompt = "Explain how two heterogeneous devices can collaborate on AI inference across different networks.";
  const fixedResponse =
    "PRIMA treats the Home Laptop and GPU server as one heterogeneous inference pool. The laptop contributes local acceleration over Wi-Fi, while the remote server contributes additional compute across the VPN-connected LAN boundary. Work is coordinated across both devices using the measured wireless path, allowing the Q8 model trace to be replayed without pretending this browser is running the model.";

  function makePlaybackTokens(text) {
    const pieces = text.match(/\s+|[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) || [];
    const tokens = [];
    let whitespace = "";

    pieces.forEach((piece) => {
      if (/^\s+$/.test(piece)) {
        whitespace += piece;
      } else {
        tokens.push(`${whitespace}${piece}`);
        whitespace = "";
      }
    });

    if (whitespace && tokens.length) tokens[tokens.length - 1] += whitespace;
    return tokens;
  }

  const playbackTokens = makePlaybackTokens(fixedResponse);
  const simulatedDurationMs = (playbackTokens.length / playbackRate) * 1000;
  let playbackState = "idle";
  let playbackFrame = 0;
  let elapsedMs = 0;
  let lastFrameTime = 0;
  let visibleTokens = 0;
  let simulationInView = true;
  let suspensionReason = "outside viewport";

  prompt.value = prompt.value.trim() || defaultPrompt;
  prompt.readOnly = true;

  function isDflashEnabled() {
    if (dflash instanceof HTMLInputElement) return dflash.checked;
    return dflash.getAttribute("aria-checked") !== "false";
  }

  function setDflashEnabled(enabled) {
    if (dflash instanceof HTMLInputElement) dflash.checked = enabled;
    dflash.setAttribute("aria-checked", String(enabled));
  }

  function supportsDflash() {
    return model instanceof HTMLSelectElement && model.value === "qwen38-27b-q8";
  }

  function syncConfiguration() {
    const dflashAvailable = supportsDflash();
    if (dflashControl) dflashControl.hidden = !dflashAvailable;
    if (!dflashAvailable) setDflashEnabled(false);
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
    result.paragraph.textContent = text;
    if (result.output.firstElementChild !== result.paragraph || result.output.childElementCount !== 1) {
      result.output.replaceChildren(result.paragraph);
    }
  }

  function updateTelemetry() {
    const enabled = isDflashEnabled();
    elapsed.textContent = `${(elapsedMs / 1000).toFixed(1)} s`;
    tokenCount.textContent = playbackState === "idle" || playbackState === "unavailable" ? "0" : `${visibleTokens} / ${playbackTokens.length}`;
    rate.textContent = enabled ? `${playbackRate.toFixed(1)} tok/s` : "—";

    results.forEach((result) => {
      result.elapsed.textContent = `${(elapsedMs / 1000).toFixed(1)} s`;
      result.tokenCount.textContent = playbackState === "idle" || playbackState === "unavailable" ? "0" : `${result.visibleTokens} / ${playbackTokens.length}`;
      result.rateOutput.textContent = enabled ? `${result.playbackRate.toFixed(1)} tok/s` : "—";
    });

    const progress = playbackTokens.length ? visibleTokens / playbackTokens.length : 0;
    packetStream?.style.setProperty("--sim-progress", progress.toFixed(4));
    packetStream?.style.setProperty("--sim-progress-percent", `${(progress * 100).toFixed(2)}%`);
    if (packetStream) packetStream.dataset.pulse = String(visibleTokens % 4);
  }

  function updateInterface() {
    const enabled = isDflashEnabled();
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
    send.setAttribute("aria-label", active ? "Restart all measured output simulations" : "Start all measured output simulations");
    setButtonLabel(send, active ? "Restart all" : "Run all");
    pause.disabled = !active || playbackState === "suspended";
    pause.setAttribute("aria-pressed", String(playbackState === "paused"));
    pause.setAttribute("aria-label", playbackState === "paused" ? "Resume measured output simulation" : "Pause measured output simulation");
    setButtonLabel(pause, playbackState === "paused" ? "Resume" : "Pause");
    reset.disabled = playbackState === "idle" || playbackState === "unavailable";

    if ("disabled" in dflash) dflash.disabled = active;
    dflash.setAttribute("aria-disabled", String(active));

    if (dflashState) {
      dflashState.textContent = enabled ? (active ? "ON · playback in progress" : "ON · comparison available") : "OFF · no measured playback";
    }

    const statusText = {
      idle: "Ready",
      unavailable: "Unavailable",
      streaming: "Running",
      paused: "Paused",
      suspended: `Paused · ${suspensionReason}`,
      complete: "Complete",
    };
    status.textContent = statusText[playbackState];
    results.forEach((result) => {
      if (playbackState === "streaming" && result.playbackRate === 0) result.status.textContent = "Running · 0 tok/s";
      else if (playbackState === "complete" && result.playbackRate === 0) result.status.textContent = "0 output";
      else result.status.textContent = statusText[playbackState];
    });
    updateTelemetry();
  }

  function renderVisibleTokens(count) {
    visibleTokens = Math.min(playbackTokens.length, Math.max(0, count));
    results.forEach((result) => {
      result.visibleTokens = result.playbackRate === playbackRate
        ? visibleTokens
        : Math.min(playbackTokens.length, Math.floor((elapsedMs / 1000) * result.playbackRate));
      setOutputText(
        result,
        result.visibleTokens > 0
          ? playbackTokens.slice(0, result.visibleTokens).join("")
          : result.playbackRate === 0
            ? "No measured output · 0 tok/s"
            : "",
      );
    });
    updateTelemetry();
  }

  function completePlayback() {
    cancelPlaybackFrame();
    elapsedMs = simulatedDurationMs;
    renderVisibleTokens(playbackTokens.length);
    playbackState = "complete";
    updateInterface();
  }

  function playbackTick(timestamp) {
    if (playbackState !== "streaming") return;

    const frameDelta = Math.max(0, timestamp - lastFrameTime);
    lastFrameTime = timestamp;
    elapsedMs = Math.min(simulatedDurationMs, elapsedMs + frameDelta);

    const nextTokenCount = Math.min(playbackTokens.length, Math.floor((elapsedMs / 1000) * playbackRate));
    if (nextTokenCount !== visibleTokens) renderVisibleTokens(nextTokenCount);
    else updateTelemetry();

    if (nextTokenCount >= playbackTokens.length) {
      completePlayback();
      return;
    }

    playbackFrame = window.requestAnimationFrame(playbackTick);
  }

  function resetPlayback() {
    cancelPlaybackFrame();
    elapsedMs = 0;
    visibleTokens = 0;
    playbackState = isDflashEnabled() ? "idle" : "unavailable";
    results.forEach((result) => {
      result.visibleTokens = 0;
      setOutputText(result, isDflashEnabled() ? "Press Run all to begin." : "Enable DFlash 2 to compare playback.");
    });
    updateInterface();
  }

  function startPlayback() {
    if (!isDflashEnabled()) {
      resetPlayback();
      return;
    }

    cancelPlaybackFrame();
    elapsedMs = 0;
    visibleTokens = 0;
    results.forEach((result) => {
      result.visibleTokens = 0;
      setOutputText(result, result.playbackRate === 0 ? "No measured output · 0 tok/s" : "");
    });

    if (reduceMotion.matches) {
      completePlayback();
      return;
    }

    playbackState = "streaming";
    lastFrameTime = performance.now();
    updateInterface();
    syncAutomaticPlayback();
    if (playbackState === "streaming") playbackFrame = window.requestAnimationFrame(playbackTick);
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
    dflash.addEventListener("change", resetPlayback);
  } else {
    dflash.addEventListener("click", () => {
      if (playbackState === "streaming" || playbackState === "paused") return;
      setDflashEnabled(!isDflashEnabled());
      resetPlayback();
    });
  }

  model.addEventListener("change", () => {
    syncConfiguration();
    resetPlayback();
  });

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

  syncConfiguration();
  setDflashEnabled(true);
  resetPlayback();
}

initMeasuredPlayback();
