import * as THREE from "three";
import { ISLANDS, projectLatLon } from "./config.js";

function organicPoints(island, segments = 42) {
  const points = [];
  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const wobble =
      1 +
      Math.sin(angle * 3 + island.radius) * 0.09 +
      Math.cos(angle * 5 + island.rotation * 2) * 0.06 +
      Math.sin(angle * 7) * 0.035;
    points.push(
      new THREE.Vector2(
        Math.cos(angle) * island.radius * island.scale[0] * wobble,
        Math.sin(angle) * island.radius * island.scale[1] * wobble,
      ),
    );
  }
  return points;
}

export function createIslands() {
  const group = new THREE.Group();
  const islandMaterial = new THREE.MeshStandardMaterial({
    color: "#151b1d",
    roughness: 0.94,
    metalness: 0.02,
    flatShading: true,
  });
  const coastMaterial = new THREE.LineBasicMaterial({
    color: "#6ddbe9",
    transparent: true,
    opacity: 0.32,
  });
  const ridgeMaterial = new THREE.LineBasicMaterial({
    color: "#30444a",
    transparent: true,
    opacity: 0.36,
  });

  ISLANDS.forEach((island) => {
    const { x, z } = projectLatLon(island.lat, island.lon);
    const points = organicPoints(island);
    const shape = new THREE.Shape(points);
    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.52,
      bevelEnabled: true,
      bevelSize: 0.13,
      bevelThickness: 0.12,
      bevelSegments: 2,
      curveSegments: 10,
    });
    extrude.rotateX(-Math.PI / 2);
    extrude.computeVertexNormals();

    const islandGroup = new THREE.Group();
    islandGroup.position.set(x, 0, z);
    islandGroup.rotation.y = island.rotation;

    const body = new THREE.Mesh(extrude, islandMaterial);
    body.position.y = -0.36;
    body.castShadow = true;
    body.receiveShadow = true;

    const coastPoints = points.map((point) => new THREE.Vector3(point.x, 0.08, point.y));
    coastPoints.push(coastPoints[0].clone());
    const coast = new THREE.Line(new THREE.BufferGeometry().setFromPoints(coastPoints), coastMaterial);

    const ridgePoints = points
      .filter((_, index) => index % 4 === 0)
      .map((point, index) => new THREE.Vector3(point.x * (0.28 + index * 0.012), 0.16, point.y * 0.28));
    const ridge = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ridgePoints), ridgeMaterial);

    islandGroup.add(body, coast, ridge);
    group.add(islandGroup);
  });

  return group;
}

export { projectLatLon };
