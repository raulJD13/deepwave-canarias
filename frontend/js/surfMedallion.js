import * as THREE from "three";
import { colorForSurf } from "./config.js";

export function createSurfMedallion() {
  const group = new THREE.Group();
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: "#5be7ff",
    transparent: true,
    opacity: 0.95,
  });
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: "#0f2a38",
    emissive: "#123540",
    roughness: 0.38,
    metalness: 0.55,
  });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.11, 14, 96), ringMaterial);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.12, 64), coreMaterial);
  const shine = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.025, 8, 96),
    new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.16 }),
  );
  core.rotation.x = Math.PI / 2;
  shine.scale.set(1, 1, 1);
  group.add(ring, core, shine);
  group.visible = false;

  function update(forecast, anchorPosition) {
    const surf = forecast?.surf;
    const color = colorForSurf(surf?.quality);
    const score = Number(surf?.score ?? 0);
    group.visible = true;
    group.position.copy(anchorPosition).add(new THREE.Vector3(0, 5.2, 0));
    group.scale.setScalar(0.75 + Math.min(score, 10) * 0.035);
    ringMaterial.color.set(color);
    coreMaterial.emissive.set(surf?.quality === "epic" ? "#7d5a12" : color);
    shine.material.opacity = surf?.quality === "epic" ? 0.42 : 0.16;
  }

  function tick(delta) {
    group.rotation.y += delta * 0.9;
    group.rotation.z = Math.sin(performance.now() * 0.002) * 0.1;
  }

  return { group, update, tick };
}

