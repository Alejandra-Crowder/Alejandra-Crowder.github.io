import { Sky } from 'three/examples/jsm/objects/Sky.js';
import * as THREE from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";


export function MontanaRusa(scene, renderer) {
  const skyDay = new THREE.Color(0xA9F0FE);
  const skyNight = new THREE.Color(0x083258);

  let dayNight = 0;
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
    tunnel: new THREE.MeshPhongMaterial({ color: 0xaaaaaa, opacity: 0.7, transparent: true, name: "tunnel" }),
    plastic: new THREE.MeshPhongMaterial({ color: 0xffbf00, shininess: 150, name: "plastic" }),
  };
  
  const textureLoader = new THREE.TextureLoader();
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
    const poolGeometry = new THREE.BoxGeometry(30, 1, 20);
    const pool = new THREE.Mesh(poolGeometry, materials.water);
    pool.position.set(55, 0.5, -30);
    baseContainer.add(pool);

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

    const densePathPoints = interpolatePoints(pathPoints, 5);
    const curve = new THREE.CatmullRomCurve3(pathPoints, true, 'catmullrom', 0.5); // Ajusta la tensión a 0.5
    
    //forma del perfil del riel en forma de `{`
    const shape = new THREE.Shape();
    shape.moveTo(2, 2);
    shape.bezierCurveTo(5, 0, 1.5, 1, 1.5, 0);
    shape.bezierCurveTo(1.5, 5, -1, -2, 0, 3);
  
    const extrudeSettings = {
      steps: 2000, // pasos para una extrusión suave
      extrudePath: curve
  };  
    const railGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const railMesh = new THREE.Mesh(railGeometry, materials.rail);
    baseContainer.add(railMesh);
  
    // Longitud total de la curva
    const curveLength = curve.getLength();
    const supportSpacing = 13; // distancia entre soportes
    const numSupports = Math.floor(curveLength / supportSpacing);

    // soportes a intervalos regulares
    const supportGeometry = new THREE.CylinderGeometry(1, 1, 4.5, 4.5);
    for (let i = 0; i < numSupports; i++) {
        const supportPosition = i / numSupports;
        const point = curve.getPointAt(supportPosition);
        const support = new THREE.Mesh(supportGeometry, materials.oxide);

        support.position.set(point.x, point.y / 2, point.z);
        support.scale.y = Math.max(1, point.y / 5); 

        baseContainer.add(support);
    }

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
// Crear la cámara en el carrito
const cameraCarrito = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraCarrito.position.set(0, 1, -2); // Ajusta esta posición para que quede correctamente en el carrito
carrito.add(cameraCarrito);
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
function ovaloEstirado() {
  return function (u, v, target) {
      u *= 2 * Math.PI;
      v *= 2 * Math.PI;
      const puntoOvalo = new THREE.Vector3(5 * Math.cos(u), 0, -5 * Math.sin(u));
      const matrizTraslacion = new THREE.Matrix4().makeTranslation(0, 4 * v, 0);
      const matrizEscalado = new THREE.Matrix4().makeScale(1 + 0.5 * Math.cos(5 * v), 0, 1 - 0.5 * Math.cos(4 * v));

      puntoOvalo.applyMatrix4(matrizEscalado).applyMatrix4(matrizTraslacion);
      target.set(puntoOvalo.x, puntoOvalo.y, puntoOvalo.z);
  }
}
const geometry2 = new ParametricGeometry(ovaloEstirado(), 100, 100);
const material2 = new THREE.MeshPhongMaterial({ color: 0xE226E2, shininess: 150, side: THREE.DoubleSide });
const mesh2 = new THREE.Mesh(geometry2, material2);
mesh2.translateX(-15);
mesh2.translateY(18);
mesh2.translateZ(-20);
mesh2.rotateX(Math.PI / 2);
mesh2.rotateZ(Math.PI / 2);
scene.add(mesh2);
const tunnel = ovaloEstirado();


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

const geometry1 = new ParametricGeometry(espiral(), 100, 100);
const material1 = new THREE.MeshPhongMaterial({ color: 0x26E22F, shininess: 150, side: THREE.DoubleSide });
const mesh1 = new THREE.Mesh(geometry1, material1);
mesh1.translateX(-56);
mesh1.translateY(18);
mesh1.translateZ(5);
mesh1.rotateX(Math.PI / 2);
scene.add(mesh1);

const tunnel2 = espiral();


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
    swingGroup.add(base);
  
    // Disco superior que rota
    const diskGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
    const disk = new THREE.Mesh(diskGeometry, materials.plastic);
    disk.position.y = 10;
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
      chainGroup.add(chain);
  
      // silla (asiento)
      const chairGroup = new THREE.Group();
      const seatGeometry = new THREE.BoxGeometry(1, 0.4, 1);
      const seat = new THREE.Mesh(seatGeometry, materials.plastic);
      seat.position.y = -chainLength - 0.1; // Colocar el asiento al final de la cadena
      chairGroup.add(seat);

      // Crear la silla voladora
const sillaVoladora = new THREE.Object3D();
// Crear la cámara en la silla voladora
const cameraSilla = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraSilla.position.set(0, 1, -2); // Ajusta esta posición para que quede correctamente en la silla
sillaVoladora.add(cameraSilla);
scene.add(sillaVoladora);

  
      // respaldo
      const backrestGeometry = new THREE.BoxGeometry(1, 1.5, 0.2);
      const backrest = new THREE.Mesh(backrestGeometry, materials.plastic);
      backrest.position.set(0, -chainLength + 1, -0.4); // Ajustar la posición del respaldo
      chairGroup.add(backrest);
  
      // apoyabrazos
      const armrestGeometry = new THREE.BoxGeometry(0.2, 1, 1);
      const leftArmrest = new THREE.Mesh(armrestGeometry, materials.plastic);
      const rightArmrest = new THREE.Mesh(armrestGeometry, materials.plastic);
      leftArmrest.position.set(-0.4, -chainLength - 0.2, 0);
      rightArmrest.position.set(0.4, -chainLength - 0.2, 0);
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

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  hemiLight.position.set(0, 100, 0); // Ajusta la posición de la luz hemisférica
  scene.add(hemiLight);

  // Definimos las luces en un objeto para acceso posterior
  const lights = [directionalLight, hemiLight];

  function updateDayNight() {
    // Interpolamos el color del cielo
    const skyColor = new THREE.Color();
    skyColor.lerpColors(skyDay, skyNight, dayNight);

    // Establecemos el color de fondo de la escena
    renderer.setClearColor(skyColor);

    // Interpolamos la emisividad de las ventanas (más brillante por la noche)
    const windowColor = new THREE.Color().setHSL(0.5, 0, dayNight);
    materials["window"].emissive = windowColor;

    // Ajustamos la intensidad de las luces
  const lightIntensity = dayNight * 0.6;
  lights.forEach((light) => {
    if (light) {
      light.intensity = lightIntensity;
    }
  });

  if (directionalLight) {
    directionalLight.intensity = 1 - dayNight;
  }
  if (hemiLight) {
    hemiLight.intensity = 0.1 + (1 - dayNight) * 0.3;
  }
}
  // public properties
  Object.defineProperty(this, "dayNightFactor", {
    get() {
      return dayNight;
    },
    set(value) {
      dayNight = value;
      updateDayNight();
    },
  });


  //Hata aca la iluminacion
}
