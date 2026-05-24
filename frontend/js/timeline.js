import { HORIZONS } from "./config.js";
import { setHorizon, state, subscribe } from "./state.js";

export function initTimeline(container) {
  const buttons = new Map();
  container.innerHTML = "";

  HORIZONS.forEach((horizon) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "timeline-button";
    button.textContent = `+${horizon}h`;
    button.addEventListener("click", () => setHorizon(horizon));
    buttons.set(horizon, button);
    container.append(button);
  });

  subscribe(() => {
    buttons.forEach((button, horizon) => {
      button.classList.toggle("is-active", Number(state.selectedHorizon) === Number(horizon));
    });
  });
}

export function initTimelinePlayer() {
  const button = document.querySelector("#btn-play-timeline");
  if (!button) return;

  let timer = null;
  let index = 0;

  function timelineButtons() {
    return [...document.querySelectorAll(".timeline-shell .timeline-button")];
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    button.textContent = "Play";
    button.setAttribute("aria-pressed", "false");
    button.classList.remove("is-playing");
  }

  function tick() {
    const buttons = timelineButtons();
    if (!buttons.length) return;
    buttons[index % buttons.length].click();
    index += 1;
  }

  function play() {
    tick();
    timer = window.setInterval(tick, 1800);
    button.textContent = "Pause";
    button.setAttribute("aria-pressed", "true");
    button.classList.add("is-playing");
  }

  button.addEventListener("click", () => {
    if (timer) stop();
    else play();
  });
}
