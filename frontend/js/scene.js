import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js";
import { createIslands } from "./islands.js";
import { createMarkers } from "./markers.js";
import { createOcean } from "./ocean.js";
import { createOceanLayers } from "./oceanLayers.js";
import { createRiskParticles } from "./particles.js";
import { createSurfMedallion } from "./surfMedallion.js";

export function createCommandScene(root, onZoneSelect) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#061d2f", 58, 148);

  const camera = new THREE.PerspectiveCamera(46, root.clientWidth / root.clientHeight, 0.1, 220);
  camera.position.set(0, 58, 62);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(root.clientWidth, root.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  root.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.panSpeed = 0.75;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.75;
  controls.minDistance = 16;
  controls.maxDistance = 94;
  controls.maxPolarAngle = Math.PI * 0.42;
  controls.target.set(0, 0, 0);
  controls.update();

  const ambient = new THREE.AmbientLight("#9bd8e8", 0.72);
  const sun = new THREE.DirectionalLight("#e6fbff", 1.35);
  sun.position.set(-22, 44, 28);
  sun.castShadow = true;
  const rim = new THREE.PointLight("#5aaecb", 1.4, 110);
  rim.position.set(18, 10, -18);
  scene.add(ambient, sun, rim);

  const ocean = createOcean();
  const islands = createIslands();
  const markers = createMarkers(onZoneSelect);
  const oceanLayers = createOceanLayers();
  const particles = createRiskParticles();
  const surfMedallion = createSurfMedallion();

  scene.add(ocean.mesh, oceanLayers.group, islands, markers.group, particles.points, surfMedallion.group);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();
  const desiredCamera = new THREE.Vector3(0, 58, 62);
  const desiredTarget = new THREE.Vector3(0, 0, 0);
  let selectedZoneId = null;
  let pointerMoved = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let autoFocusWeight = 0;

  controls.addEventListener("start", () => {
    autoFocusWeight = 0;
  });

  function resize() {
    const width = root.clientWidth || window.innerWidth;
    const height = root.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function onPointerDown(event) {
    pointerMoved = false;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    renderer.domElement.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    const movedX = Math.abs(event.clientX - pointerStartX);
    const movedY = Math.abs(event.clientY - pointerStartY);
    if (movedX + movedY > 5) pointerMoved = true;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(markers.pickables, false);
    renderer.domElement.style.cursor = intersections[0] ? "pointer" : "grab";
  }

  function onPointerUp(event) {
    renderer.domElement.releasePointerCapture?.(event.pointerId);
    if (pointerMoved) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(markers.pickables, false);
    if (intersections[0]) markers.handleIntersection(intersections[0].object);
  }

  function setZones(zones, predictions) {
    markers.setZones(zones, predictions);
  }

  function updatePredictions(predictions) {
    markers.updatePredictions(predictions);
  }

  function focusZone(zoneId, forecast) {
    selectedZoneId = zoneId;
    markers.select(zoneId);
    ocean.updateFromForecast(forecast);
    const marker = markers.markerMap.get(zoneId);
    if (!marker) return;

    particles.seedAround(marker.position, forecast);
    oceanLayers.update(forecast, marker.position);
    surfMedallion.update(forecast, marker.position);
    desiredTarget.copy(marker.position);
    desiredCamera.set(marker.position.x + 11, 30, marker.position.z + 34);
    autoFocusWeight = 1;
  }

  function animate() {
    const delta = Math.min(clock.getDelta(), 0.04);
    const elapsed = clock.elapsedTime;
    ocean.tick(delta);
    oceanLayers.tick(elapsed);
    markers.tick(elapsed);
    particles.tick(delta);
    surfMedallion.tick(delta);
    if (autoFocusWeight > 0.01) {
      camera.position.lerp(desiredCamera, 0.035);
      controls.target.lerp(desiredTarget, 0.035);
      autoFocusWeight -= delta * 0.65;
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function dispose() {
    window.removeEventListener("resize", resize);
    renderer.domElement.removeEventListener("pointerdown", onPointerDown);
    renderer.domElement.removeEventListener("pointermove", onPointerMove);
    renderer.domElement.removeEventListener("pointerup", onPointerUp);
    controls.dispose();
    renderer.dispose();
  }

  window.addEventListener("resize", resize);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  animate();

  return { setZones, updatePredictions, focusZone, dispose, get selectedZoneId() { return selectedZoneId; } };
}
