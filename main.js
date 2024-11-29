import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MontanaRusa } from "./MontanaRusa.js";
import * as dat from "dat.gui";

let scene, camera, renderer, container, montanaRusa, controls;

function setupThreeJs() {
  container = document.getElementById("container3D");

  renderer = new THREE.WebGLRenderer();
  scene = new THREE.Scene();
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(80, 50, 60);
  camera.lookAt(0, 0, 0);

  controls = new OrbitControls(camera, renderer.domElement);

  window.addEventListener("resize", onResize);
  onResize();
  
  // Configurar el modo pantalla completa
  document.body.addEventListener('dblclick', toggleFullScreen, false); // Detectar doble clic para pantalla completa
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch((err) => {
      console.error("Error intentando poner la página en pantalla completa", err);
    });
  } else {
    document.exitFullscreen();
  }
}

function buildScene() {
  const gridHelper = new THREE.GridHelper(500, 50);
  scene.add(gridHelper);

  controls = new OrbitControls(camera, renderer.domElement);

  // Crear la montaña rusa
  montanaRusa = new MontanaRusa(scene, renderer);
  montanaRusa.generate();

  // Configurar el valor inicial del factor día/noche
  montanaRusa.dayNightFactor = 0;
}

function createMenu() {
  const gui = new dat.GUI();
  gui.add(montanaRusa, "dayNightFactor", 0, 1, 0.01); // Añadir control para cambiar entre día y noche
}

function onResize() {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

setupThreeJs();
buildScene();
createMenu();
animate();
