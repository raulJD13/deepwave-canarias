import * as THREE from "three";

const vertexShader = `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uWind;
  varying float vWave;
  varying vec2 vUv;
  varying float vFoam;

  void main() {
    vUv = uv;
    vec3 p = position;
    float longWave = sin((p.x * uFrequency) + uTime * 0.78);
    float swell = cos((p.y * uFrequency * 1.35) - uTime * 0.54);
    float windChop = sin((p.x * 0.18 + p.y * 0.13) + uTime * (1.4 + uWind * 1.2));
    float microRipple = sin((p.x - p.y) * 0.32 + uTime * 2.0) * uWind;
    float elevation = (longWave + swell * 0.58 + windChop * 0.15 + microRipple * 0.045) * uAmplitude;
    p.z += elevation;
    vWave = elevation;
    vFoam = smoothstep(0.58, 1.35, elevation + uWind * 0.18);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uDeepColor;
  uniform vec3 uSurfaceColor;
  uniform vec3 uFoamColor;
  uniform float uFoamAmount;
  varying float vWave;
  varying vec2 vUv;
  varying float vFoam;

  void main() {
    float depthGradient = smoothstep(0.0, 1.0, vUv.y);
    float crest = smoothstep(-0.9, 1.1, vWave);
    vec3 atlantic = mix(uDeepColor, uSurfaceColor, depthGradient * 0.45 + crest * 0.28);
    vec3 foam = mix(atlantic, uFoamColor, vFoam * uFoamAmount);
    gl_FragColor = vec4(foam, 0.96);
  }
`;

export function createOcean() {
  const geometry = new THREE.PlaneGeometry(260, 170, 180, 120);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: 0.65 },
      uFrequency: { value: 0.08 },
      uWind: { value: 0.25 },
      uDeepColor: { value: new THREE.Color("#021829") },
      uSurfaceColor: { value: new THREE.Color("#0a6e86") },
      uFoamColor: { value: new THREE.Color("#dff8ff") },
      uFoamAmount: { value: 0.08 },
    },
    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.75;

  function updateFromForecast(forecast) {
    const hs = Number(forecast?.physical?.hs ?? forecast?.hs ?? 0.8);
    const wind = Number(forecast?.physical?.wind_speed ?? forecast?.wind_speed ?? 2);
    const period = Number(forecast?.physical?.period ?? forecast?.physical?.tp ?? forecast?.period ?? 11);
    const riskLevel = Number(forecast?.risk_general?.level ?? 0);

    material.uniforms.uAmplitude.value = THREE.MathUtils.clamp(0.22 + hs * 0.22, 0.25, 1.08);
    material.uniforms.uFrequency.value = THREE.MathUtils.clamp(0.125 - period * 0.0032, 0.045, 0.095);
    material.uniforms.uWind.value = THREE.MathUtils.clamp(wind / 18, 0.08, 0.95);
    material.uniforms.uFoamAmount.value = THREE.MathUtils.clamp(0.05 + hs * 0.06 + riskLevel * 0.08, 0.05, 0.42);
  }

  function tick(delta) {
    material.uniforms.uTime.value += delta;
  }

  return { mesh, tick, updateFromForecast };
}
