import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from "three/examples/jsm/geometries/ParametricGeometries.js";
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
//import { Chair} from './chair.js';

const ChairName = 'chair';


// Constantes para definir la geometría de la silla
const VERTICES_MINIMOS = 4; // Mínima cantidad de vértices
const VERTICES_USADOS = 8; // Usamos 12 para mayor flexibilidad
const SECCIONES_MINIMAS = 4; // Mínimo de secciones permitidas
const SECCIONES_USADAS = 10; // Usamos 10 para una buena calidad visual

// Clase para crear una silla 3D
export class Chair extends THREE.Object3D {
    constructor(largo, ancho, posicion = new THREE.Vector3(0, 0, 0), color = 0x1100f5) {
        super(); // Llamamos al constructor de THREE.Object3D

        this.largo = largo; // Largo de la silla
        this.ancho = ancho; // Ancho de la silla

        // Proporciones del respaldo y del asiento
        const proporcionRespaldo = 0.30;
        const proporcionAsiento = 0.30;

        // Definimos los puntos clave para la forma de "L" de la silla
        const puntos = {
            superiorA: new THREE.Vector3(0, this.largo, 0),
            superiorB: new THREE.Vector3(this.largo * proporcionRespaldo, this.largo, 0),
            medioB: new THREE.Vector3(this.largo * proporcionRespaldo, this.largo * proporcionAsiento, 0),
            medioC: new THREE.Vector3(this.largo, this.largo * proporcionAsiento, 0),
            inferiorC: new THREE.Vector3(this.largo, 0, 0),
            inferiorA: new THREE.Vector3(0, 0, 0)
        };

        // Función para definir la forma paramétrica de la silla
        const formaSilla = (u, v, destino) => {
            if (u <= 1 / 6) {
                destino.lerpVectors(puntos.superiorA, puntos.superiorB, u * 6);
            } else if (u <= 1 / 3) {
                destino.lerpVectors(puntos.superiorB, puntos.medioB, (u - 1 / 6) * 6);
            } else if (u <= 1 / 2) {
                destino.lerpVectors(puntos.medioB, puntos.medioC, (u - 1 / 3) * 6);
            } else if (u <= 2 / 3) {
                destino.lerpVectors(puntos.medioC, puntos.inferiorC, (u - 1 / 2) * 6);
            } else if (u <= 5 / 6) {
                destino.lerpVectors(puntos.inferiorC, puntos.inferiorA, (u - 2 / 3) * 6);
            } else {
                destino.lerpVectors(puntos.inferiorA, puntos.superiorA, (u - 5 / 6) * 6);
            }
            destino.z = v * this.ancho; // Proyección en el eje Z
        };

        // Creamos la geometría paramétrica para la silla
        const geometriaSilla = new ParametricGeometry(formaSilla, VERTICES_USADOS, SECCIONES_USADAS);
        geometriaSilla.computeVertexNormals(); // Calculamos las normales
        geometriaSilla.translate(posicion.x, posicion.y, posicion.z); // Movemos la geometría

        // Material para la silla
        const materialSilla = new THREE.MeshPhongMaterial({
            color: color,
            wireframe: false,
            side: THREE.DoubleSide,
            specular: 0xffffff,
            shininess: 50
        });

        // Malla de la silla
        this.mallaSilla = new THREE.Mesh(geometriaSilla, materialSilla);

        // Agregamos las tapas (frontal y trasera)
        this.tapaFrontal = this.crearTapa(puntos, THREE.FrontSide, posicion, color);
        this.tapaTrasera = this.crearTapa(puntos, THREE.BackSide, posicion, color);
        this.tapaTrasera.position.z = this.ancho;

        // Añadimos las tapas y la silla al objeto
        this.mallaSilla.add(this.tapaFrontal);
        this.mallaSilla.add(this.tapaTrasera);
        this.add(this.mallaSilla);
    }

    // Método para crear las tapas de los extremos de la silla
    crearTapa(puntos, lado, posicion, color) {
        const formaTapa = (u, v, destino) => {
            const inicio = new THREE.Vector3();
            const fin = new THREE.Vector3();

            if (v < 0.5) {
                inicio.lerpVectors(puntos.superiorA, puntos.inferiorA, v * 2);
                fin.lerpVectors(puntos.superiorB, puntos.medioB, v * 2);
            } else {
                inicio.lerpVectors(puntos.inferiorA, puntos.inferiorC, (v - 0.5) * 2);
                fin.lerpVectors(puntos.medioB, puntos.medioC, (v - 0.5) * 2);
            }
            destino.lerpVectors(inicio, fin, u);
        };

        const geometriaTapa = new ParametricGeometry(formaTapa, VERTICES_USADOS, SECCIONES_USADAS);
        geometriaTapa.computeVertexNormals();
        geometriaTapa.translate(posicion.x, posicion.y, posicion.z);

        const materialTapa = new THREE.MeshPhongMaterial({
            color: color,
            wireframe: false,
            side: lado,
            specular: 0xffffff,
            shininess: 30
        });

        return new THREE.Mesh(geometriaTapa, materialTapa);
    }
}


export class Train extends THREE.Object3D {
    
    constructor() {
        super();
        
        const slices = 32;
        const dist = 0.4;
        const radius = 0.25;
        const length = 0.5;
        const width = 0.25;
        const escale = 0.5;
        const specular = 0xffffff;
        const shininess = 40;
        const color = 0xeeff00;
        
        const ParamFunc = this.getPartsDrawingFunction(slices, dist, radius, length, width, escale, escale);
        
        const TopGeometry = new ParametricGeometry( ParamFunc, slices, 1);
        const TopMaterial = new THREE.MeshPhongMaterial({ color: color, flatShading: false, wireframe: false, side: THREE.DoubleSide, specular: specular, shininess: shininess});
        const Top = new THREE.Mesh( TopGeometry, TopMaterial );
        
        let End = Top.clone();
        
        End.position.z = -dist * 2;
        End.rotation.y = Math.PI;
        
        const BodyFunc = this.getPartsDrawingFunction(slices, 0.8, radius, width, length,0,0, false);
        
        const BodyGeo = new ParametricGeometry( BodyFunc, slices, 1);
        const BodyMaterial = new THREE.MeshPhongMaterial({ color: color, flatShading: false, wireframe: false, side: THREE.DoubleSide, specular: specular, shininess: shininess});
        const Body = new THREE.Mesh( BodyGeo, BodyMaterial );
        
        Body.position.z = -dist*2;
        Body.rotation.z = Math.PI/2;
        
        const CapGeometry = this.getCap(radius/2, length/2, width/2, 32);
        const CapMaterial = new THREE.MeshPhongMaterial({ color: color, flatShading: false, wireframe: false, side: THREE.DoubleSide, specular: specular, shininess: shininess});
        const FrontCap = new THREE.Mesh( CapGeometry, CapMaterial);
        const BackCap = new THREE.Mesh( CapGeometry, CapMaterial);
        
        FrontCap.position.z = dist;
        FrontCap.rotation.x = Math.PI/2;
        
        BackCap.position.z = -dist*3;
        BackCap.rotation.x = -Math.PI/2;
        
        const FrontChair = new Chair(0.3, 0.50);
        
        FrontChair.position.z = -0.45;
        FrontChair.position.y = 0.17;
        FrontChair.position.x = -0.25;
        FrontChair.rotation.y = Math.PI/2;
        
        const BackChair = FrontChair.clone();
        
        BackChair.position.z = -0.05;
        
        this.add(Top);
        this.add(End);
        this.add(Body);
        this.add(FrontCap);
        this.add(BackCap);
        this.add(FrontChair);
        this.add(BackChair);
        
    }
    
    getPartsDrawingFunction(slices, dist, radius, length, width, escalex, escaley, closed=true)
    {
        const slicesPerCorner = (slices - 4) / 4;
        const slicesDelta = 1 / slices;
        
        const EscaleMatrix = new THREE.Matrix3();
        
        let ParamFunc = function (u, v, target) {

            if (u != 0 && (u % 0.25) == 0)
            {
                if (u == 0.25)
                {
                    target.x = radius * Math.cos(Math.PI/2) + length/2;
                    target.y = radius * Math.sin(Math.PI/2) + width/2;
                } else if ( u == 0.5 )
                {
                    target.x = radius * Math.cos(Math.PI) + length/2;
                    target.y = radius * Math.sin(Math.PI) + width/2;
                } else if ( u == 0.75 )
                {
                    target.x = radius * Math.cos(3*Math.PI/2) + length/2;
                    target.y = radius * Math.sin(3*Math.PI/2) + width/2;
                } else if ( u == 1 )
                {
                    target.x = closed ? radius + length/2: length/2 + radius;
                    target.y = closed ? width/2 : -width/2;
                }
            } else {
                if (u <= slicesPerCorner*slicesDelta) // Casos para la primera curva
                {
                    target.x = radius * Math.cos(Math.PI/2 * u/(slicesPerCorner*slicesDelta)) + length/2;
                    target.y = radius * Math.sin(Math.PI/2 * u/(slicesPerCorner*slicesDelta)) + width/2;
                } else if (u < 0.25 && u > slicesPerCorner*slicesDelta) // Filtro para normales
                {
                    target.x = radius * Math.cos(Math.PI/2 * u/0.25) + length/2;
                    target.y = radius * Math.sin(Math.PI/2 * u/0.25) + width/2;
                } else if ( u > 0.25 && u <= (0.25 + slicesPerCorner*slicesDelta)) // Segunda curva
                {
                    target.x = radius * Math.cos(Math.PI/2 + Math.PI/2 * (u-0.25)/(slicesPerCorner*slicesDelta)) + length/2;
                    target.y = radius * Math.sin(Math.PI/2 + Math.PI/2 * (u-0.25)/(slicesPerCorner*slicesDelta)) + width/2;
                } else if (u < 0.5 && u > (0.25 + slicesPerCorner*slicesDelta)) // normales
                {
                    target.x = radius * Math.cos(Math.PI * u/0.5) + length/2;
                    target.y = radius * Math.sin(Math.PI * u/0.5) + width/2;
                } else if ( u > 0.5 && u <= (0.5 + slicesPerCorner*slicesDelta)) // Tercera
                {
                    target.x = radius * Math.cos(Math.PI + Math.PI/2 * (u-0.5)/(slicesPerCorner*slicesDelta)) + length/2;
                    target.y = radius * Math.sin(Math.PI + Math.PI/2 * (u-0.5)/(slicesPerCorner*slicesDelta)) + width/2;
                } else if (u < 0.75 && u > (0.5 + slicesPerCorner*slicesDelta)) // normales
                {
                    target.x = radius * Math.cos(1.5*Math.PI * u/0.75) + length/2;
                    target.y = radius * Math.sin(1.5*Math.PI * u/0.75) + width/2;
                } else if ( u > 0.75 && u <= (0.75 + slicesPerCorner*slicesDelta)) // Cuarta
                {
                    target.x = radius * Math.cos(1.5 * Math.PI + Math.PI/2 * (u-0.75)/(slicesPerCorner*slicesDelta)) + length/2;
                    target.y = radius * Math.sin(1.5 * Math.PI + Math.PI/2 * (u-0.75)/(slicesPerCorner*slicesDelta)) + width/2;
                } else
                {
                    target.x = radius * Math.cos(2*Math.PI * u) + length/2;
                    target.y = radius * Math.sin(2*Math.PI * u) + width/2;
                }
                
            }


            target.z = dist*v;
            EscaleMatrix.makeScale(1-escalex*v, 1-escaley*v);
            
            if (u >= 0.25 && u < 0.5)
            {
                target.x -= length;
            } else if (u >= 0.5 && u < 0.75)
            {
                target.x -= length;
                target.y -= width;
            } else if (u >= 0.75 && u < 1)
            {
                target.y -= width;
            } 
            
            if (v > 0)
                target.applyMatrix3(EscaleMatrix);
        }
        
        return ParamFunc;
    }
    
    // Create the top or bottom cap of the cylinder
    buildCap(buffers, radius, z, length, width, isTopCap = false) {
        const flatSegments = 4;
        const angleStep = (2 * Math.PI) / (buffers.segments - flatSegments);
        const slicesPerCorner = (buffers.segments - flatSegments) / 4;
        
        let positions = buffers.positions;
        let indices = buffers.indices;
        let normals = buffers.normals;
        let uvs = buffers.uvs;
        
        const centerIndex = 0;
        positions.push(0, z, 0);
        normals.push(0, 1, 0);
        uvs.push(1, 1);
        
        let lenOffset = length/2;
        let widOffset = width/2;
        let indexCorrection = 0;
        let cornerSlicesCount = 0;
        
        // Create the vertices of the cap
        for (let i = 0; i <= buffers.segments + 2; i++) {
            // The angle of the vertex
            if (cornerSlicesCount == slicesPerCorner + 1)
            {
                if (i / (slicesPerCorner +1) == 1)
                {
                    lenOffset -= length;
                }
                
                if (i / (slicesPerCorner +1) == 2)
                {
                    widOffset -= width;
                }
                
                if (i / (slicesPerCorner +1) == 3)
                {
                    lenOffset += length;
                }
                
                if (i / (slicesPerCorner +1) == 4)
                {
                    widOffset += width;
                }
                
                indexCorrection++;
                cornerSlicesCount = 0;
            }
            
            
            const angle = (i - indexCorrection) * angleStep;
            //	The position of the vertex
            const x = radius * Math.cos(angle) + lenOffset;
            const y = radius * Math.sin(angle) + widOffset;
            
            // The position of the cap vertex
            positions.push(x, z, y);
            // The normal of the cap points in the direction of the z axis
            normals.push(x, 1, y);
            uvs.push(0, 0);
            
            if (i <= buffers.segments + 2) {
                const a = centerIndex;
                const b = centerIndex + i + 1 - indexCorrection;
                const c = centerIndex + i + 2 - indexCorrection;
                // The order of the vertices is reversed for the top cap
                indices.push(a, c, b);

            }
            
            cornerSlicesCount++;
            
        }
        
        const a = centerIndex;
        const b = centerIndex + buffers.segments;
        const c = 1;
        // The order of the vertices is reversed for the top cap
        if (!isTopCap) {
            // The indices of the triangle
            indices.push(a, c, b);
        } else {
            // The indices of the triangle
            indices.push(a, b, c);
        }
    }
    
    getCap(radius, length, width, segments)
    {
        let geometry = new THREE.BufferGeometry();
        
        const positions = [];
        const indices = [];
        const normals = [];
        const uvs = [];
        
        //	The top and bottom caps of the cylinder
        this.buildCap({ positions, indices, normals, uvs, segments }, radius, 0, length, width, false);
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        
        return geometry;
    }
    
}


export class FlyingChairs extends THREE.Object3D {

    constructor()
    {
        super();
        
        this.properties = 
        {
            segmentCount: 32,
            baseBigRadius: 0.5,
            baseMidRadius: 0.3,
            baseLowRadius: 0.2,
            baseLength: 0.5,
            
            topWidth: 1,
            topLength: 0.3,
            axisRadius: 0.2,
            axisLength: 1,
            
            chainRad: 0.008,
            chainLen: 0.9,
            
            chairLen: 0.12,
            chairWid: 0.25,
            
            baseColor: 0xFFFFFF,//0x36b2fa,
            axisColor: 0xFFFFFF,
            topColor: 0xf58b00,
            chainColor: 0x151515,
            
            stopTime:  7500, // ms
            runTime: 20000, // ms
            acceleration: 0.0001,
            maxspeed: 0.02
        }
        
        this.chairRotPosition = 0;
        
        this.base = this.createBase();
        this.axis = this.createAxis();
        this.top = this.createTop();
        
        this.chairs = [];
        
        // Estructura del juego
        this.add(this.base);
        this.add(this.axis);
        this.add(this.top);
        
        const chairCount = 10;
        
        // La base y el eje pueden recibir la sombra de las sillas
        // this.base.receiveShadow = true;
        // this.axis.receiveShadow = true;
        
        for (let i = 0; i < chairCount; i++)
        {
            let chair = this.createChainChair();
            this.chairs.push(chair);
            
            // Posicionamiento alrededor del techo
            chair.position.x = (this.properties.topWidth - 0.1) * Math.cos(2* Math.PI * (1 - i/chairCount));
            chair.position.z = -(this.properties.topWidth - 0.1) * Math.sin(2* Math.PI * (1 - i/chairCount));
            
            // Alineación (Solo la silla! la cadena queda como está)
            chair.getObjectByName(ChairName).rotation.y = Math.PI/2;
            
            chair.position.y += this.properties.chairLen;

            chair.rotation.y = 2 * Math.PI * (1-i/chairCount);
            
            this.top.add(chair);
        }
        
        this.inStoppageTime = true; // Flag para saber si está en modo reposo
        this.stoppageTime = 0; // tiempo que estuvo en modo reposo
        this.lastUpdateTime = 0; // Tiempo desde la última actividad de animate
        this.currentAcceleration = -this.properties.acceleration;
        this.currentSpeed = 0;
        this.runningTime = 0;
        
        this.traverse((obj) => {obj.castShadow = true;});
        
    }
    
    createBase()
    {
        let properties = this.properties;
        let shape = function(u, v, target, properties)
        {
            const bigToMid = properties.baseBigRadius - properties.baseMidRadius;
            // El 70% de la estructura es la base con mayor radio
            if (v <= 0.6)
            {
                target.x = properties.baseBigRadius * Math.cos(2*Math.PI * (1-u));
                target.z = properties.baseBigRadius * Math.sin(2*Math.PI * (1-u));
            } else if (v <= 0.8)
            {
                target.x = (properties.baseBigRadius - (bigToMid) * ((v - 0.6)/0.2)) * Math.cos(2*Math.PI * (1-u));
                target.z = (properties.baseBigRadius - (bigToMid) * ((v - 0.6)/0.2)) * Math.sin(2*Math.PI * (1-u));
            }
            else if (v <= 0.95)
            {
                target.x = properties.baseMidRadius * Math.cos(2*Math.PI * (1-u));
                target.z = properties.baseMidRadius * Math.sin(2*Math.PI * (1-u));
            } else
            {
                target.x = properties.baseLowRadius * Math.cos(2*Math.PI * (1-u)) * (0.1/(v - 0.9));
                target.z = properties.baseLowRadius * Math.sin(2*Math.PI * (1-u)) * (0.1/(v - 0.9));
            }
            
            target.y = properties.baseLength * v;
        };
        
        const geometry = new ParametricGeometry( (u,v,target) => {shape(u, v, target, properties);}, this.properties.segmentCount, 20 );
        geometry.computeVertexNormals();
        const material = new THREE.MeshPhongMaterial( { color: this.properties.baseColor } );
        const base = new THREE.Mesh( geometry, material );

        return base;
    }
    
    // Eje central de las sillas voladoras
    createAxis()
    {
        const geometry = new THREE.CylinderGeometry( this.properties.axisRadius, this.properties.axisRadius, this.properties.axisLength, this.properties.segmentCount, 3, true); 
        const material = new THREE.MeshPhongMaterial( {color: this.properties.axisColor} ); 
        const cylinder = new THREE.Mesh( geometry, material );
        
        cylinder.position.y = this.properties.baseLength * 2;
        
        return cylinder;
    }
    
    // Techo de la estructura de las silla voladoras
    createTop()
    {
        let shape = function(u, v, target, properties)
        {
            const baseToTop = properties.topWidth - properties.baseLowRadius;
            if (v == 0)
            {
                target.x = properties.baseLowRadius * Math.cos(2*Math.PI * (1-u));
                target.z = properties.baseLowRadius * Math.sin(2*Math.PI * (1-u));
                target.y = 0;
            } else if (v <= 0.8)
            {
                target.x = (properties.baseLowRadius + (baseToTop) * (v/0.8)) * Math.cos(2*Math.PI * (1-u));
                target.z = (properties.baseLowRadius + (baseToTop) * (v/0.8)) * Math.sin(2*Math.PI * (1-u));
                
                target.y = properties.topLength * (0.1 + v/4);
            } else if (v <= 0.99)
            {
                target.x = properties.topWidth * Math.cos(2*Math.PI * (1-u));
                target.z = properties.topWidth * Math.sin(2*Math.PI * (1-u));
                target.y = properties.topLength * (0.1 + (v-0.8) * 4);
            } else
            {
                target.x = 0;
                target.z = 0;
                target.y = properties.topLength * 1.5;
            }
        }
        
        const geometry = new ParametricGeometry( (u,v,target) => {shape(u, v, target, this.properties);}, this.properties.segmentCount, 20 );
        geometry.computeVertexNormals();
        const material = new THREE.MeshPhongMaterial( { color: this.properties.topColor, wireframe: false} );
        const top = new THREE.Mesh( geometry, material );
        
        top.position.y = this.properties.axisLength + this.properties.baseLength;
        
        return top;
    }
    
    createChainChair()
    {
        const chainGeometry = new THREE.CylinderGeometry( this.properties.chainRad, this.properties.chainRad, this.properties.chainLen, 32 );
        chainGeometry.translate(0,-this.properties.chainLen/2, -0.02);  // La corrección en Z es para corregir la alineación con la silla
        const chainMaterial = new THREE.MeshPhongMaterial( {color: this.properties.chainColor} ); 
        const chain = new THREE.Mesh( chainGeometry, chainMaterial );;
        
        let chair = new Chair(this.properties.chairLen, this.properties.chairWid , new THREE.Vector3(this.properties.chainRad, - (this.properties.chainLen + this.properties.chairLen), - this.properties.chairWid/2));
        chair.name = ChairName;
        
        chain.add(chair);
        
        return chain;
    }
    
    
    // Función para calcular el ángulo theta dada la velocidad angular
    calcularTheta(velangi, tolerancia = 1e-6, maxIter = 1000) {
        // Inicializamos theta (ángulo en radianes, cerca de vertical para comenzar)
        let theta = 0.1; // Valor inicial en radianes (pequeño ángulo)
        let iter = 0;    // Contador de iteraciones
        
        const g = 9.8;
        const R = this.properties.topWidth - 0.1;
        const L = this.properties.chainLen;
        
        const velang = velangi * 80; // Adecuo la velocidad angular para hacer mas visible el angulo
        
        while (iter < maxIter) {
            // Calculamos f(theta) = tan(theta) - (velang^2 * (R + L * sin(theta)) / g)
            let f = Math.tan(theta) - (velang ** 2 * (R + L * Math.sin(theta)) / g);
            
            // Calculamos la derivada f'(theta) = sec^2(theta) - (velang^2 * L * cos(theta) / g)
            let df = (1 / Math.cos(theta)) ** 2 - (velang ** 2 * L * Math.cos(theta) / g);
            
            // Actualizamos theta usando el método de Newton-Raphson
            let thetaNueva = theta - f / df;
            
            // Verificamos la convergencia
            if (Math.abs(thetaNueva - theta) < tolerancia) {
                return thetaNueva; // Retornamos el ángulo en radianes
            }
            
            theta = thetaNueva; // Actualizamos theta
            iter++;
        }
        
        // Si no converge, lanzamos un error
        throw new Error("No convergió después de " + maxIter + " iteraciones.");
    }
    
    animate()
    {
        const accelerationCheck = 20; // ms de espera para aplicar las modificaciones de velocidad
        
        if (this.lastUpdateTime == 0)
            this.lastUpdateTime = Date.now();

        // TimeElapse since last animate call
        const delta = Date.now() - this.lastUpdateTime;
        
        if (delta > accelerationCheck)
        {
            if (this.inStoppageTime)
            {
                this.stoppageTime += delta;
                
                if (this.stoppageTime >= this.properties.stopTime)
                {
                    this.stoppageTime = 0;
                    this.inStoppageTime = false;
                    this.currentAcceleration = this.properties.acceleration;
                }
                
                this.currentSpeed += this.currentAcceleration;
                
                if (this.currentSpeed < 0)
                {
                    this.currentSpeed = 0;
                }
                
            } else
            {
                this.runningTime += delta;
                if (this.runningTime >= this.properties.runTime)
                {
                    this.inStoppageTime = true;
                    this.currentAcceleration = -this.properties.acceleration;
                    this.runningTime = 0;
                }
                
                this.currentSpeed += this.currentAcceleration;
                
                if (this.currentSpeed > this.properties.maxspeed)
                {
                    this.currentSpeed = this.properties.maxspeed;
                }
            }
            
            this.lastUpdateTime = Date.now();
        }
        

        this.chairRotPosition += this.currentSpeed;
        
        this.top.rotation.y = this.chairRotPosition;
        let angle = this.calcularTheta(this.currentSpeed);
        
        this.chairs.map(function(chair) {chair.rotation.z = angle;});
        
    }
    
}

