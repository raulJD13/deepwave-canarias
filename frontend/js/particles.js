import * as THREE from "three";

export function createRiskParticles() {
  const maxParticles = 240;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(maxParticles * 3);
  const velocities = new Float32Array(maxParticles * 3);
  const material = new THREE.PointsMaterial({
    color: "#dff8ff",
    size: 0.12,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  let activeCount = 0;
  let turbulence = 0.2;

  function seedAround(position, forecast) {
    const level = Number(forecast?.risk_general?.level ?? 0);
    const hs = Number(forecast?.physical?.hs ?? forecast?.hs ?? 0.8);
    activeCount = Math.min(maxParticles, 26 + level * 34 + Math.round(hs * 16));
    turbulence = 0.08 + level * 0.08 + hs * 0.025;
    material.color.set(level >= 2 ? "#f6efe2" : level === 1 ? "#bfeeea" : "#aeeff7");
    material.opacity = 0.22 + level * 0.09;
    material.size = 0.09 + level * 0.018;

    for (let i = 0; i < maxParticles; i += 1) {
      const radius = i < activeCount ? 0.6 + Math.random() * (1.8 + level * 0.45 + hs * 0.25) : 0;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = position.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = position.y + 0.08 + Math.random() * (0.55 + level * 0.18);
      positions[i * 3 + 2] = position.z + Math.sin(angle) * radius;
      velocities[i * 3] = (Math.random() - 0.5) * turbulence * 1.4;
      velocities[i * 3 + 1] = (Math.random() - 0.28) * turbulence * 0.36;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * turbulence * 1.4;
    }

    geometry.attributes.position.needsUpdate = true;
  }

  function tick(delta) {
    if (!activeCount) return;
    for (let i = 0; i < activeCount; i += 1) {
      positions[i * 3] += velocities[i * 3] * delta * 6;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta * 6;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta * 6;
      if (positions[i * 3 + 1] > 1.8) positions[i * 3 + 1] = 0.28;
      if (positions[i * 3 + 1] < 0.02) positions[i * 3 + 1] = 0.08;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  return { points, seedAround, tick };
}
