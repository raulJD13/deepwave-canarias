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
      button.classList.toggle("is-active", Number(state.horizon) === Number(horizon));
    });
  });
}

