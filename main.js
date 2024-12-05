import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MontanaRusa } from "./MontanaRusa.js";
import * as dat from "dat.gui";

let scene, camera, renderer, container, montanaRusa, controls, orbitalControls;

function setupThreeJs() {
  container = document.getElementById("container3D");

  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;  // Habilitar las sombras
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Tipo de sombra (suave)
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
  document.body.addEventListener("dblclick", toggleFullScreen, false); // Detectar doble clic para pantalla completa
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

  // Crear la montaña rusa
  montanaRusa = new MontanaRusa(scene, renderer);
  montanaRusa.generate();

  // Configurar la cámara inicial
  montanaRusa.setCurrentCamera("orbital");

  // Depuración
  console.log("Cámara actual después de buildScene:", montanaRusa.getCurrentCamera());
  console.log("Lista de cámaras:", montanaRusa.cameras);

  
  // Configurar la luz direccional para proyectar sombras
  const luzDireccional = new THREE.DirectionalLight(0xffffff, 1);
  luzDireccional.position.set(10, 10, 10); // Posición de la luz
  luzDireccional.castShadow = true; // Habilitar sombras para la luz direccional
  scene.add(luzDireccional);

  // Configurar la cámara de la sombra
  luzDireccional.shadow.camera.left = -50;
  luzDireccional.shadow.camera.right = 50;
  luzDireccional.shadow.camera.top = 50;
  luzDireccional.shadow.camera.bottom = -50;
  luzDireccional.shadow.camera.near = 1;
  luzDireccional.shadow.camera.far = 500;
  
  // Configurar la calidad de las sombras
  luzDireccional.shadow.mapSize.width = 2048;  // Resolución de la sombra
  luzDireccional.shadow.mapSize.height = 2048;

  // Añadir el resto de objetos, cámaras y elementos
  montanaRusa.setCurrentCamera("orbital");

  // Depuración
  console.log("Cámara actual después de buildScene:", montanaRusa.getCurrentCamera());
  console.log("Lista de cámaras:", montanaRusa.cameras);
}

function createMenu() {
  const gui = new dat.GUI();
  gui.add(montanaRusa, "dayNightFactor", 0, 1, 0.01); // Añadir control para cambiar entre día y noche
}

function onResize() {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.offsetWidth, container.offsetHeight);

  // Verifica si montanaRusa está inicializado antes de acceder a sus cámaras
  if (montanaRusa && montanaRusa.cameras) {
    Object.values(montanaRusa.cameras).forEach((camera) => {
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
    });
  }
}

function animate() {
  requestAnimationFrame(animate);

  const activeCamera = montanaRusa?.getCurrentCamera() || camera;

  if (orbitalControls && montanaRusa.getCurrentCamera() === montanaRusa.cameras.orbital) {
    orbitalControls.update(); // Actualizar controles si la cámara orbital está activa
  }

  renderer.render(scene, activeCamera);
}

// Cambiar cámaras con teclado
document.addEventListener("keydown", (event) => {
  if (event.key === "1") {
    montanaRusa.setCurrentCamera("seat1"); // Vista del asiento delantero
  } else if (event.key === "2") {
    montanaRusa.setCurrentCamera("seat2"); // Vista del asiento trasero
  } else if (event.key === "3") {
    montanaRusa.setCurrentCamera("swingView");
  } else if (event.key === "4") {
    montanaRusa.setCurrentCamera("orbital");
    orbitalControls = new OrbitControls(montanaRusa.getCurrentCamera(), renderer.domElement);
  } else if (event.key === "5") {
    montanaRusa.setCurrentCamera("swingOrbital");
    orbitalControls = new OrbitControls(montanaRusa.getCurrentCamera(), renderer.domElement);
    orbitalControls.target.copy(montanaRusa.swingGroup.position);
  }
});



// Configurar el flujo de la aplicación
setupThreeJs();
buildScene();
createMenu();
animate();
