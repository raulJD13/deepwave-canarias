import * as THREE from "three";

function directionVector(degrees, fallback = 45) {
  const radians = THREE.MathUtils.degToRad(Number.isFinite(Number(degrees)) ? Number(degrees) : fallback);
  return new THREE.Vector3(Math.sin(radians), 0, Math.cos(radians)).normalize();
}

function makeLine(points, color, opacity) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

export function createOceanLayers() {
  const group = new THREE.Group();
  const windGroup = new THREE.Group();
  const swellGroup = new THREE.Group();
  const currentGroup = new THREE.Group();
  group.add(windGroup, swellGroup, currentGroup);

  const windArrows = [];
  const arrowMaterial = new THREE.MeshBasicMaterial({
    color: "#9dd8e5",
    transparent: true,
    opacity: 0.5,
  });

  for (let x = -40; x <= 40; x += 16) {
    for (let z = -18; z <= 18; z += 12) {
      const arrow = new THREE.Group();
      const shaft = makeLine([new THREE.Vector3(-1.0, 0, 0), new THREE.Vector3(1.0, 0, 0)], "#9dd8e5", 0.38);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.62, 16), arrowMaterial.clone());
      head.rotation.z = -Math.PI / 2;
      head.position.x = 1.18;
      arrow.position.set(x, 0.32, z);
      arrow.add(shaft, head);
      windGroup.add(arrow);
      windArrows.push(arrow);
    }
  }

  function drawSwellLines(anchor, vector, period, riskLevel) {
    swellGroup.clear();
    const normal = new THREE.Vector3(-vector.z, 0, vector.x);
    const spacing = THREE.MathUtils.clamp(period * 0.36, 3.2, 6.2);
    const opacity = 0.18 + riskLevel * 0.035;

    for (let band = -3; band <= 3; band += 1) {
      const points = [];
      for (let step = -15; step <= 15; step += 1) {
        const along = vector.clone().multiplyScalar(step * 1.35);
        const side = normal.clone().multiplyScalar(band * spacing);
        const wave = Math.sin(step * 0.58 + band) * 0.48;
        const point = anchor.clone().add(along).add(side).add(normal.clone().multiplyScalar(wave));
        point.y = 0.2;
        points.push(point);
      }
      swellGroup.add(makeLine(points, "#72dce9", opacity));
    }
  }

  function drawCurrentLines(anchor, vector) {
    currentGroup.clear();
    const normal = new THREE.Vector3(-vector.z, 0, vector.x);
    for (let line = -1; line <= 1; line += 1) {
      const points = [];
      for (let step = -8; step <= 8; step += 1) {
        const point = anchor
          .clone()
          .add(vector.clone().multiplyScalar(step * 1.4))
          .add(normal.clone().multiplyScalar(line * 2.2 + Math.sin(step * 0.8) * 0.35));
        point.y = 0.16;
        points.push(point);
      }
      currentGroup.add(makeLine(points, "#2d8fc5", 0.16));
    }
  }

  function update(forecast, anchorPosition = new THREE.Vector3()) {
    const physical = forecast?.physical ?? {};
    const windSpeed = Number(physical.wind_speed ?? forecast?.wind_speed ?? 3);
    const windDirection = physical.wind_direction ?? forecast?.wind_direction ?? 45;
    const swellDirection = physical.wave_direction ?? physical.swell_direction ?? windDirection;
    const period = Number(physical.period ?? physical.tp ?? forecast?.period ?? 11);
    const riskLevel = Number(forecast?.risk_general?.level ?? 0);

    const windVector = directionVector(windDirection);
    const arrowScale = THREE.MathUtils.clamp(0.75 + windSpeed * 0.055, 0.7, 1.55);
    windArrows.forEach((arrow, index) => {
      arrow.rotation.y = Math.atan2(windVector.x, windVector.z) - Math.PI / 2;
      arrow.scale.setScalar(arrowScale * (index % 2 ? 0.88 : 1));
      arrow.children.forEach((child) => {
        if (child.material) child.material.opacity = 0.28 + Math.min(windSpeed, 12) * 0.018;
      });
    });

    const swellVector = directionVector(swellDirection, 315);
    drawSwellLines(anchorPosition, swellVector, period, riskLevel);
    drawCurrentLines(anchorPosition, windVector);
  }

  function tick(elapsed) {
    swellGroup.children.forEach((line, index) => {
      line.material.opacity = 0.12 + Math.sin(elapsed * 0.9 + index) * 0.035 + 0.07;
    });
    windGroup.children.forEach((arrow, index) => {
      arrow.position.y = 0.32 + Math.sin(elapsed * 1.4 + index) * 0.025;
    });
  }

  return { group, update, tick };
}

