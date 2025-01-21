import * as THREE from 'three';
import { CamerasId } from  './constants.js';
import { Montaniarusa } from './montaniaRusa.js';
import { FlyingChairs, Train } from './flyingChairs.js';
import { LightManager} from './lightManager.js';
import { Lampara, Pileta } from './lamparaPileta.js';

import { vertexShader, fragmentShaderVars, fragmentShader } from '@shaders/shadersGround.js';

const textures = {
	tierra: { url: 'tierra.jpg', object: null },
	roca: { url: 'piedras.jpg', object: null },
	pasto: { url: 'pasto.jpg', object: null },
	camino: { url: 'camino.jpg', object: null },
	rust: { url: 'baseOxido.jpg', object: null },
	rust_norm: { url: 'oxidoNomal.jpg', object: null },
	rust_metal: { url: 'oxidoMetal.jpg', object: null },
	rust_ao: { url: 'columna.jpg', object: null },
	twist_tunnel: { url: 'tunel1.png', object: null },
	twist_tunnel_alpha: { url: 'tunel1alpha.png', object: null },
	twist_tunnel_norm: { url: 'tunel1normales.png', object: null },
	riel:  { url: 'baseriel.jpg', object: null },
	riel_ao:  { url: 'riel.jpg', object: null },
	riel_norm:  { url: 'rielnormal.jpg', object: null },
	techo: { url: 'techo.png', object: null },
	chcol: { url: 'columnapayaso.png', object: null },
	chbase: { url: 'basesilla.jpg', object: null },
	chbase_norm: { url: 'sillanormal.jpg', object: null },
	scaled_tunnel: { url: 'tunel2.jpg', object: null },
	scaled_tunnel_alpha: { url: 'tunel2alpha.jpg', object: null },
	water_norm: { url: 'aguanormal.jpg', object: null},
	conc_norm: { url: 'sementonormal.jpg', object: null},
	conc_base: { url: 'semento.jpg', object: null},
	piletafloor_norm: { url: 'ceramicanormal.jpg', object: null},
	piletafloor_base: { url: 'ceramica.jpg', object: null}
};

export class SceneManager {
	
	constructor(scene) {
		
		this.scene = scene;
		this.sceneLights = new LightManager(scene);
		
		// Helpers
		this.grid = new THREE.GridHelper(10, 10);
		this.axes = new THREE.AxesHelper(3);
		
		// Scene Elements
		this.MontaniaRusa = new Montaniarusa();
		scene.add(this.MontaniaRusa);
		
		this.train = new Train();
		
		this.pileta = new Pileta(2, 3);

		this.pileta.position.set(3, 0, -1);
		
		this.scene.add(this.pileta);
		
		this.MontaniaRusa.addTrain(this.train);
		
		this.flyingChairs = new FlyingChairs();
		this.flyingChairs.position.set( 4, 0, 9);
		scene.add(this.flyingChairs);
		
		this.addLampara();
		
		const groundGeometry = new THREE.PlaneGeometry( 1500, 1000 );
		const groundMaterial = new THREE.MeshPhongMaterial( {color: 0x00ff00} );
		this.ground = new THREE.Mesh( groundGeometry, groundMaterial );
		
		this.ground.rotation.x = -Math.PI/2;
		this.ground.receiveShadow = true;
		
		scene.add(this.ground);
		
		this.properties =
		{
			showGrid: false,
			showAxes: false,
			showRLNormals: false,
			showRLTangents: false,
			showRLBinormals: false,
			showRLWireframe: false,
			showRLFlatShading: false,
			
			cameras: "t1"
		}
		
		this.rLHelpersUpdate();
		this.worldHelpersUpdate();
		
		let uniforms = {
			
			tierraSampler: { type: 't', value: textures.tierra.object },
			rocaSampler: { type: 't', value: textures.roca.object },
			pastoSampler: { type: 't', value: textures.pasto.object },
			trailSampler: { type: 't', value: textures.camino.object },
			scale1: { type: 'f', value: 10 },
			
			mask1low: { type: 'f', value: -0.1 },
			mask1high: { type: 'f', value: 0.1 },
			
			mask2low: { type: 'f', value: -0.3 },
			mask2high: { type: 'f', value: 0.2 },
		};
		
		
		this.loadTextures(() => {
			this.ground.material = new THREE.MeshPhongMaterial( {color: 0x00ff00} );
			this.ground.material.onBeforeCompile = function ( shader )
			{
				shader.uniforms.tierraSampler =  { type: 't', value: textures.tierra.object };
				shader.uniforms.rocaSampler = { type: 't', value: textures.roca.object };
				shader.uniforms.pastoSampler = { type: 't', value: textures.pasto.object };
				shader.uniforms.caminoSampler = { type: 't', value: textures.camino.object };
				shader.uniforms.scale1 = { type: 'f', value: 1000.0 };
				shader.uniforms.tailMaskScale = { type: 'f', value: 930.0 };
				shader.uniforms.tailPosX = { type: 'f', value: 449.5 };
				shader.uniforms.tailPosY = { type: 'f', value: 451.0 };
				
				shader.fragmentShader = fragmentShaderVars  + shader.fragmentShader;
				shader.fragmentShader = shader.fragmentShader.replace(
					'#include <map_fragment>',
					[fragmentShader].join( '\n' )
				);
				
				shader.vertexShader = shader.vertexShader.replace( '#define PHONG', `#define PHONG\n// Varying \n
				varying vec2 vUv;	// Coordenadas de textura que se pasan al fragment shader\n`);
				shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>\n// Se pasan las coordenadas de textura al fragment \n
				vUv = uv;`);
			};
			
			let reflection = this.remGenerator.fromScene( this.sceneLights.sky ).texture;
		
			this.ground.receiveShadow = true;
			this.ground.needsUpdate = true;
			
			textures.rust.object.repeat = textures.rust_norm.object.repeat = textures.rust_ao.object.repeat = new THREE.Vector2(2,4);
			
			let columns = this.MontaniaRusa.getAllColumns();
			columns.map((column)=>{
				column.material = new THREE.MeshPhongMaterial( {color: 0xffffff, specular: 0x990000, shininess: 30} ); //  Si no redefino el material, algunas columnas no cargan su textura
				column.material.map = textures.rust.object;
				column.material.normalMap = textures.rust_norm.object;
				column.material.needsUpdate = true;
				
			});
			
			textures.twist_tunnel_alpha.object.repeat = textures.twist_tunnel.object.repeat = textures.twist_tunnel_norm.object.repeat = new THREE.Vector2(4,4);
			
			this.MontaniaRusa.twistedTunnel.material.color = 0x000000;
			this.MontaniaRusa.twistedTunnel.material.alphaTest = 0.3;
			this.MontaniaRusa.twistedTunnel.material.transparent = false;
			this.MontaniaRusa.twistedTunnel.material.alphaMap = textures.twist_tunnel_alpha.object;
			this.MontaniaRusa.twistedTunnel.material.map = textures.twist_tunnel.object;
			this.MontaniaRusa.twistedTunnel.material.normalMap = textures.twist_tunnel_norm.object;
			
			
			// Rotamos la textura para que se alinee al con los u,v
			textures.scaled_tunnel.object.rotation = Math.PI/2;
			textures.scaled_tunnel.object.repeat = new THREE.Vector2(2.5,1);
			textures.scaled_tunnel.object.offset.x = 0.25;
			this.MontaniaRusa.scaledTunnel.material.map = textures.scaled_tunnel.object;
			this.MontaniaRusa.scaledTunnel.material.needsUpdate = true;
			
			textures.scaled_tunnel_alpha.object.rotation = Math.PI/2;
			textures.scaled_tunnel_alpha.object.flipY = false;
			textures.scaled_tunnel_alpha.object.offset.y = 0.3;
			this.MontaniaRusa.scaledTunnel.material.alphaMap = textures.scaled_tunnel_alpha.object;
			this.MontaniaRusa.scaledTunnel.material.alphaTest = 0.3;
			
			textures.riel.object.repeat = textures.riel_ao.object.repeat = textures.riel_norm.object.repeat = new THREE.Vector2(8,128);
			
			this.MontaniaRusa.rcMesh.material = new THREE.MeshStandardMaterial( {color: 0xffffff} );
			this.MontaniaRusa.rcMesh.material.roughness = 0.1;
			this.MontaniaRusa.rcMesh.material.metalness = 1.0;
			
			this.MontaniaRusa.rcMesh.material.envMap = reflection;
			this.MontaniaRusa.rcMesh.material.envMapIntensity = 0.1;
			this.MontaniaRusa.rcMesh.material.map = textures.riel.object;
			this.MontaniaRusa.rcMesh.material.aoMap = textures.riel_ao.object;
			this.MontaniaRusa.rcMesh.material.normalMap = textures.riel_norm.object;
			
			// Rotamos la textura para que se alinee al con los u,v
			textures.techo.object.center = new THREE.Vector2(0.5,0.5);
			textures.techo.object.rotation = Math.PI/2;
			
			textures.chcol.object.repeat = new THREE.Vector2(3, 1);
			this.flyingChairs.top.material = new THREE.MeshPhongMaterial( {color: 0xffffff, wireframe: false} );
			this.flyingChairs.top.material.map = textures.techo.object;
			
			this.flyingChairs.axis.material.map = textures.chcol.object;
			this.flyingChairs.axis.material.needsUpdate = true;
			
			this.flyingChairs.base.material.map = textures.chbase.object;
			this.flyingChairs.base.material.normalMap = textures.chbase_norm.object;
			this.flyingChairs.base.material.needsUpdate = true;
			
			let cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 256 );
			cubeRenderTarget.texture.type = THREE.HalfFloatType;

			let cubeCamera = new THREE.CubeCamera( 1, 1000, cubeRenderTarget );
			cubeCamera.position.set(-1, 0.5, 3);
			textures.conc_base.object.repeat = textures.conc_norm.object.repeat = new THREE.Vector2(1,1);
			 
			
			this.pileta.water.material = new THREE.MeshStandardMaterial( {
				color: 0x000088, 
				normalMap: textures.water_norm.object, 
				envMap: reflection, 
				roughness: 0.35, metalness: 0.0, transparent: true, opacity: 0.4});
			
			textures.conc_base.object.repeat = new THREE.Vector2(8,1);
			textures.conc_norm.object.repeat = new THREE.Vector2(8,1);
			
			textures.piletafloor_base.object.repeat = new THREE.Vector2(4,6);
			textures.piletafloor_norm.object.repeat = new THREE.Vector2(4,6);
			this.pileta.base.material = new THREE.MeshPhongMaterial( {
				color: 0xffffff,
				map: textures.piletafloor_base.object,
				normalMap: textures.piletafloor_norm.object, 
				roughness: 0.8, metalness: 0.0});
			
		});
	}
	
	loadTextures(callback) {
		
		const loadingManager = new THREE.LoadingManager();
		
		loadingManager.onLoad = () => {
			console.log('All textures loaded');
			callback();
		};
		
		for (const key in textures) {
			const loader = new THREE.TextureLoader(loadingManager);
			const texture = textures[key];
			texture.object = loader.load(import.meta.env.VITE_TEXTURE_PATH + '/' + texture.url, 
										 this.onTextureLoaded.bind(this, key),
										 null, (error) => {
				console.error(error);
			});
		}
	}
	
	onTextureLoaded(key, texture) {
		if (key != "camino" && key != "techo") // Para el sendero dejamos se repita el ultimo pixel
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		textures[key].object = texture;
		console.log(`Texture ${key} loaded`);
	}
	
	rLHelpersUpdate()
	{
		if (this.properties.showRLNormals)
		{
			this.MontaniaRusa.drawNormals(this.scene);
		} else
		{
			this.MontaniaRusa.hideNormals(this.scene);
		}
		
		if (this.properties.showRLTangents)
		{
			this.MontaniaRusa.drawTangents(this.scene);
		} else
		{
			this.MontaniaRusa.hideTangents(this.scene);
		}
		
		if (this.properties.showRLBinormals)
		{
			this.MontaniaRusa.drawBinormals(this.scene);
		} else
		{
			this.MontaniaRusa.hideBinormals(this.scene);
		}
		
	}
	
	worldHelpersUpdate()
	{
		this.properties.showGrid ? this.scene.add(this.grid):this.scene.remove(this.grid);
		
		this.properties.showAxes ? this.scene.add(this.axes):this.scene.remove(this.axes);
	}
	
	setupUI(gui)
	{
		let f1 = gui.addFolder('Helpers');
		
		this.setupWorldHelpers(f1);
		this.setupRLHelpers(f1);
		
		let f2 = gui.addFolder('Sun');
		f2.add(this.sceneLights.effectController, 'elevation', -180, 180, 0.1).name('Dia / Noche').onChange((value) => {this.sceneLights.skyChanged();});
		
	}
	
	setupWorldHelpers(f1)
	{
		let f2 = f1.addFolder('General');
		
		//f2.add(this.properties, 'showGrid')
		//	.name('Grid')
		//	.onChange((value) => {this.properties.showGrid = value; this.worldHelpersUpdate();});
		
		f2.add(this.properties, 'showAxes')
			.name('Ejes')
			.onChange((value) => {this.properties.showAxes = value; this.worldHelpersUpdate();});
			
		//f2.add(this.sceneLights.properties, 'sunLightHelper')
		//	.name('Sol')
		//	.onChange((value) => {this.sceneLights.showSunHelper(value);});
			
		f2.add(this.sceneLights.properties, 'shadowCamHelper')
			.name('Shadows')
			.onChange((value) => {this.sceneLights.showShadowHelper(value);});

	}
	
	setupRLHelpers(f1)
	{
		let f2 = f1.addFolder('Vectores');
	
		f2.add(this.properties, 'showRLNormals')
			.name('Normales')
			.onChange((value) => {this.rLHelpersUpdate()});
		f2.add(this.properties, 'showRLTangents')
			.name('Tangentes')
			.onChange((value) => {this.rLHelpersUpdate()});
		f2.add(this.properties, 'showRLBinormals')
			.name('Binormales')
			.onChange((value) => {this.rLHelpersUpdate()});
			
		//f2.add(this.properties, 'showRLWireframe')
		//	.name('Wireframe')
		//	.onChange((value) => {this.MontaniaRusa.wireframe(value)});
		
		//f2.add(this.properties, 'showRLFlatShading')
		//	.name('FlatShading')
		//	.onChange((value) => {this.MontaniaRusa.flatShading(value)});
	}
	
	addTrainCameras(front, back, side)
	{
		front.name = CamerasId.TrainFront;
		back.name = CamerasId.TrainBack;
		side.name = CamerasId.TrainSide;
		
		this.MontaniaRusa.add(front);
		this.MontaniaRusa.add(back);
		this.MontaniaRusa.add(side);
	}
	
	addFlyingChairCamera(Camera)
	{
		this.flyingChairs.chairs[0].add(Camera);
	}
	
	addLampara()
	{
		const lampsPositions = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( -6, 0, 0),//esquina de la pileta
			new THREE.Vector3( -6, 0, 6 ),//segunda esquina de la pileta
			new THREE.Vector3( -6, 0, 12 ),//tercera esquina de la pileta
			new THREE.Vector3( 6, 0, 0),//esquina de la pileta
			new THREE.Vector3( 6, 0, 0.5),//esquina de la pileta
			new THREE.Vector3( 6, 0, 1 ),//segunda esquina de la pileta
			new THREE.Vector3( 3, 0, 9 ),//tercera esquina de la pileta
			new THREE.Vector3( 3, 0, -10 ),//tercera esquina de la pileta
			
		] );

		
		const lampCount = 8;
		const lampHeight = 0.5;
		for (let i=0; i < lampCount; i++)
		{
			let position = lampsPositions.getPointAt(i/lampCount);
			let lamp = new Lampara(lampHeight);
			
			lamp.position.copy(position);
			
			this.scene.add(lamp);
			this.sceneLights.addLamp(lamp);
		}
	}

	animate() {
		this.MontaniaRusa.animate();
		this.flyingChairs.animate();
		this.pileta.animate();
	}
}
