import { Sky } from 'three/examples/jsm/objects/Sky.js';
import * as THREE from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';


export function MontanaRusa(scene, renderer) {
  const skyDay = new THREE.Color(0xA9F0FE);
  const skyNight = new THREE.Color(0x083258);

  //let dayNight = 0;
  let baseContainer;
  const swingSpeed = 0.03;
  let swingAngle = 0;

  let isDaytime = false;
  let c1 = 0;
  let SEED1 = 49823.3232;
  let SEED2 = 92733.112;

  const materials = {
    window: new THREE.MeshBasicMaterial({
      color: 0xaaaaaa, // Color inicial
      emissive: 0x000000, // Emisivo al principio, puedes ajustar esto
      emissiveIntensity: 0.5, // Intensidad de la emisividad
    }),
    ground: new THREE.MeshPhongMaterial({ color: 0x887755, name: "ground" }),
    grass: new THREE.MeshPhongMaterial({ color: 0x33ff33, name: "grass" }),
    rail: new THREE.MeshPhongMaterial({ color: 0x888888, name: "rail" }),
    post: new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 64, name: "post", }),
    light1: new THREE.MeshPhongMaterial({ emissive: 0xffff00, name: "light1" }),
    light2: new THREE.MeshPhongMaterial({ emissive: 0xff00ff, name: "light2" }),
    light3: new THREE.MeshPhongMaterial({ emissive: 0x77ffff, name: "light3" }),
    light4: new THREE.MeshPhongMaterial({ emissive: 0xff5577, name: "light4" }),
    light5: new THREE.MeshPhongMaterial({ emissive: 0x7777ff, name: "light5" }),
    water: new THREE.MeshPhongMaterial({ color: 0x67ffff, opacity: 0.6, transparent: true, name: "water" }),
    cement: new THREE.MeshPhongMaterial({ color: 0x828282, opacity: 1, name: "cement" }),
    oxide: new THREE.MeshPhongMaterial({ color: 0x8a0f0f, opacity: 1, name: "oxide" }),
    //tunnel: new THREE.MeshPhongMaterial({ color: 0xaaaaaa, opacity: 0.7, transparent: true, name: "tunnel" }),
    plastic: new THREE.MeshPhongMaterial({ color: 0xffbf00, shininess: 150, name: "plastic" }),
    disk: new THREE.MeshPhongMaterial({ color: 0xFF7E00, shininess: 150, name: "disk" }),
  };
  
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.castShadow = true;
  
  // Opcional: Ajustar las dimensiones del mapa de sombras para mayor precisión
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  
  // Configuración de la cámara para sombras (solo para DirectionalLight y SpotLight)
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;
  light.shadow.camera.left = -10;
  light.shadow.camera.right = 10;
  light.shadow.camera.top = 10;
  light.shadow.camera.bottom = -10;
  
  scene.add(light);
  

  const textureLoader = new THREE.TextureLoader();

  const tunnelColorTexture = textureLoader.load('maps/tunnelColor.jpg');
const tunnelAlphaTexture = textureLoader.load('maps/tunnelAlpha.png');

const tunnel2ColorTexture = textureLoader.load('maps/tunnelColor2.jpg');
const tunnel2AlphaTexture = textureLoader.load('maps/tunnelAlpha2.png');

const soporteColorTexture = textureLoader.load('maps/soporteColor.jpg');
const soporteAlphaTexture = textureLoader.load('maps/soporteAlpha.png');

materials.soporte = new THREE.MeshPhongMaterial({
  map: soporteColorTexture,       // Mapa de color difuso
  alphaMap: soporteAlphaTexture,  // Mapa de Alpha
  transparent: false,             // Habilitar transparencias
  side: THREE.DoubleSide,        // Renderizar ambos lados
});

// Configurar el material del túnel
materials.tunnel = new THREE.MeshPhongMaterial({
  map: tunnelColorTexture,       // Mapa de color difuso
  alphaMap: tunnelAlphaTexture,  // Mapa de Alpha
  transparent: true,             // Habilitar transparencias
  side: THREE.DoubleSide,        // Renderizar ambos lados
});

materials.tunnel2 = new THREE.MeshPhongMaterial({
  map: tunnel2ColorTexture,       // Mapa de color difuso
  alphaMap: tunnel2AlphaTexture,  // Mapa de Alpha
  transparent: true,             // Habilitar transparencias
  side: THREE.DoubleSide,        // Renderizar ambos lados
});

// Ajustar las texturas si es necesario
tunnelColorTexture.wrapS = tunnelColorTexture.wrapT = THREE.RepeatWrapping;
tunnelAlphaTexture.wrapS = tunnelAlphaTexture.wrapT = THREE.RepeatWrapping;

tunnel2ColorTexture.wrapS = tunnel2ColorTexture.wrapT = THREE.RepeatWrapping;
tunnel2AlphaTexture.wrapS = tunnel2AlphaTexture.wrapT = THREE.RepeatWrapping;

soporteColorTexture.wrapS = soporteColorTexture.wrapT = THREE.RepeatWrapping;
soporteAlphaTexture.wrapS = soporteAlphaTexture.wrapT = THREE.RepeatWrapping;

// Opcional: Repetir textura si es necesario
tunnelColorTexture.repeat.set(2, 2); // Ajusta según el tamaño del túnel
tunnelAlphaTexture.repeat.set(2, 2);

tunnel2ColorTexture.repeat.set(2, 2); // Ajusta según el tamaño del túnel
tunnel2AlphaTexture.repeat.set(2, 2);

soporteColorTexture.repeat.set(2, 2); // Ajusta según el tamaño del túnel
soporteAlphaTexture.repeat.set(2, 2);


const grassTexture = textureLoader.load('maps/pasto.png');
const dirtTexture = textureLoader.load('maps/tierra.png');
const rockTexture = textureLoader.load('maps/roca.png');
const maskTexture = textureLoader.load('maps/mask.jpg');  // Máscara para los caminos

const groundShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    grassMap: { value: grassTexture },
    dirtMap: { value: dirtTexture },
    rockMap: { value: rockTexture },
    maskMap: { value: maskTexture }, // Máscara para los caminos
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D grassMap;
    uniform sampler2D dirtMap;
    uniform sampler2D rockMap;
    uniform sampler2D maskMap;

    varying vec2 vUv;

    void main() {
      // Cargar las texturas
      vec4 grassColor = texture2D(grassMap, vUv);
      vec4 dirtColor = texture2D(dirtMap, vUv);
      vec4 rockColor = texture2D(rockMap, vUv);
      vec4 mask = texture2D(maskMap, vUv);

      // Con la máscara combino las texturas
      vec4 finalColor = mix(grassColor, dirtColor, mask.r); // Pasto y tierra según la máscara 
      finalColor = mix(finalColor, rockColor, mask.g); // Añadir rocas 

      gl_FragColor = finalColor;
    }
  `
});

grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
dirtTexture.wrapS = dirtTexture.wrapT = THREE.RepeatWrapping;
rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;
maskTexture.wrapS = maskTexture.wrapT = THREE.RepeatWrapping;

// Ajustar la repetición de las texturas
grassTexture.repeat.set(0.1, 0.1);
dirtTexture.repeat.set(0.1, 0.1);
rockTexture.repeat.set(0.1, 0.1);
maskTexture.repeat.set(0.1, 0.1); 

  this.generate = function () {
    if (baseContainer) {
      scene.remove(baseContainer);
    }
    baseContainer = new THREE.Group();
    buildScenario();
    buildMontanaRusa();
    buildFlyingChairs(); 
    scene.add(baseContainer);
  };


  
  function buildScenario() {
    // Suelo con el shader personalizado
  const groundGeometry = new THREE.PlaneGeometry(500, 500, 1, 1);
  const ground = new THREE.Mesh(groundGeometry, groundShaderMaterial); // Usar el material con el shader
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.1, 0);
  baseContainer.add(ground);

    //Pileta
    // Cargar texturas necesarias
const textureLoader = new THREE.TextureLoader();
const normalMap1 = textureLoader.load("Water_1_M_Normal.jpg"); // Primera textura de normales
const normalMap2 = textureLoader.load("Water_2_M_Normal.jpg"); // Segunda textura de normales
const flowMap = textureLoader.load("Water_1_M_Flow.jpg"); // Textura para simular flujo

// Cargar un entorno de reflexión
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMap = cubeTextureLoader.load([
  "path_to_posx.jpg", // Imagen para el lado positivo del eje X
  "path_to_negx.jpg", // Imagen para el lado negativo del eje X
  "path_to_posy.jpg", // Imagen para el lado positivo del eje Y
  "path_to_negy.jpg", // Imagen para el lado negativo del eje Y
  "path_to_posz.jpg", // Imagen para el lado positivo del eje Z
  "path_to_negz.jpg", // Imagen para el lado negativo del eje Z
]);

// Configurar el material del agua con múltiples mapas
const waterMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x4080ff, // Color base del agua
  roughness: 0.05, // Superficie muy reflectante
  metalness: 0.5, // Propiedad metálica para mayor reflejo
  normalMap: normalMap1, // Mapa de normales inicial
  normalScale: new THREE.Vector2(0.5, 0.5), // Escalar las normales para un efecto más suave
  envMap: environmentMap, // Reflejo del entorno
  transmission: 0.8, // Transparencia
  opacity: 1.0, // Totalmente visible
  clearcoat: 1.0, // Brillo superior
  clearcoatRoughness: 0.1, // Rugosidad del brillo
});

// Crear la piscina con el material del agua
const poolGeometry = new THREE.BoxGeometry(30, 1, 20);
const pool = new THREE.Mesh(poolGeometry, waterMaterial);
pool.position.set(55, 0.5, -30);

// Habilitar sombras para el agua
pool.castShadow = true;
pool.receiveShadow = true;

// Añadir a la escena
baseContainer.add(pool);

// Configurar el entorno en la escena
scene.environment = environmentMap; // Reflejo global

// Animar el agua simulando flujo
const clock = new THREE.Clock(); // Reloj para animación
function animateWater() {
  const elapsedTime = clock.getElapsedTime();

  // Alternar entre normalMap1 y normalMap2 para simular perturbaciones
  waterMaterial.normalMap = elapsedTime % 2 < 1 ? normalMap1 : normalMap2;

  // Simular flujo utilizando flowMap
  waterMaterial.normalOffset = new THREE.Vector2(
    Math.sin(elapsedTime) * 0.1,
    Math.cos(elapsedTime) * 0.1
  );
}

    //base de la pileta
    const basepoolGeometry = new THREE.BoxGeometry(35, 0.5, 25);
    const basepool = new THREE.Mesh(basepoolGeometry, materials.cement);
    basepool.position.set(55, 0.5, -30);
    baseContainer.add(basepool);

    const directionalLight = new THREE.DirectionalLight(0xeeeeff, 1);
    directionalLight.position.set(-1, 2, 3);
    scene.add(directionalLight);

    const hemiLight = new THREE.HemisphereLight(0x8888dd, 0x080866, 0.2);
    scene.add(hemiLight);

    addLampPosts();

  }
  // generate random integer between from and to
  function randomInteger(from, to) {
    let value =
      from + Math.floor((0.5 + 0.5 * Math.sin(c1 * SEED1)) * (to - from));
    c1 += value;
    return value;
  }

  // generate random float between from and to
  function randomFloat(from, to) {
    let value = from + (0.5 + 0.5 * Math.sin(c1 * SEED2)) * (to - from);
    c1 += value;
    return value;
  }


  function addLampPosts() {
    const positions = [
      new THREE.Vector3(-50, 0, -50),
      new THREE.Vector3(-50, 0, 50),
      new THREE.Vector3(50, 0, -50),
      new THREE.Vector3(50, 0, 50),
      new THREE.Vector3(80, 0, 100),
      new THREE.Vector3(70, 0, -100),
      new THREE.Vector3(-130, 0, 50),
      new THREE.Vector3(0, 0, 80),
    ];

    positions.forEach(position => {
      const lampPost = createLampPost(10, 0.5, 0xffff00);
      lampPost.position.copy(position);
      baseContainer.add(lampPost);
    });
  }

  function createLampPost(height, intensity, color) {
    // create post

    if (!intensity) intensity = 0.3;

    let lampPost = new THREE.Group();
    let postGeometry = new THREE.CylinderGeometry(0.1, 0.1, height, 12);

    postGeometry.translate(0, height / 2, 0);
    let post = new THREE.Mesh(postGeometry, materials["post"]);

    let lampGeometry = new THREE.SphereGeometry(0.3, 32, 16);
    let lightMaterial = materials["light" + randomInteger(1, 5)];
    let lamp = new THREE.Mesh(lampGeometry, lightMaterial);
    lamp.position.set(0, height, 0);

    lampPost.add(post);
    lampPost.add(lamp);

    if (!isDaytime) {
      const light = new THREE.PointLight(
        lightMaterial.emissive,
        intensity,
        10,
        1
      );
      light.position.set(0, height, 0);
      lampPost.add(light);
    }

    return lampPost;
  }

  // create a color from HSL
  function hslColor(hue, saturation, lightness) {
    let color = new THREE.Color();
    color.setHSL(hue, saturation, lightness);
    return parseInt("0x" + color.getHexString());
  }

  function buildMontanaRusa() {
    // Definir puntos para la curva del riel
     const pathPoints = [
        new THREE.Vector3(55, 25, 10),
        new THREE.Vector3(55, 30, 20),
        new THREE.Vector3(45, 35, 30),
        new THREE.Vector3(35, 40, 35),
        new THREE.Vector3(25, 35, 35),
        new THREE.Vector3(15, 30, 35), //p6
        new THREE.Vector3(5, 20, 35),
        new THREE.Vector3(-5, 20, 35),
        new THREE.Vector3(-15, 20, 35),
        new THREE.Vector3(-25, 15, 35),//p10
        new THREE.Vector3(-30, 15, 32),
        new THREE.Vector3(-40, 10, 27),
        new THREE.Vector3(-47, 10, 17),
        new THREE.Vector3(-40, 10, 5),//p14
        new THREE.Vector3(-30, 10, 0),
        new THREE.Vector3(-15, 10, 5),
        new THREE.Vector3(-18, 15, 20),
        new THREE.Vector3(-37, 15, 27),
        new THREE.Vector3(-47, 18, 25),//p19 desde aca
        new THREE.Vector3(-55, 18, 15),
        new THREE.Vector3(-55, 18, 5),//tunel
        new THREE.Vector3(-55, 18, -5),//tunel
        new THREE.Vector3(-45, 18, -15),//p23
        new THREE.Vector3(-35, 18, -20),//hasta aca
        new THREE.Vector3(-25, 18, -20),
        new THREE.Vector3(-15, 18, -20),
        new THREE.Vector3(-5, 10, -20),
        new THREE.Vector3(5, 15, -15),//p28
        new THREE.Vector3(15, 10, -10),
        new THREE.Vector3(25, 18, -5),
        new THREE.Vector3(38, 18, -7.5),
        new THREE.Vector3(52.5, 20, 0),
        new THREE.Vector3(55, 25, 10)
      ];

   // Cargar el entorno para mapas de reflexión
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMap = cubeTextureLoader.load([
  'textures/px.png', // Positivo X
  'textures/nx.png', // Negativo X
  'textures/py.png', // Positivo Y
  'textures/ny.png', // Negativo Y
  'textures/pz.png', // Positivo Z
  'textures/nz.png', // Negativo Z
]);

// Aplicar el mapa de entorno
envMap.encoding = THREE.sRGBEncoding;
scene.environment = envMap;

// Crear material metálico reflectivo para los rieles
const railMaterial = new THREE.MeshStandardMaterial({
  color: 0x888888, // Gris metálico
  metalness: 1,    // Totalmente metálico
  roughness: 0.2,  // Suavidad baja para mayor reflejo
  envMap: envMap,  // Usar el mapa de entorno
});

// Forma del perfil del riel
const shape = new THREE.Shape();
shape.moveTo(2, 2);
shape.bezierCurveTo(5, 0, 1.5, 1, 1.5, 0);
shape.bezierCurveTo(1.5, 5, -1, -2, 0, 3);

// Curva del riel
const densePathPoints = interpolatePoints(pathPoints, 5);
const curve = new THREE.CatmullRomCurve3(pathPoints, true, 'catmullrom', 0.5); // Ajusta la tensión a 0.5

// Configuración para la extrusión
const extrudeSettings = {
  steps: 2000, // pasos para una extrusión suave
  extrudePath: curve,
};

// Geometría y malla del riel
const railGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const railMesh = new THREE.Mesh(railGeometry, railMaterial);
railMesh.castShadow = true;    // Permitir que los rieles proyecten sombras
railMesh.receiveShadow = true; // Permitir que reciban sombras
baseContainer.add(railMesh);

// Longitud total de la curva
const curveLength = curve.getLength();
const supportSpacing = 13; // distancia entre soportes
const numSupports = Math.floor(curveLength / supportSpacing);

// Geometría y mallas para los soportes
const supportGeometry = new THREE.CylinderGeometry(1, 1, 4.5, 32); // Más segmentos para suavidad
for (let i = 0; i < numSupports; i++) {
  const supportPosition = i / numSupports;
  const point = curve.getPointAt(supportPosition);

  const support = new THREE.Mesh(supportGeometry, materials.soporte);
  support.position.set(point.x, point.y / 2, point.z);
  support.scale.y = Math.max(1, point.y / 5); // Escalar según altura
  support.castShadow = true;
  support.receiveShadow = true;

  baseContainer.add(support);
}

// Configuración del renderizador para sombras
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves

    let lampPostHeight = randomFloat(2, 7);

    let numberOfLampPosts = randomInteger(1, 1);
    let lampPostLineSpacing = 16;
    let lampPostHue = randomFloat(0, 1);

    for (let i = 1; i <= numberOfLampPosts; i++) {
      let lampPost = createLampPost(
        lampPostHeight,
        0.65,
        hslColor(lampPostHue, 1, 0.75)
      );
      let lampPostSpacing = lampPostLineSpacing / numberOfLampPosts;
      lampPost.position.set(
        lampPostLineSpacing / 2 - i * lampPostSpacing,
        0,
        8
      );
      baseContainer.add(lampPost);
    }
    
// carrito en el riel
const cart = createCart(materials); 
// Crear el carrito
const carrito = new THREE.Object3D();

scene.add(carrito);


// Posiciona el carrito inicialmente
const startPosition = curve.getPointAt(0);
const startTangent = curve.getTangentAt(0);

cart.position.copy(startPosition);
cart.lookAt(startPosition.clone().add(startTangent)); // Orientar el carrito hacia la dirección inicial
baseContainer.add(cart); 

function interpolatePoints(points, divisions = 10) {
  const interpolatedPoints = [];
  for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      for (let j = 0; j <= divisions; j++) {
          const t = j / divisions;
          interpolatedPoints.push(
              new THREE.Vector3(
                  THREE.MathUtils.lerp(start.x, end.x, t),
                  THREE.MathUtils.lerp(start.y, end.y, t),
                  THREE.MathUtils.lerp(start.z, end.z, t)
              )
          );
      }
  }
  return interpolatedPoints;
}

// Tuneles
// Función para el túnel con forma de óvalo estirado
function ovaloEstirado() {
  return function (u, v, target) {
      u *= 2 * Math.PI;
      v *= 2 * Math.PI;
      const puntoOvalo = new THREE.Vector3(5 * Math.cos(u), 0, -5 * Math.sin(u));
      const matrizTraslacion = new THREE.Matrix4().makeTranslation(0, 4 * v, 0);
      const matrizEscalado = new THREE.Matrix4().makeScale(1 + 0.5 * Math.cos(5 * v), 0, 1 - 0.5 * Math.cos(4 * v));

      puntoOvalo.applyMatrix4(matrizEscalado).applyMatrix4(matrizTraslacion);
      target.set(puntoOvalo.x, puntoOvalo.y, puntoOvalo.z);
  };
}

// Geometría del túnel
const geometry2 = new ParametricGeometry(ovaloEstirado(), 100, 100);

// Material con texturas para el túnel (mapa de color y Alpha)
const tunnelColorTexture = textureLoader.load('maps/tunnelColor.jpg');
const tunnelAlphaTexture = textureLoader.load('maps/tunnelAlpha.png');
tunnelColorTexture.wrapS = tunnelColorTexture.wrapT = THREE.RepeatWrapping;
tunnelAlphaTexture.wrapS = tunnelAlphaTexture.wrapT = THREE.RepeatWrapping;

// Configurar el material del túnel
const tunnelMaterial = new THREE.MeshPhongMaterial({
  map: tunnelColorTexture,       // Mapa de color difuso
  alphaMap: tunnelAlphaTexture,  // Mapa de Alpha
  transparent: true,             // Habilitar transparencias
  side: THREE.DoubleSide,        // Renderizar ambos lados
});

// Mesh del túnel
const tunnelMesh = new THREE.Mesh(geometry2, tunnelMaterial);
tunnelMesh.castShadow = true;    // Permitir que el túnel proyecte sombras
tunnelMesh.receiveShadow = true; // Permitir que reciba sombras
scene.add(tunnelMesh);

// Ajustar las coordenadas UV (opcional si el mapeo UV ya está correcto)
geometry2.attributes.uv.needsUpdate = true;

// Configuración del renderizador y sombras
renderer.shadowMap.enabled = true; // Habilitar mapas de sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Opcional: sombra suave


// Opcional: Transformaciones adicionales al túnel
tunnelMesh.translateX(-15);
tunnelMesh.translateY(18);
tunnelMesh.translateZ(-20);
tunnelMesh.rotateX(Math.PI / 2);
tunnelMesh.rotateZ(Math.PI / 2);

  function espiral() {
    const shape = new THREE.Shape();
    shape.moveTo(-2, 0);
    shape.lineTo(-2, 4);
    shape.lineTo(2, 4);
    shape.lineTo(2, -4);
    shape.lineTo(-2, -4);
    shape.closePath();

    return function (u, v, target) {
        const puntoForma = new THREE.Vector3(shape.getPointAt(u).x, 0, shape.getPointAt(u).y);
        const matrizTraslacion = new THREE.Matrix4().makeTranslation(0, 10 * v, 0);
        const matrizRotation = new THREE.Matrix4().makeRotationY(3 * 2 * Math.PI * v);

        puntoForma.applyMatrix4(matrizRotation).applyMatrix4(matrizTraslacion);

        target.set(puntoForma.x, puntoForma.y, puntoForma.z);
    }
}

/***desde aca la actualoxacion */

//Geometría del túnel
const geometry1 = new ParametricGeometry(espiral(), 100, 100);

// Material con texturas para el túnel (mapa de color y Alpha)
const tunnel2ColorTexture = textureLoader.load('maps/tunnelColor2.jpg');
const tunnel2AlphaTexture = textureLoader.load('maps/tunnelAlpha2.png');
tunnel2ColorTexture.wrapS = tunnel2ColorTexture.wrapT = THREE.RepeatWrapping;
tunnel2AlphaTexture.wrapS = tunnel2AlphaTexture.wrapT = THREE.RepeatWrapping;

// Configurar el material del túnel
const tunnel2Material = new THREE.MeshPhongMaterial({
  map: tunnel2ColorTexture,       // Mapa de color difuso
  alphaMap: tunnel2AlphaTexture,  // Mapa de Alpha
  transparent: true,             // Habilitar transparencias
  side: THREE.DoubleSide,        // Renderizar ambos lados
});

// Mesh del túnel
const tunnelMesh2 = new THREE.Mesh(geometry1, tunnel2Material);
tunnelMesh2.castShadow = true;    // Permitir que el túnel proyecte sombras
tunnelMesh2.receiveShadow = true; // Permitir que reciba sombras
scene.add(tunnelMesh2);

// Ajustar las coordenadas UV (opcional si el mapeo UV ya está correcto)
geometry1.attributes.uv.needsUpdate = true;

// Configuración del renderizador y sombras
renderer.shadowMap.enabled = true; // Habilitar mapas de sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Opcional: sombra suave

tunnelMesh2.translateX(-56);
tunnelMesh2.translateY(18);
tunnelMesh2.translateZ(5);
tunnelMesh2.rotateX(Math.PI / 2);


// Animar el carrito
renderer.setAnimationLoop(() => {
  animateCart(curve); 
  renderer.render(scene, camera); 
});

// Animar el carrito a lo largo de la curva
let t = 0;
function animateCar() {
    t += 0.001; // Incrementa t para animar
    if (t > 1) t = 0; // Reiniciar el ciclo
    const position = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    // Actualiza posición y orientación del carrito
    cart.position.copy(position);
    const axis = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
    const angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(tangent));
    cart.quaternion.setFromAxisAngle(axis, angle);

    requestAnimationFrame(animateCar);
}
animateCar();

function createCart(materials) {
  const cartGroup = new THREE.Group();
  const material = new THREE.MeshPhongMaterial({ color: 0xffbf00, shininess: 150, side: THREE.DoubleSide });

  // Cilindro exterior del carrito
  const outerGeometry = new THREE.CylinderGeometry(1, 1, 5, 32, 1, true, Math.PI / 1.8, Math.PI * 1.5);
  const outerBody = new THREE.Mesh(outerGeometry, material);
  //outerBody.rotation.x = Math.PI / 2;
  cartGroup.add(outerBody);

  // Cilindro interior del carrito para simular grosor
  const innerGeometry = new THREE.CylinderGeometry(0.9, 0.9, 5, 32, 1, true, Math.PI / 1.8, Math.PI * 1.5);
  const innerBody = new THREE.Mesh(innerGeometry, material);
  //innerBody.rotation.x = Math.PI / 2;
  cartGroup.add(innerBody);

  // Parte delantera del carrito
  const frontGeometry = new THREE.CylinderGeometry(0.5, 1, 1, 16);
  const front = new THREE.Mesh(frontGeometry, materials.plastic);
  front.position.set(0, 3, 0);
  //front.rotation.x = Math.PI / 2;
  cartGroup.add(front);

  // Parte trasera del carrito
  const backGeometry = new THREE.CylinderGeometry(0.5, 1, 1, 16);
  const back = new THREE.Mesh(backGeometry, materials.plastic);
  back.position.set(0, -3, 0);
  back.rotation.x = Math.PI ;
  cartGroup.add(back);

  // Asientos verdes dentro del carrito
  const seatMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const seatWidth = 0.8, seatHeight = 0.4, seatDepth = 1;
  const seatGeometry = new THREE.BoxGeometry(seatWidth, seatHeight, seatDepth);

  const seat1 = new THREE.Mesh(seatGeometry, seatMaterial);
  seat1.position.set(0, -1, 0);
  cartGroup.add(seat1);

  const seat2 = new THREE.Mesh(seatGeometry, seatMaterial);
  seat2.position.set(0, 1, 0);
  cartGroup.add(seat2);

  return cartGroup;
}

scene.add(cart);
  }

  function buildFlyingChairs() {
    const swingGroup = new THREE.Group();
  
    swingGroup.position.set(-60, 0, 60);
  
    // Base del disco (soporte central)
    const baseGeometry = new THREE.CylinderGeometry(1, 1, 10, 32);
    const base = new THREE.Mesh(baseGeometry, materials.cement);
    base.position.y = 5;
    base.castShadow = true;
base.receiveShadow = true;
    swingGroup.add(base);
  
    // Disco superior que rota
    const diskGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
    const disk = new THREE.Mesh(diskGeometry, materials.disk);
    disk.position.y = 10;
    disk.castShadow = true;
    disk.receiveShadow = true;
    swingGroup.add(disk);
    
  
    const numChairs = 8; 
    const chairDistance = 5; 
    const chainLength = 4; 
    const centrifugalFactor = 2; // Factor que controla la extensión de las cadenas hacia afuera
  
    for (let i = 0; i < numChairs; i++) {
      const angle = (i / numChairs) * Math.PI * 2; // Ángulo para distribuir las sillas uniformemente
  
      // grupo para la cadena y la silla
      const chainGroup = new THREE.Group();
      disk.add(chainGroup); 
      // Posicionar el grupo en el borde del disco
      chainGroup.position.set(
        Math.sin(angle) * chairDistance,
        0,
        Math.cos(angle) * chairDistance
      );
      // cadena
      const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, chainLength, 8);
      const chain = new THREE.Mesh(chainGeometry, materials.oxide);
      chain.position.y = -chainLength / 2; // Centrar la cadena verticalmente
      chain.castShadow = true;
      chain.receiveShadow = true;
      chainGroup.add(chain);
  
      // silla (asiento)
      const chairGroup = new THREE.Group();
      const seatGeometry = new THREE.BoxGeometry(1, 0.4, 1);
      const seat = new THREE.Mesh(seatGeometry, materials.plastic);
      seat.position.y = -chainLength - 0.1; // Colocar el asiento al final de la cadena
      seat.castShadow = true;
      seat.receiveShadow = true;
      chairGroup.add(seat);
  
      // respaldo
      const backrestGeometry = new THREE.BoxGeometry(1, 1.5, 0.2);
      const backrest = new THREE.Mesh(backrestGeometry, materials.plastic);
      backrest.position.set(0, -chainLength + 1, -0.4); // Ajustar la posición del respaldo
      backrest.castShadow = true;
      backrest.receiveShadow = true;
      chairGroup.add(backrest);
  
      // apoyabrazos
      const armrestGeometry = new THREE.BoxGeometry(0.2, 1, 1);
      const leftArmrest = new THREE.Mesh(armrestGeometry, materials.plastic);
      const rightArmrest = new THREE.Mesh(armrestGeometry, materials.plastic);
      leftArmrest.position.set(-0.4, -chainLength - 0.2, 0);
      rightArmrest.position.set(0.4, -chainLength - 0.2, 0);
      leftArmrest.castShadow = true;
    leftArmrest.receiveShadow = true;
    rightArmrest.castShadow = true;
    rightArmrest.receiveShadow = true;
      chairGroup.add(leftArmrest);
      chairGroup.add(rightArmrest);
  
      // grupo de la silla al extremo inferior de la cadena
      chain.add(chairGroup);
    }
  
    baseContainer.add(swingGroup);
  
    // Animación de rotación y oscilación
    renderer.setAnimationLoop(() => {
      swingAngle += swingSpeed;
      disk.rotation.y = swingAngle; // Rotar el disco
  
      disk.children.forEach((chainGroup) => {
        // inclinación de las cadenas debido a la fuerza centrífuga
        const tiltAngle = Math.atan(centrifugalFactor * swingSpeed); // Relación entre velocidad y ángulo
      });
    });
  }


  ///Desde aca la iluminacion
// Inicializamos las luces
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50); // Ajusta la posición según lo necesario
scene.add(directionalLight);

const hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0x6A5140, 0.6); // Luz hemisférica
hemiLight.position.set(0, 100, 0); // Ajusta la posición
directionalLight.castShadow = true;
scene.add(hemiLight);

// Definimos las luces en un objeto para acceso posterior
const lights = [directionalLight, hemiLight];

// Cielo
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.ShaderMaterial({
  uniforms: {
    topColor: { value: new THREE.Color(0x87CEEB) },
    bottomColor: { value: new THREE.Color(0xFFE4B5) },
    dayNightFactor: { value: 0 },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float dayNightFactor;
    varying vec3 vWorldPosition;
    void main() {
      float heightFactor = normalize(vWorldPosition).y * 0.5 + 0.5;
      vec3 color = mix(bottomColor, topColor, heightFactor);
      color = mix(color, vec3(0.02, 0.02, 0.05), dayNightFactor); // Oscurecer en la noche
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.BackSide,
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Luz del sol
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(50, 100, 50); // Posición inicial
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 500;
scene.add(sunLight);

// Estrellas
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 1000;
  positions[i * 3 + 1] = Math.random() * 500;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
}
starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.5,
  transparent: true,
  opacity: 0,
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Niebla
scene.fog = new THREE.FogExp2(0xA9F0FE, 0.002);

// Funciones para actualizar
const updateSunPosition = () => {
  const angle = (1 - dayNight) * Math.PI; // Ángulo según el ciclo día/noche
  const tilt = 0.3; // Inclinación
  const sunPosition = new THREE.Vector3(
    Math.sin(angle) * 100,
    Math.cos(angle) * 100 * Math.cos(tilt),
    Math.sin(tilt) * 100
  );
  sunLight.position.copy(sunPosition);
  sunLight.color.setHSL(0.1, 0.7, 0.5 + 0.5 * (1 - dayNight)); // Más cálido al amanecer/atardecer
};

function updateDayNight() {
  // Interpolamos el color del cielo
  skyMaterial.uniforms.topColor.value = dayNight > 0.9
    ? new THREE.Color(0x001a4d)
    : new THREE.Color(0x87CEEB);
  skyMaterial.uniforms.bottomColor.value = dayNight > 0.75
    ? new THREE.Color(0x080808)
    : new THREE.Color(0xFFE4B5);
  skyMaterial.uniforms.dayNightFactor.value = dayNight;

  // Ajustamos la emisividad de las ventanas
  const windowColor = new THREE.Color().setHSL(0.5, 0, dayNight);
  materials["window"].emissive = windowColor;

  // Ajustamos la intensidad de las luces
  directionalLight.intensity = 1 - dayNight;
  hemiLight.intensity = 0.3 + (1 - dayNight) * 0.5;
  sunLight.intensity = 1 - dayNight;

  // Ajustamos las estrellas
  starMaterial.opacity = Math.max(0, dayNight - 0.2);

  // Ajustamos la niebla
  scene.fog.color.set(dayNight > 0.5 ? 0x000000 : 0xA9F0FE);
  scene.fog.density = dayNight > 0.5 ? 0.01 : 0.002;

  // Posición del sol
  updateSunPosition();
}

// Ciclo día/noche dinámico
let dayNight = 0; // 0: día completo, 1: noche completa
Object.defineProperty(this, "dayNightFactor", {
  get() {
    return dayNight;
  },
  set(value) {
    dayNight = value;
    updateDayNight();
  },
});

// Inicialización
updateDayNight();



  //Hata aca la iluminacion

  //camaras
  // Cámaras personalizadas
this.cameras = {
  orbital: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
  seat1: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
  seat2: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
  swingView: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
  swingOrbital: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000), // Nueva cámara
};

// Posición inicial de las cámaras
this.camerasPosition = {
  orbital: new THREE.Vector3(80, 50, 60),
  seat1: new THREE.Vector3(0, 5, -5),
  seat2: new THREE.Vector3(0, 5, 5),
  swingView: new THREE.Vector3(0, 50, 0),
  swingOrbital: new THREE.Vector3(-70, 5, 70), // Posición orbital para las sillas voladoras
};

//this.currentCamera = "orbital"; // Cámara predeterminada

// Vincular cámaras con sus posiciones iniciales
Object.entries(this.cameras).forEach(([name, camera]) => {
  camera.position.copy(this.camerasPosition[name]);
  scene.add(camera); // Añadir las cámaras a la escena
});

// Métodos para manejar cámaras
this.setCurrentCamera = (name) => {
  if (this.cameras[name]) {
    this.currentCamera = name;
  }
};

this.getCurrentCamera = () => {
  return this.cameras[this.currentCamera] || this.cameras["seat1"];
};

}
