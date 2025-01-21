import * as THREE from 'three';

export class Pileta extends THREE.Object3D {
    constructor(width, length) {
        super();

        const height = 0.1; // Altura de los bordes y la base
        const bordersSize = 0.1; // Tamaño de los bordes
        const borderColor = 0x999999; // Color de los bordes

        // Crear el agua
        const waterGeo = new THREE.PlaneGeometry(width - bordersSize, length - bordersSize);
        waterGeo.translate(0, 0, height / 2); // Elevar el agua

        const waterMat = new THREE.MeshPhongMaterial({ color: 0x0000DD, side: THREE.DoubleSide });
        this.water = new THREE.Mesh(waterGeo, waterMat);
        this.water.rotation.x = -Math.PI / 2; // Orientar horizontalmente

        // Crear la base
        const baseMaterial = new THREE.MeshPhongMaterial({ color: borderColor, side: THREE.DoubleSide });
        const baseGeo = new THREE.PlaneGeometry(width - bordersSize, length - bordersSize);
        baseGeo.translate(0, 0, height / 8); // Elevar la base

        this.base = new THREE.Mesh(baseGeo, baseMaterial);
        this.base.rotation.x = -Math.PI / 2; // Orientar horizontalmente

        // Crear los bordes
        this.borders = new THREE.Object3D();
        const borderMaterial = new THREE.MeshPhongMaterial({ color: borderColor });

        const geoA = new THREE.BoxGeometry(bordersSize, height, length + bordersSize);
        geoA.translate(width / 2 - bordersSize / 2, height / 2, 0);
        const borderA = new THREE.Mesh(geoA, borderMaterial);

        const geoB = new THREE.BoxGeometry(width - bordersSize * 2, height, bordersSize);
        geoB.translate(0, height / 2, length / 2);
        const borderB = new THREE.Mesh(geoB, borderMaterial);

        const geoC = new THREE.BoxGeometry(bordersSize, height, length + bordersSize);
        geoC.translate(-width / 2 + bordersSize / 2, height / 2, 0);
        const borderC = new THREE.Mesh(geoC, borderMaterial);

        const geoD = new THREE.BoxGeometry(width - bordersSize * 2, height, bordersSize);
        geoD.translate(0, height / 2, -length / 2);
        const borderD = new THREE.Mesh(geoD, borderMaterial);

        this.borders.add(borderA);
        this.borders.add(borderB);
        this.borders.add(borderC);
        this.borders.add(borderD);

        // Añadir componentes a la piscina
        this.add(this.borders);
        this.add(this.water);
        this.add(this.base);
    }

    animate() {
        // Animar el agua si tiene un mapa de normales
        if (this.water.material.normalMap) {
            this.water.material.normalMap.offset.x = (this.water.material.normalMap.offset.x + 0.001) % 1;
            this.water.material.normalMap.offset.y = (this.water.material.normalMap.offset.y + 0.0005) % 1;
        }
    }
}


export class Lampara extends THREE.Object3D
{
    constructor(height)
    {
        super();
        
        this.height = height;
        this.lampColor = 0xaaffff;
        this.postColor = 0xd044ff;
        
        let postGeometry = new THREE.CylinderGeometry(0.02, 0.02, height, 12);
        
        postGeometry.translate(0, height / 2, 0);
        let postMaterial = new THREE.MeshPhongMaterial({
            color: this.postColor,
            shininess: 64,
            name: "post",
        })
        
        let post = new THREE.Mesh(postGeometry, postMaterial);
        
        let lampGeometry = new THREE.SphereGeometry(0.05, 32, 16);
        let lightMaterial = new THREE.MeshPhongMaterial({ emissive: this.lampColor, name: "light" });
        let lamp = new THREE.Mesh(lampGeometry, lightMaterial);
        lamp.position.set(0, height, 0);
        
        this.add(post);
        this.add(lamp);
        
        this.traverse((obj) => {obj.castShadow = true;});
    }
}
