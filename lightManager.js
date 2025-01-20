// Importamos las librerías necesarias de Three.js
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

// Definimos constantes para la intensidad de las luces
const SunIntensity = 1.1; // Intensidad de la luz solar
const AmbientIntensity = 1; // Intensidad de la luz ambiental

// Clase para manejar las luces de la escena
export class LightManager {
    constructor(scene) {
        // Guardamos la escena para usarla más adelante
        this.scene = scene;

        // Propiedades para configurar las luces y sombras
        this.properties = {
            sunLightHelper: false, // Mostrar o no el helper de la luz solar
            shadowCamHelper: false, // Mostrar o no el helper de la cámara de sombras
            shadowMapSize: { left: -12, right: 12, top: -10, bottom: 10 }, // Tamaño del mapa de sombras
            shadowMapResolution: { w: 1024, h: 1024 }, // Resolución del mapa de sombras
            shadowNear: 0.5, // Distancia mínima de sombras
            shadowFar: 80, // Distancia máxima de sombras
            spotShadowMap: { w: 1024, h: 1024 }, // Resolución del mapa de sombras del foco
            spotColor: 0xffffff, // Color del foco
            spotDistance: 15, // Distancia del foco
            spotPenumbra: 0.3, // Penumbra del foco
            spotAngle: Math.PI / 8 // Ángulo del foco
        };

        // Creamos la luz solar
        this.sunLight = new THREE.DirectionalLight(0xffffff, SunIntensity);
        this.sunLight.castShadow = true; // Habilitamos las sombras
        this.sunLight.position.set(2, 10, 0); // Posición de la luz solar
        this.sunLight.lookAt(0, 0, 0); // La luz apunta al origen

        // Configuramos las sombras de la luz solar
        this.sunLight.shadow.mapSize.width = this.properties.shadowMapResolution.w;
        this.sunLight.shadow.mapSize.height = this.properties.shadowMapResolution.h;
        this.sunLight.shadow.camera.near = this.properties.shadowNear;
        this.sunLight.shadow.camera.far = this.properties.shadowFar;
        this.sunLight.shadow.camera.left = this.properties.shadowMapSize.left;
        this.sunLight.shadow.camera.right = this.properties.shadowMapSize.right;
        this.sunLight.shadow.camera.top = this.properties.shadowMapSize.top;
        this.sunLight.shadow.camera.bottom = this.properties.shadowMapSize.bottom;

        // Creamos una luz para simular la noche
        this.nightLight = new THREE.HemisphereLight(0x8888dd, 0x080866, 0.1);

        // Agregamos las luces a la escena
        scene.add(this.nightLight);
        scene.add(this.sunLight);

        // Creamos una luz ambiental
        this.ambientLight = new THREE.AmbientLight(0x666666);
        scene.add(this.ambientLight);

        // Agregamos niebla a la escena
        scene.fog = new THREE.Fog(0x7c503f, 20, 80);

        // Lista para las luces de las lámparas
        this.lampLights = [];

        // Inicializamos el cielo
        this.initSky();
    }

    // Muestra u oculta un helper para la luz solar
    showSunHelper(show) {
        const HelperName = "SunHelper";
        if (show) {
            const helper = new THREE.DirectionalLightHelper(this.sunLight, 5);
            helper.name = HelperName;
            this.scene.add(helper);
        } else {
            let helper = this.scene.getObjectByName(HelperName);
            this.scene.remove(helper);
        }
    }

    // Muestra u oculta un helper para la cámara de sombras
    showShadowHelper(show) {
        const HelperName = "ShadowHelper";
        if (show) {
            const helper = new THREE.CameraHelper(this.sunLight.shadow.camera);
            helper.name = HelperName;
            this.scene.add(helper);
        } else {
            let helper = this.scene.getObjectByName(HelperName);
            this.scene.remove(helper);
        }
    }

    // Agrega una luz a una lámpara
    addLamp(lamp) {
        const intensity = this.effectController.elevation < 5 || this.effectController.elevation > 175 ? 0.8 : 0;
        let light = new THREE.PointLight(lamp.lampColor, intensity, 10, 1);
        this.lampLights.push(light);
        light.position.set(0, lamp.height, 0);
        lamp.add(light);
    }

    // Agrega una luz a la cámara en primera persona
    addLightToFPV(camera) {
        this.fpvLight = new THREE.SpotLight(this.properties.spotColor, 0.0, this.properties.spotDistance, this.properties.spotAngle, this.properties.spotPenumbra);
        this.fpvLight.position.set(0, 0.25, 0.5); // Posición de la luz
        this.fpvLight.target.position.set(0, 0, -1); // Dirección de la luz
        this.scene.add(this.fpvLight);

        camera.add(this.fpvLight);
        camera.add(this.fpvLight.target);
    }

    // Alterna el estado de la luz en primera persona
    switchFPVLight() {
        if (this.fpvLight) {
            this.fpvLight.intensity = this.fpvLight.intensity > 0 ? 0.0 : 1.0;
        }
    }

    // Inicializa el cielo y sus propiedades
    initSky() {
        this.effectController = {
            turbidity: 1.8,
            rayleigh: 0.755,
            mieCoefficient: 0,
            mieDirectionalG: 0.287,
            elevation: 50,
            azimuth: 250,
            exposure: 0.28
        };

        this.sky = new Sky();
        this.sky.scale.setScalar(45000);
        this.scene.add(this.sky);

        this.sun = new THREE.Vector3();
        this.skyChanged();
    }

    // Cambia las propiedades del cielo según la posición del sol
    skyChanged() {
        const effectController = this.effectController;
        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = effectController.turbidity;
        uniforms['rayleigh'].value = effectController.rayleigh;
        uniforms['mieCoefficient'].value = effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);

        this.sun.setFromSphericalCoords(1, phi, theta);
        this.sunLight.position.setFromSphericalCoords(20, phi, theta);

        uniforms['sunPosition'].value.copy(this.sun);

        const color = new THREE.Color();
        if (effectController.elevation < -2) {
            color.setHex(0x44393f); // Color oscuro para la noche
            this.sunLight.intensity = 0;
            this.ambientLight.intensity = 0;
            this.nightLight.intensity = 3 / 14;
            this.lampLights.map((lamp) => lamp.intensity = 0.8);
        } else {
            const factor = Math.abs(Math.sin(phi) ** 90);
            color.lerpColors(new THREE.Color(0xffffff), new THREE.Color(0x8e805c), factor);

            this.lampLights.map((lamp) => lamp.intensity = 0);
            this.ambientLight.intensity = AmbientIntensity;
            this.sunLight.intensity = SunIntensity;

            if (effectController.elevation < 5 || effectController.elevation > 175) {
                this.lampLights.map((lamp) => lamp.intensity = 0.8);
                let elevationValue = effectController.elevation;
                if (elevationValue > 175) elevationValue = 180 - elevationValue;

                this.sunLight.intensity = (elevationValue + 3) / 7;
                this.nightLight.intensity = 0.5 - (elevationValue + 3) / 14;
            }
        }

        this.scene.fog.color = color;
    }

    // Cambia la elevación del sol
    setSunElevation(elevation) {
        this.effectController.elevation = elevation;
    }
}
