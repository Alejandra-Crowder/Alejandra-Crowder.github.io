import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MontanaRusa } from "./MontanaRusa.js";


let scene, camera, renderer, montanaRusa, controls;

function init() {
  // Configuración de la escena
  scene = new THREE.Scene();

  // Configuración de la cámara
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(50, 50, 50);
  camera.lookAt(0, 10, 0);

  // Configuración del renderizador
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Añadir controles de órbita
  controls = new OrbitControls(camera, renderer.domElement);

  // Crear la montaña rusa
  montanaRusa = new MontanaRusa(scene, renderer);
  montanaRusa.generate();

  // Iniciar renderizado
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
