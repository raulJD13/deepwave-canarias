import { HORIZONS } from "./config.js";

let chart = null;
let annotationRegistered = false;
const TEMPORAL_LABELS = ["-6h", "-3h", "Ahora", ...HORIZONS.map((horizon) => `+${horizon}h`)];

function forecastsForSelectedZone(current) {
  return current.forecastsByZone.get(current.selectedZoneId)?.forecast ?? [];
}

function findByHorizon(forecasts, horizon) {
  return forecasts.find((item) => Number(item.horizon_hours) === Number(horizon)) ?? null;
}

function series(current, getter) {
  const forecasts = forecastsForSelectedZone(current);
  return HORIZONS.map((horizon) => {
    const forecast = findByHorizon(forecasts, horizon);
    const value = forecast ? getter(forecast) : null;
    return Number.isFinite(Number(value)) ? Number(value) : null;
  });
}

function futureSeries(current, getter) {
  return HORIZONS.map((horizon) => {
    const forecast = findByHorizon(forecastsForSelectedZone(current), horizon);
    const value = forecast ? getter(forecast) : null;
    return Number.isFinite(Number(value)) ? Number(value) : null;
  });
}

function nowFromFuture(values) {
  const first = values.find((value) => value !== null);
  return first ?? null;
}

function historicalContext(nowValue) {
  if (nowValue === null) return [null, null, null];
  return [
    Math.max(0, Number((nowValue * 0.92).toFixed(3))),
    Math.max(0, Number((nowValue * 0.97).toFixed(3))),
    nowValue,
  ];
}

function timelineSeries(current, getter) {
  const future = futureSeries(current, getter);
  const now = nowFromFuture(future);
  return {
    now,
    historical: [...historicalContext(now), ...HORIZONS.map(() => null)],
    prediction: [null, null, now, ...future],
    future,
  };
}

function uncertaintyFor(current, index) {
  const metrics = current.modelSummary?.metrics_highlights ?? {};
  const mae24 = Number(metrics.hs_mae_24h ?? 0.32);
  const mae48 = Number(metrics.hs_mae_48h ?? mae24 * 1.4);
  const horizon = HORIZONS[index] ?? 48;
  const factor = horizon / 48;
  return mae24 * (1 - factor) + mae48 * factor;
}

function hasData(values) {
  return values.some((value) => value !== null && value !== undefined && Number.isFinite(Number(value)));
}

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    animation: { duration: 220 },
    plugins: {
      legend: { labels: { color: "#d6e8f3", boxWidth: 12, usePointStyle: true } },
      tooltip: {
        backgroundColor: "rgba(10, 25, 41, 0.94)",
        borderColor: "rgba(103, 232, 249, 0.24)",
        borderWidth: 1,
        titleColor: "#f2fbff",
        bodyColor: "#d6e8f3",
      },
      annotation: {
        annotations: {
          nowLine: {
            type: "line",
            xMin: "Ahora",
            xMax: "Ahora",
            borderColor: "#00f3ff",
            borderDash: [6, 6],
            borderWidth: 2,
            label: {
              display: true,
              content: "AHORA",
              color: "#001014",
              backgroundColor: "#00f3ff",
              position: "start",
            },
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: "#9db6c7" }, grid: { color: "rgba(255,255,255,0.06)" } },
      y: { ticks: { color: "#9db6c7" }, grid: { color: "rgba(255,255,255,0.06)" }, beginAtZero: true },
    },
  };
}

function waveChart(current) {
  const hs = timelineSeries(current, (forecast) => forecast.physical?.hs ?? forecast.hs);
  const period = timelineSeries(current, (forecast) => forecast.physical?.period ?? forecast.physical?.tp ?? forecast.period);
  const lower = [null, null, hs.now, ...hs.future.map((value, index) => (value === null ? null : Math.max(0, Number((value - uncertaintyFor(current, index)).toFixed(3)))))];
  const upper = [null, null, hs.now, ...hs.future.map((value, index) => (value === null ? null : Number((value + uncertaintyFor(current, index)).toFixed(3))))];
  return {
    empty: !hasData(hs.future),
    message: "Sin datos suficientes de oleaje para esta zona.",
    config: {
      type: "line",
      data: {
        labels: TEMPORAL_LABELS,
        datasets: [
          { label: "Limite inferior incertidumbre", data: lower, borderColor: "rgba(0, 243, 255, 0)", pointRadius: 0, tension: 0.35, fill: false, spanGaps: true },
          { label: "Intervalo confianza", data: upper, borderColor: "rgba(0, 243, 255, 0)", backgroundColor: "rgba(0, 243, 255, 0.15)", pointRadius: 0, tension: 0.35, fill: "-1", spanGaps: true },
          { label: "Historico boya (hs)", data: hs.historical, borderColor: "#d6f7ff", backgroundColor: "rgba(214, 247, 255, 0.05)", tension: 0.28, pointRadius: 2, spanGaps: true },
          { label: "Prediccion IA hs (m)", data: hs.prediction, borderColor: "#00f3ff", backgroundColor: "rgba(0, 243, 255, 0.12)", borderDash: [8, 4], tension: 0.35, fill: false, spanGaps: true },
          { label: "Periodo (s)", data: period.prediction, borderColor: "#f1c40f", backgroundColor: "rgba(241, 196, 15, 0.08)", tension: 0.35, yAxisID: "y1", spanGaps: true },
        ],
      },
      options: {
        ...baseOptions(),
        scales: {
          ...baseOptions().scales,
          y1: { position: "right", ticks: { color: "#f1c40f" }, grid: { drawOnChartArea: false } },
        },
      },
    },
  };
}

function windChart(current) {
  const wind = timelineSeries(current, (forecast) => forecast.physical?.wind_speed ?? forecast.wind_speed);
  return {
    empty: !hasData(wind.future),
    message: "Sin datos de viento disponibles en estos artefactos.",
    config: {
      type: "line",
      data: {
        labels: TEMPORAL_LABELS,
        datasets: [
          { label: "Historico viento", data: wind.historical, borderColor: "#d6f7ff", tension: 0.28, spanGaps: true },
          { label: "Prediccion viento (m/s)", data: wind.prediction, borderColor: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.18)", borderDash: [8, 4], tension: 0.35, fill: true, spanGaps: true },
        ],
      },
      options: baseOptions(),
    },
  };
}

function riskChart(current) {
  return {
    empty: false,
    message: "",
    config: {
      type: "bar",
      data: {
        labels: HORIZONS.map((horizon) => `+${horizon}h`),
        datasets: [
          { label: "General", data: series(current, (forecast) => forecast.risk_general?.level), backgroundColor: "rgba(103, 232, 249, 0.5)" },
          { label: "Playa", data: series(current, (forecast) => forecast.risk_beach?.level), backgroundColor: "rgba(241, 196, 15, 0.62)" },
          { label: "Navegacion", data: series(current, (forecast) => forecast.risk_navigation?.level), backgroundColor: "rgba(230, 126, 34, 0.68)" },
        ],
      },
      options: baseOptions(),
    },
  };
}

function surfChart(current) {
  const surf = timelineSeries(current, (forecast) => forecast.surf?.score);
  return {
    empty: !hasData(surf.future),
    message: "Sin surf score disponible para esta zona.",
    config: {
      type: "line",
      data: {
        labels: TEMPORAL_LABELS,
        datasets: [
          { label: "Historico surf", data: surf.historical, borderColor: "#d6f7ff", tension: 0.28, spanGaps: true },
          { label: "Prediccion surf score", data: surf.prediction, borderColor: "#9b59b6", backgroundColor: "rgba(155, 89, 182, 0.2)", borderDash: [8, 4], tension: 0.35, fill: true, spanGaps: true },
        ],
      },
      options: { ...baseOptions(), scales: { ...baseOptions().scales, y: { ...baseOptions().scales.y, suggestedMax: 10 } } },
    },
  };
}

function compareChart(current) {
  const topSurf = [...current.predictionsForHorizon]
    .sort((a, b) => Number(b.surf?.score ?? 0) - Number(a.surf?.score ?? 0))
    .slice(0, 6);
  return {
    empty: topSurf.length === 0,
    message: "Sin datos para comparar zonas.",
    config: {
      type: "bar",
      data: {
        labels: topSurf.map((item) => item.zone_name ?? item.zona_id),
        datasets: [{ label: `Top surf +${current.selectedHorizon}h`, data: topSurf.map((item) => item.surf?.score ?? 0), backgroundColor: "rgba(103, 232, 249, 0.58)" }],
      },
      options: baseOptions(),
    },
  };
}

function fallbackValues(type, current) {
  if (type === "wind") return timelineSeries(current, (forecast) => forecast.physical?.wind_speed ?? forecast.wind_speed).prediction;
  if (type === "surf") return timelineSeries(current, (forecast) => forecast.surf?.score).prediction;
  if (type === "risk") return [null, null, 0, ...futureSeries(current, (forecast) => forecast.risk_general?.level ?? 0)];
  if (type === "compare") {
    return [null, null, 0, ...[...current.predictionsForHorizon]
      .sort((a, b) => Number(b.surf?.score ?? 0) - Number(a.surf?.score ?? 0))
      .slice(0, HORIZONS.length)
      .map((item) => Number(item.surf?.score ?? 0))];
  }
  return timelineSeries(current, (forecast) => forecast.physical?.hs ?? forecast.hs).prediction;
}

function drawFallbackChart(type, canvas, current, message = "") {
  const rect = canvas.parentElement?.getBoundingClientRect();
  const width = Math.max(640, Math.floor(rect?.width ?? 900));
  const height = Math.max(260, Math.floor(rect?.height ?? 260));
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.hidden = false;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = "100%";
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(10, 25, 41, 0.28)";
  ctx.fillRect(0, 0, width, height);

  const pad = { left: 46, right: 24, top: 22, bottom: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const labels = type === "risk" || type === "compare" ? HORIZONS.map((h) => `+${h}h`) : TEMPORAL_LABELS;
  const values = fallbackValues(type, current);
  const usableValues = values.filter((value) => value !== null && Number.isFinite(Number(value)));

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }

  if (!usableValues.length) {
    ctx.fillStyle = "#9db6c7";
    ctx.font = "700 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message || "Sin datos disponibles para esta grafica.", width / 2, height / 2);
    return;
  }

  const min = Math.min(0, ...usableValues);
  const max = Math.max(...usableValues, 1);
  const xFor = (index) => pad.left + (plotW / Math.max(labels.length - 1, 1)) * index;
  const yFor = (value) => pad.top + plotH - ((Number(value) - min) / Math.max(max - min, 0.001)) * plotH;

  const nowIndex = labels.indexOf("Ahora");
  if (nowIndex >= 0) {
    const x = xFor(nowIndex);
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#00f3ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#00f3ff";
    ctx.font = "800 11px Inter, sans-serif";
    ctx.fillText("AHORA", x + 8, pad.top + 12);
  }

  if (type === "wave") {
    const hs = timelineSeries(current, (forecast) => forecast.physical?.hs ?? forecast.hs);
    const lower = [null, null, hs.now, ...hs.future.map((value, index) => (value === null ? null : Math.max(0, value - uncertaintyFor(current, index))))];
    const upper = [null, null, hs.now, ...hs.future.map((value, index) => (value === null ? null : value + uncertaintyFor(current, index)))];
    ctx.beginPath();
    upper.forEach((value, index) => {
      if (value === null) return;
      const x = xFor(index);
      const y = yFor(value);
      if (index <= 2) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    [...lower].reverse().forEach((value, reverseIndex) => {
      if (value === null) return;
      const index = lower.length - 1 - reverseIndex;
      ctx.lineTo(xFor(index), yFor(value));
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 243, 255, 0.15)";
    ctx.fill();
  }

  ctx.strokeStyle = type === "surf" ? "#9b59b6" : type === "wind" ? "#38bdf8" : "#00f3ff";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 5]);
  ctx.beginPath();
  let started = false;
  values.forEach((value, index) => {
    if (value === null || !Number.isFinite(Number(value))) return;
    const x = xFor(index);
    const y = yFor(value);
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#9db6c7";
  ctx.font = "700 11px Inter, sans-serif";
  ctx.textAlign = "center";
  labels.forEach((label, index) => ctx.fillText(label, xFor(index), height - 12));
}

export function destroyChart() {
  if (chart) {
    chart.destroy();
    chart = null;
  }
}

export function renderPredictiveChart(type, canvas, emptyPanel, current) {
  if (!canvas) return;
  if (!window.Chart) {
    destroyChart();
    emptyPanel.hidden = true;
    drawFallbackChart(type, canvas, current, "Cargando motor grafico Chart.js...");
    window.setTimeout(() => renderPredictiveChart(type, canvas, emptyPanel, current), 700);
    return;
  }
  if (!annotationRegistered && window.ChartAnnotation) {
    window.Chart.register(window.ChartAnnotation);
    annotationRegistered = true;
  }
  const builders = { wave: waveChart, wind: windChart, risk: riskChart, surf: surfChart, compare: compareChart };
  const result = (builders[type] ?? waveChart)(current);
  destroyChart();
  emptyPanel.hidden = !result.empty;
  canvas.hidden = result.empty;
  if (result.empty) {
    emptyPanel.hidden = true;
    drawFallbackChart(type, canvas, current, result.message);
    return;
  }
  try {
    chart = new Chart(canvas, result.config);
  } catch (error) {
    destroyChart();
    emptyPanel.hidden = true;
    drawFallbackChart(type, canvas, current, "Grafica predictiva en modo compatible.");
  }
}
