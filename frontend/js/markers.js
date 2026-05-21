import * as THREE from "three";
import { colorForRisk, projectLatLon } from "./config.js";

function riskPulseSpeed(level = 0) {
  return 0.7 + Number(level) * 0.22;
}

function createLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "600 28px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(3, 16, 25, 0.72)";
  context.strokeStyle = "rgba(105, 217, 236, 0.45)";
  context.lineWidth = 2;
  const label = text.length > 22 ? `${text.slice(0, 21)}...` : text;
  context.roundRect(18, 22, 284, 52, 18);
  context.fill();
  context.stroke();
  context.fillStyle = "#d9f5fb";
  context.fillText(label, 160, 49);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.82 });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(5.8, 1.75, 1);
  sprite.position.y = 2.6;
  return sprite;
}

export function createMarkers(onSelect) {
  const group = new THREE.Group();
  const pickables = [];
  const markerMap = new Map();

  function setZones(zones, predictions = []) {
    group.clear();
    pickables.length = 0;
    markerMap.clear();
    const forecastByZone = new Map(predictions.map((prediction) => [prediction.zona_id, prediction]));

    zones.forEach((zone) => {
      if (typeof zone.latitude !== "number" || typeof zone.longitude !== "number") return;
      const forecast = forecastByZone.get(zone.zona_id);
      const color = new THREE.Color(forecast?.risk_general?.color ?? colorForRisk("unknown"));
      const { x, z } = projectLatLon(zone.latitude, zone.longitude);
      const marker = new THREE.Group();
      marker.position.set(x, 0.22, z);
      marker.userData = { zone, forecast, pulse: 0, speed: riskPulseSpeed(forecast?.risk_general?.level) };

      const buoyMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        roughness: 0.38,
        metalness: 0.18,
      });
      const haloMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const halo = new THREE.Mesh(new THREE.RingGeometry(0.55, 1.45, 72), haloMaterial);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.02;

      const buoy = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.48, 18), buoyMaterial);
      buoy.position.y = 0.36;
      buoy.userData.zoneId = zone.zona_id;

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), buoyMaterial);
      cap.position.y = 0.68;
      cap.userData.zoneId = zone.zona_id;

      const mast = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.65, 0), new THREE.Vector3(0, 1.48, 0)]),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }),
      );

      const pickTarget = new THREE.Mesh(
        new THREE.SphereGeometry(0.92, 16, 10),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      pickTarget.position.y = 0.68;
      pickTarget.userData.zoneId = zone.zona_id;

      const label = createLabel(zone.name ?? zone.zona_id);
      label.visible = false;

      marker.add(halo, buoy, cap, mast, pickTarget, label);
      group.add(marker);
      pickables.push(pickTarget, buoy, cap);
      markerMap.set(zone.zona_id, marker);
    });
  }

  function updatePredictions(predictions = []) {
    const forecastByZone = new Map(predictions.map((prediction) => [prediction.zona_id, prediction]));
    markerMap.forEach((marker, zoneId) => {
      const forecast = forecastByZone.get(zoneId);
      marker.userData.forecast = forecast;
      marker.userData.speed = riskPulseSpeed(forecast?.risk_general?.level);
      marker.children.forEach((child) => {
        const nextColor = forecast?.risk_general?.color ?? colorForRisk("unknown");
        if (child.material?.color) child.material.color.set(nextColor);
        if (child.material?.emissive) child.material.emissive.set(nextColor);
      });
    });
  }

  function select(zoneId) {
    markerMap.forEach((marker, id) => {
      const selected = id === zoneId;
      marker.userData.selected = selected;
      const label = marker.children.find((child) => child.type === "Sprite");
      if (label) label.visible = selected;
    });
  }

  function tick(elapsed) {
    markerMap.forEach((marker) => {
      const selectedBoost = marker.userData.selected ? 0.18 : 0;
      const pulse = Math.sin(elapsed * marker.userData.speed * 3) * 0.045 + 1 + selectedBoost;
      const halo = marker.children[0];
      halo.scale.setScalar(pulse);
      halo.material.opacity = marker.userData.selected ? 0.28 : 0.12;
      marker.rotation.y += 0.002;
    });
  }

  function handleIntersection(object) {
    const zoneId = object?.userData?.zoneId;
    if (zoneId) onSelect(zoneId);
  }

  return { group, pickables, markerMap, setZones, updatePredictions, select, tick, handleIntersection };
}
