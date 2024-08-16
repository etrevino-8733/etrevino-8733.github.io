import * as THREE from 'three';
import { OrbitControls } from '../libraries/Three/OrbitControls.js';

import { FontLoader } from '../libraries/Three/FontLoader.js';
import { TextGeometry } from '../libraries/Three/TextGeometry.js';
import gsap from "../libraries/Three/gsap-core.js";

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';

import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import {BasicCharacterController} from '../scripts/characters.js';


let IsAboutMePage = false;

let APP_ = null;
let SCENECONTROLS_ = null;
let previousRAF_ = null;

const DEFAULT_MASS = 10;
const DEFALUT_CAM_POS = new THREE.Vector3(0, 2, 0);
let CAM_START_POS = new THREE.Vector3(60, 2, -20);
let TARGET_START_POS = new THREE.Vector3(60, 35, -22);

const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({ color:  0x000000 });
const materials = {};

function nonBloomed(obj){
    if((obj.isMesh || obj.isPoints) && bloomLayer.test(obj.layers) === false){
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
    }
}

function restoreMaterial(obj){
    if(materials[obj.uuid]){
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
    }
}


let topText = null;
let textBottom = null;  

const primaryColor = '#B6DBF2';
const primaryColorDark = '#10403B';
const secondaryColor = '#8AA6A3';
const tertiaryColor = '#10403B';


const scene = new THREE.Scene();
const canvas = document.querySelector('#tech-stack');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth , window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.CineionToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.outputEncoding = THREE.sRGBEncoding;


const loadingManager = new THREE.LoadingManager();
const hiResLoader = new THREE.LoadingManager();

const progressBar = document.getElementById('progress-bar');
if(progressBar !== null){
    loadingManager.onProgress = function(url, loaded, total){
        progressBar.value = (loaded / total) * 100;
      }
}


const progressBarContainer = document.querySelector('.progress-bar-container');
loadingManager.onLoad = function(){

    if(progressBarContainer !== null){
        setTimeout(() => {
            progressBarContainer.style.opacity = 0;
        }, 1000);
        setTimeout(() => {
            if(!IsAboutMePage) SCENECONTROLS_.centerCamera(10); else flickerStack();
            progressBarContainer.style.display = 'none';
        }, 2000);
    } else{
        flickerStack();
    }


   const storeHiRes = new GLTFLoader(hiResLoader); 
   storeHiRes.load('../assets/scenes/247_cyberpunk_store.glb', function( gltf ) {
    gltf.scene.position.x = 0;
    gltf.scene.position.y = 2;
    gltf.scene.position.z = -20;
    gltf.scene.rotation.y = -1.87;
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.name = "coffeeShop";
    gltf.scene.traverse( function( node ) {
  
       node.castShadow = true; 
       node.receiveShadow = true;
  
  } );
  scene.add( gltf.scene);
  }, undefined, function ( error ) { console.error(error); });

  hiResLoader.onLoad = function(){
    scene.remove(scene.children.find((child) => child.name === 'coffeeShop_lores'));
  }
 }

function animate(){
    requestAnimationFrame((t) => {
        if (previousRAF_ === null) {
          previousRAF_ = t;
        }

        scene.traverse(nonBloomed);

        if(!IsAboutMePage){
            scene.traverse((object) => {
                if (object.isPoints && object.name === 'rain') {
                    object.velocity -= 0.1 * Math.random() * 1;
                    object.position.y += object.velocity;
                    if (object.position.y < 1) {
                        object.position.y = 100;
                        object.velocity = 0;
                        object.position.x = Math.random() * 200 - 100;
                    }
                }
            });
        }


        APP_.step_(t - previousRAF_);
        SCENECONTROLS_.composer.render();
        scene.traverse(restoreMaterial);
        SCENECONTROLS_.finalComposer.render();
        SCENECONTROLS_.handHeldCameraEffect();
        animate();
        previousRAF_ = t;
      });
}

function onWindowResize(){
    SCENECONTROLS_.camera.aspect = window.innerWidth / window.innerHeight;
    SCENECONTROLS_.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth , window.innerHeight);
    SCENECONTROLS_.composer.setSize(window.innerWidth , window.innerHeight);
    SCENECONTROLS_.finalComposer.setSize(window.innerWidth , window.innerHeight);

  }


window.addEventListener('resize', onWindowResize, false);
window.addEventListener('DOMContentLoaded', async() => {
    //const aboutMePage = document.querySelector('.home-bg');
    IsAboutMePage = document.querySelector('.home-bg') !== null;
    Ammo().then((lib) => {
        Ammo = lib;
        APP_ = new MyWorld();
        SCENECONTROLS_ = new SceneControls();
        //APP_.initialize();
        animate();
    });
    if(IsAboutMePage){
        CAM_START_POS = new THREE.Vector3(0, 0, 80);
        TARGET_START_POS = new THREE.Vector3(0, 20, 0);  

        const offset = new THREE.Vector3();
        const distance = 20;

        document.addEventListener('scroll', function(){
            // SCENECONTROLS_.camera.position.x++;
            // //SCENECONTROLS_.camera.position.y = window.scrollY * 0.1;
            // SCENECONTROLS_.camera.position.z++;

            offset.x = distance * Math.sin( window.scrollY * 0.001 );
            offset.z = distance * Math.cos( window.scrollY * 0.001 );
            offset.y = 20;
          
            SCENECONTROLS_.camera.position.copy( CAM_START_POS).add( offset );
            SCENECONTROLS_.camera.lookAt( TARGET_START_POS );
    });
    }

    let updateAssetBtn = document.querySelector('.release-the-moster');
    if(updateAssetBtn !== null){
        console.log(updateAssetBtn);
        updateAssetBtn.addEventListener('click', function(){
            APP_._LoadAnimatedModel();
            updateAssetBtn.style.display = 'none';
            // APP_._LoadAnimatedModelAndPlay('./assets/zombie/', 'character.fbx', 'idle.fbx', new THREE.Vector3(-12, 0, 10));
        });
    }
});
// canvas.addEventListener('click', async function(e){
//     if (document.pointerLockElement === canvas) {
//         SCENECONTROLS_.fpsCamera_.input_.controlsLock = false;
//         await document.exitPointerLock();
//     } else {
//         //canvas.setPointerCapture(e.pointerId)
//         await canvas.requestPointerLock({
//             unadjustedMovment: true,
//         });
//         if(SCENECONTROLS_.fpsCamera_ === undefined){    
//             await SCENECONTROLS_.setFpsCamera();
//         }
//         SCENECONTROLS_.fpsCamera_.input_.controlsLock = true;

//     }
// });

class RigidBody{
    constructor(){

    }

    setRestitution(val) {
        this.body_.setRestitution(val);
      }
    
      setFriction(val) {
        this.body_.setFriction(val);
      }
    
      setRollingFriction(val) {
        this.body_.setRollingFriction(val);
      }

    createBox(mass, pos, quat, size){
        this.transform_ = new Ammo.btTransform();
        this.transform_.setIdentity();
        this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);


        const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
        this.shape_ = new Ammo.btBoxShape(btSize);
        this.shape_.setMargin(2, 0.05, 0.05);

        this.inertia_ = new Ammo.btVector3(0, 0, 0);
        if(mass > 0){
            this.shape_.calculateLocalInertia(mass, this.inertia_);
        }

        this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this
            .shape_, this.inertia_);
        this.body_ = new Ammo.btRigidBody(this.info_);
        this.body_.setWorldTransform(this.transform_);

        Ammo.destroy(btSize);
            
    }

    createText(mass, pos, quat, size){
        this.transform_ = new Ammo.btTransform();
        this.transform_.setIdentity();
        this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);


        const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
        this.shape_ = new Ammo.btBoxShape(btSize);
        this.shape_.setMargin(2, 0.05, 0.05);
        this.inertia_ = new Ammo.btVector3(0, 0, 0);
        if(mass > 0){
            this.shape_.calculateLocalInertia(mass, this.inertia_);
        }

        this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this
            .shape_, this.inertia_);
        this.body_ = new Ammo.btRigidBody(this.info_);
        this.body_.setWorldTransform(this.transform_);

        Ammo.destroy(btSize);
            
    }

    createSphere(mass, pos, size) {
        this.transform_ = new Ammo.btTransform();
        this.transform_.setIdentity();
        this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform_.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
        this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);
    
        this.shape_ = new Ammo.btSphereShape(size);
        this.shape_.setMargin(2, 0.05, 0.05);
    
        this.inertia_ = new Ammo.btVector3(0, 0, 0);
        if(mass > 0) {
          this.shape_.calculateLocalInertia(mass, this.inertia_);
        }
    
        this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
        this.body_ = new Ammo.btRigidBody(this.info_);
        this.body_.setWorldTransform(this.transform_);

      }
}

class MyWorld{
    constructor(){
        this.initialize_();
    }
    initialize_(){
        this._mixers = [];

        this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
        this.broadphase_ = new Ammo.btDbvtBroadphase();
        this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
        // this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(
        //     this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
        // this.physicsWorld_.setGravity(new Ammo.btVector3(0, -50, 0));

        // SET ENVIRONMENT
        const store = new GLTFLoader(loadingManager); store.load('../assets/scenes/247_cyberpunk_store_lowres.glb', function( gltf ) {
            gltf.scene.position.x = 0;
            gltf.scene.position.y = 2;
            gltf.scene.position.z = -20;
            gltf.scene.rotation.y = -1.87;
            gltf.scene.scale.set(10, 10, 10);
            gltf.scene.name = "coffeeShop_lores";
            gltf.scene.traverse( function( node ) {
          
               node.castShadow = true; 
               node.receiveShadow = true;
          
          } );
          scene.add( gltf.scene);
          }, undefined, function ( error ) { console.error(error); });
        
        // const laptop = new GLTFLoader(loadingManager); laptop.load('../assets/scenes/laptop_desk.glb', function( gltf ) {
        //     gltf.scene.position.x = 0;
        //     gltf.scene.position.y = 14;
        //     gltf.scene.position.z = -18;
        //     gltf.scene.rotation.y = 1.5;
        //     gltf.scene.scale.set(20, 20, 20);
        //     gltf.scene.name = "laptop";
        //     gltf.scene.traverse( function( node ) {
        //         node.castShadow = true;
        //         node.receiveShadow = true;
        //     });
        //     scene.add( gltf.scene);
        //     }, undefined, function ( error ) { console.error(error); });

        /// SET GROUND
        const groundGeometry = new THREE.BoxGeometry(400, 1, 200);
        const groundMaterial = new THREE.MeshStandardMaterial( {color: 'black', roughness: 1, metalness: .2} );
        const plane = new THREE.Mesh( groundGeometry, groundMaterial );
        plane.receiveShadow = true;
        scene.add( plane );

        // const rbGround = new RigidBody();
        // rbGround.createBox(0, new THREE.Vector3(0, 0, 0), plane.quaternion, new THREE.Vector3(200, 1, 100));
        // rbGround.setRestitution(0.99);
        // this.physicsWorld_.addRigidBody(rbGround.body_);
        // this.rigidBodies_ = [];

        function addRain() {
            const geometry = new THREE.SphereGeometry(.05, 10, 10);
            const material = new THREE.PointsMaterial( { color: 0xaaaaaa, size: 0.1, transparent: true})
            const rainDrop = new THREE.Points( geometry, material );
          
            const [x, z] = Array(2).fill().map(() => THREE.MathUtils.randFloatSpread( 100 ) );
            const y = THREE.MathUtils.randFloat( 0, 200 ) ;
            rainDrop.position.set(
                Math.random() * 200 - 100,
                Math.random() * 400 - 200,
                Math.random() * 200 - 100
             );
             rainDrop.velocity = {};
             rainDrop.velocity = 0;
             rainDrop.name = 'rain';
            scene.add(rainDrop)
          
          }
        
        if(!IsAboutMePage){
            Array(500).fill().forEach(addRain);
        }
        const stack = [
            {"tech": ["SQL Server", "Mongo DB","Azure", "Docker"]},
            {"tech": [".Net Core", "asp.net", "Angular", "NX"]},            
            {"tech": ["TypeScript", "JavaScript", "HTML", "CSS", "SASS", "C#"]},
        ];
        let height = 1.5;
        let startXPos = -7;
        let longestTech = 0;
        for (let x = 0; x < stack.length; x++){
            startXPos = startXPos + (longestTech * height) - height;
            longestTech = 0;
            for (let i = 0; i < stack[x].tech.length; i++){
                const techYPos = i * height + 15;

                const tech = stack[x].tech[i];
                const techXPos = startXPos;

                if (tech.length > longestTech){
                    longestTech = tech.length;
                }
                const loader = new FontLoader(loadingManager);
                const font = loader.load('../assets/fonts/Tilt Neon_Regular.json');
                loader.load('../assets/fonts/Tilt Neon_Regular.json', function(font){
                    const textGeometry = new TextGeometry(tech, {
                        font: font,
                        size: height,
                        depth: .3,
                        curveSegments: .01,
                        bevelEnabled: true,
                        bevelThickness: .0022,
                        bevelSize: .001,
                        bevelOffset: 0,
                        bevelSegments: 1,
                        margin: 0.05
                    });
                    const textMaterial = new THREE.MeshStandardMaterial({color: secondaryColor, roughness: 1, metalness: 0.05});
                    const text = new THREE.Mesh(textGeometry, textMaterial);
                    text.castShadow = true;
                    text.receiveShadow = true;
                    text.position.set(techXPos, techYPos, -12);
                    text.quaternion.set(0, 0, 0, 1);
                    text.name = 'text';

                    scene.add(text);
                });
            }
        }
        const logoSize = 7;
        const logoPositionX = 50;
        const logoPositionZ = -10;
        const logoPositionY = 25;
        const loader = new FontLoader(loadingManager);
        loader.load('../assets/fonts/Michroma_Regular.json', function(font){
            const textGeometryTop = new TextGeometry('ET', {
                font: font,
                size: logoSize,
                depth: 1,
                curveSegments: .01,
                bevelEnabled: true,
                bevelThickness: .0022,
                bevelSize: .001,
                bevelOffset: 0,
                bevelSegments: 1,
                mirror: true,
            });
            const textGeometryBottom = new TextGeometry('DEV', {
                font: font,
                size: logoSize,
                depth: 1,
                curveSegments: .01,
                bevelEnabled: true,
                bevelThickness: .0022,
                bevelSize: .001,
                bevelOffset: 0,
                bevelSegments: 1,
            });
            const textMaterial = [
                new THREE.MeshPhongMaterial( { color: primaryColor, flatShading: false, specular: primaryColor, shininess: 100, emissive: '000000' } ), // front
                new THREE.MeshPhongMaterial( { color: primaryColorDark } ) // side
            ];
            topText = new THREE.Mesh(textGeometryTop, textMaterial);
            textBottom = new THREE.Mesh(textGeometryBottom, textMaterial);
            textBottom.castShadow = true;
            textBottom.position.y = logoPositionY;
            textBottom.position.x = logoPositionX;
            textBottom.position.z = logoPositionZ;
            textBottom.name = 'textBottom';
            scene.add(textBottom);
            topText.castShadow = true;
            topText.position.y = logoPositionY + logoSize;
            topText.position.x = logoPositionX;
            topText.position.z = logoPositionZ;
            topText.name = 'topText';
            scene.add(topText);

            // const rbTopText = new RigidBody();
            // rbTopText.createText(0, topText.position, topText.quaternion, new THREE.Vector3(logoSize * 2, logoSize, 1));
            // rbTopText.setRestitution(0.125);
            // rbTopText.setFriction(10);
            // rbTopText.setRollingFriction(10);

            // const rbTextBottom = new RigidBody();
            // rbTextBottom.createText(0, textBottom.position, textBottom.quaternion, new THREE.Vector3(logoSize * 4, logoSize, 1));
            // rbTextBottom.setRestitution(0.125);
            // rbTextBottom.setFriction(10);
            // rbTextBottom.setRollingFriction(10);


            // textBottom.userData.physicsBody = rbTextBottom.body_ ;
            // topText.userData.physicsBody = rbTopText.body_;

            // APP_.physicsWorld_.addRigidBody(rbTopText.body_);
            // APP_.rigidBodies_.push({ id: "test", mesh: topText, rigidBody: rbTopText });
            // APP_.physicsWorld_.addRigidBody(rbTextBottom.body_);
            // APP_.rigidBodies_.push({ mesh: textBottom, rigidBody: rbTextBottom });
        });


        this.tmpTransform_ = new Ammo.btTransform();

        this.countdown_ = 1.0;
        this.count_ = 0;
        this.previousRAF_ = null;         
         

        //animate();
    }

    step_(timeElapsed){
        const timeElapsedS = timeElapsed * 0.001;

        this.countdown_ -= timeElapsedS;
        // this.physicsWorld_.stepSimulation(timeElapsedS, 10);


        // for (let i = 0; i < this.rigidBodies_.length; ++i) {
        //     if(this.rigidBodies_[i].mesh.position.y < -10){
        //         scene.remove(this.rigidBodies_[i].mesh);
        //         this.physicsWorld_.removeRigidBody(this.rigidBodies_[i].rigidBody.body_);
        //         this.rigidBodies_.splice(i, 1);
        //         i--;
        //     }
        //   this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
        //   const pos = this.tmpTransform_.getOrigin();
        //   const quat = this.tmpTransform_.getRotation();
        //   const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
        //   const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
    
        //   this.rigidBodies_[i].mesh.position.copy(pos3);
        //   this.rigidBodies_[i].mesh.quaternion.copy(quat3);
        // }

        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
          }
        if(APP_._myCharacter){
            APP_._myCharacter.Update(timeElapsedS);
        }

        if(SCENECONTROLS_.fpsCamera_ !== undefined){
            SCENECONTROLS_.fpsCamera_.update(timeElapsedS);
        }
    }
    spawn_() {
        const scale = Math.random() * .7 + .7;
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(scale, scale, scale),
          new THREE.MeshStandardMaterial({
              color: primaryColor,
              roughness: 0.5, 
              metalness: 0
          }));
        box.position.set(Math.random() * 10 - 5, 200.0, Math.random() * 2 - 1);
        box.quaternion.set(0, 0, 0, 1);
        box.castShadow = true;
        box.receiveShadow = true;
    
        const rb = new RigidBody();
        rb.createBox(DEFAULT_MASS, box.position, box.quaternion, new THREE.Vector3(scale, scale, scale), null);
        rb.setRestitution(0.15);
        rb.setFriction(2);
        rb.setRollingFriction(1);
    
        this.physicsWorld_.addRigidBody(rb.body_);
    
        this.rigidBodies_.push({mesh: box, rigidBody: rb});
    
        scene.add(box);
      }

      _LoadAnimatedModel() {
        const params = {
          camera: SCENECONTROLS_.camera,
          scene: scene
        }
        this._myCharacter = new BasicCharacterController(params);
      }

      _LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
        const loader = new FBXLoader();
        loader.setPath(path);
        loader.load(modelFile, (fbx) => {
          fbx.scale.setScalar(0.1);
          fbx.traverse(c => {
            c.castShadow = true;
          });
          fbx.position.copy(offset);
    
          const anim = new FBXLoader();
          anim.setPath(path);
          anim.load(animFile, (anim) => {
            const m = new THREE.AnimationMixer(fbx);
            this._mixers.push(m);
            const idle = m.clipAction(anim.animations[0]);
            idle.play();
          });
          scene.add(fbx);
        });
      }
    
}

class SceneControls{
    constructor(){
        this.initialize_();
    }

    initialize_(){
        this.handheldEffectActive = true;
        this.handheldEffectLoop = 0;
        this.handheldEffectIncreaseX = true;
        this.handheldEffectIncreaseY = true;
        this.handheldEffectXBoundary = 0.1;
        this.handheldEffectYBoundary = 0.5;

        this.camera = new THREE.PerspectiveCamera( 80, window.innerWidth  / window.innerHeight, 1, 1000 );
        this.camera.position.copy(CAM_START_POS);

        this.controls = new OrbitControls(this.camera, renderer.domElement);
        if(IsAboutMePage){
            this.controls.enabled = false;
            this.handheldEffectActive = false;
        }

        
        this.controls.minDistance = 1;
        this.controls.maxDistance = 1000;
        this.controls.minPolarAngle = 1;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target = TARGET_START_POS;
        this.controls.update();
        
        this.renderScene = new RenderPass(scene, this.camera);
        this.composer = new EffectComposer(renderer);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth , window.innerHeight), 
            1.5, 
            0.005, 
            0.05
        );
        this.mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.composer.renderTarget2.texture }
                },
                vertexShader: document.getElementById('vertexshader').textContent,
                fragmentShader: document.getElementById('fragmentshader').textContent,
            }), 'baseTexture'
        );
    
        this.finalComposer = new EffectComposer(renderer);
    
        this.outputPass = new OutputPass();
        


        
        this.composer.setSize(window.innerWidth , window.innerHeight);
        this.composer.addPass(this.renderScene);
        this.composer.addPass(this.bloomPass);
        this.composer.renderToScreen = false;

        //this.composer.addPass(this.outputPass);

        this.finalComposer.setSize(window.innerWidth , window.innerHeight);
        this.finalComposer.addPass(this.renderScene);
        this.finalComposer.addPass(this.mixPass);
        this.finalComposer.addPass(this.outputPass);


        //this.camera.position.copy(CAM_START_POS);
        
        const light = new THREE.DirectionalLight(0xffffff, 1, 100);
        light.position.set( -10, 200, 50 );
        light.castShadow = true;
        light.shadow.mapSize.width = 512; // default
        light.shadow.mapSize.height = 512; // default
        light.shadow.camera.near = .5; // default
        light.shadow.camera.far = 500; // default
        light.shadow.camera.left = -100;
        light.shadow.camera.right = 75;
        light.shadow.camera.top = 40;
        light.shadow.camera.bottom = -50;
        const ambientLight = new THREE.AmbientLight(0xffffff);
        
        scene.fog = new THREE.Fog( 0x000000, 25, 200 );

        scene.add(light, ambientLight);
    }

    async centerCamera(seconds){
        this.handheldEffectActive = false;
        const ms = seconds * 1000;
        setTimeout(() => {
            this.setScene(CAM_START_POS.x, CAM_START_POS.y, CAM_START_POS.z + 40, 25, TARGET_START_POS.y, TARGET_START_POS.z, seconds * 0.4); 
        }, 0);
        setTimeout(() => {
            this.setScene(-10, 20, 5, -5, 20, -2, seconds * 0.2);
        }, (ms * .4) - 500);
        setTimeout(() => {
            this.setScene(0, 18, window.innerWidth > 600 ? 30 : 75, 0, 18, 0, seconds * 0.4);
        }, (ms * .6) - 500);
        setTimeout(() => {
            flickerStack();
            this.handheldEffectActive = true;

            // NOT READY YET
            // this.controls.enabled = false;
            // canvas.addEventListener('click', async function(e){
            //     if (document.pointerLockElement === canvas) {
            //         SCENECONTROLS_.fpsCamera_.input_.controlsLock = false;
            //         SCENECONTROLS_.controls.enabled = true;
            //         await document.exitPointerLock();
            //     } else {
            //         await canvas.requestPointerLock({
            //             unadjustedMovment: true,
            //         });
            //         if(SCENECONTROLS_.fpsCamera_ === undefined){    
            //             await SCENECONTROLS_.setFpsCamera();
            //         }
            //         SCENECONTROLS_.controls.enabled = false;
            //         SCENECONTROLS_.fpsCamera_.input_.controlsLock = true;         
            //     }
            // });
        }, ms);
    }

    setScene(cx, cy, cz,tx ,ty ,tz, seconds, easeOption = "back.inOut(1)"){
        let controls = this.controls;
        gsap.to(this.controls.target, {
            x: tx,
            y: ty,
            z: tz,
            duration: seconds,
            onUpdate: function(){
                controls.update();
              }
        });
        gsap.to(this.camera.position, {
            x: cx,
            y: cy,
            z: cz,
            duration: seconds,
            ease: easeOption,
              onUpdate: function(){
                //controls.update();
              }
          });
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, seconds * 1000);
          });
    }

    handHeldCameraEffect(){
        if(this.handheldEffectActive === false) return;
        if(this.handheldEffectLoop > 1){
            this.handheldEffectIncrease = false;
        } else if(this.handheldEffectLoop < -1){
            this.handheldEffectIncrease = true;
        }

        if(this.handheldEffectIncrease){
            this.handheldEffectLoop += 0.01;
            this.handheldEffectIncrement = 0.000001;
        }else{
            this.handheldEffectLoop -= 0.01;
            this.handheldEffectIncrement = -0.000001;
        }
        
        // this.camera.position.x += Math.sin(this.handheldEffectIncrement * 10) * .5;
        // this.camera.position.y += (Math.random() * 10) * this.handheldEffectIncrement;
        // let x = Math.sin(this.handheldEffectLoop) * .01;
        // let y = Math.sin(this.handheldEffectLoop) * .01;
        // let z = Math.sin(this.handheldEffectLoop) * .01;

        let x = Math.sin(this.handheldEffectLoop) * .001;
        let y = Math.sin(this.handheldEffectLoop) * .001;
        let z = Math.sin(this.handheldEffectLoop) * .001;

        this.camera.position.x += ((Math.random(), 10) * x);
        this.camera.position.y += ((Math.random(), 10) * y);
        this.camera.position.z += ((Math.random(), 10) * z);

        // this.camera.position.x += this.handheldEffectIncrement * .5;
        // this.camera.position.y += this.handheldEffectIncrement * .5;
    }

    // async setScene2(cx, cy, cz,tx ,ty ,tz, duration){
    //     const steps = duration * 1000;
    //     let startCx = this.camera.position.x / steps;
    //     let startCy = this.camera.position.y / steps;
    //     let startCz = this.camera.position.z / steps;
    //     let startTx = this.controls.target.x / steps;
    //     let startTy = this.controls.target.y / steps;
    //     let startTz = this.controls.target.z / steps;


    //     for(let i = 1; i < steps * 1000; i++){
    //         let cameraPos = new THREE.Vector3(startCx * i, startCy * i, startCz * i);
    //         let targetPos = new THREE.Vector3(startTx * i, startTy * i, startTz * i);
    //         console.log("setScene2", i, cameraPos);
    //         this.camera.position.copy(cameraPos);
    //     }
    // }

    async goToComputer(){
        await this.setScene(0, 18, 5, 0, 18, 0, 2);
        // await this.setScene2(0, 18, 5, -5, 18, 0, 2);
        // await this.setScene2(-20, 18, -10, -25, 18, -15, 4);
        // await this.setScene(-10, 18, -20, 10, 18, 10, 4, "circ.inOut");
        // await this.setScene(0, 18, -5, -5, 18, 0, 2, "circ.inOut");
        //await this.setScene(0, 18, -5, -5, 18, 0, 2);

    }

    setFpsCamera(){
        this.fpsCamera_ = new FirstPersonCamera(this.camera);
    }
}

class InputController{
    constructor(){
        this.initialize_();
    }

    initialize_(){
        this.current_ = {
            leftButton: false,
            rightButton: false,
            mouseX: 0,
            mouseY: 0,
        };
        this.previous_ = null;
        this.keys_ = {};
        this.previousKeys_ = {};

        this.controlsLock = false;

        document.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
        document.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
        document.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
        document.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
    }

    onMouseDown_(e){
        switch(e.button){
            case 0:
                this.current_.leftButton = true;
                break;
            case 2:
                this.current_.rightButton = true;
                break;
        }        
    }

    onMouseUp_(e){
        switch(e.button){
            case 0:
                this.current_.leftButton = false;
                break;
            case 2:
                this.current_.rightButton = false;
                break;
        }
    }

    onMouseMove_(e){
        // this.current_.mouseX = e.pageX - window.innerWidth / 2;
        // this.current_.mouseY = e.pageY - window.innerHeight / 2;
        this.current_.mouseX = e.movementX + (this.previous_?.mouseX ?? 0);
        this.current_.mouseY = e.movementY + (this.previous_?.mouseY ?? 0);

        if(this.previous_ === null){
            this.previous_ = {...this.current_};
        }

        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
    }

    onKeyDown_(e){
        this.keys_[e.keyCode] = true;
    }
    onKeyUp_(e){
        this.keys_[e.keyCode] = false;
    }

    key(keyCode) {
        return !!this.keys_[keyCode];
      }

    update(_) {
    if (this.previous_ !== null) {
        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

        this.previous_ = {...this.current_};
    }
    }
}

class FirstPersonCamera {
    constructor(camera){
        this.camera_ = camera;
        this.input_ = new InputController();
        this.rotation_ = new THREE.Quaternion();
        //this.translation_ = new THREE.Vector3(0, 18, 0);
        this.translation_ = new THREE.Vector3().copy(camera.position);
        this.phi_ = 0;
        this.phiSpeed_ = 4;
        this.theta_ = 0;
        this.thetaSpeed_ = 2.5;

        this.headBobActive_ = false;
        this.headBobTimer_ = 0;
    }

    update(timeElapsedS){
        if(!this.input_.controlsLock){
            return;
        }
        this.updateRotation_(timeElapsedS);
        this.updateCamera_(timeElapsedS);
        this.updateTranslation_(timeElapsedS);
        this.updateHeadBob_(timeElapsedS);
        this.input_.update(timeElapsedS)
    }

    updateCamera_(_){
        this.camera_.quaternion.copy(this.rotation_);
        this.camera_.position.copy(this.translation_);
        this.camera_.position.y += Math.sin(this.headBobTimer_ * 10) * .5;
    }

    updateHeadBob_(timeElapsedS){
        if (this.headBobActive_) {
            const wavelength = Math.PI;
            const nextStep = 1 + Math.floor(((this.headBobTimer_ + 0.000001) * 10) / wavelength);
            const nextStepTime = nextStep * wavelength / 10;
            this.headBobTimer_ = Math.min(this.headBobTimer_ + timeElapsedS, nextStepTime);
      
            if (this.headBobTimer_ == nextStepTime) {
              this.headBobActive_ = false;
            }
          }
    }

    updateTranslation_(timeElapsedS){
        const forwardVelocity = (this.input_.key(87) ? 1 : 0) + (this.input_.key(83) ? -1 : 0);
        const strafeVelocity = (this.input_.key(65) ? 1 : 0) + (this.input_.key(68) ? -1 : 0);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
    
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);
    
        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity * timeElapsedS * 10);
    
        this.translation_.add(forward);
        this.translation_.add(left);

        if(forwardVelocity != 0 || strafeVelocity != 0){
            this.headBobActive_ = true;
        }
    }

    updateRotation_(timeElapsedS){
        const xh = this.input_.current_.mouseXDelta / window.innerWidth;
        const yh = this.input_.current_.mouseYDelta / window.innerHeight;
        if(isNaN(xh) || isNaN(yh)){
            return;
        }
        this.phi_ += -xh * this.phiSpeed_;
        this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3);
    
        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);
    
        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);
    
        this.rotation_.copy(q);
    }
}

function flickerStack(){
    let stack = scene.children.filter((child) => child.name === 'text');
    console.log('Stack', stack);
    for(let i = 0; i < 7; i++){
        setTimeout(() => {
            stack.forEach((text) => {
                text.layers.toggle(BLOOM_SCENE);
            });
        }, 700/Math.pow(2, i));
    }

}

function createRigidbodyOutlineHelper(scene, rigidBody, color = 0xff0000) {
    const shape = rigidBody.getCollisionShape(); // Get the collision shape of the rigidbody
    console.log('Shape', rigidBody.getCollisionShape());
    const halfExtents = shape.getLocalScaling();
    const margin = shape.getMargin();
    console.log('Shape', shape.calculateLocalInertia());

    let geometry;

    geometry = new THREE.BoxGeometry(halfExtents.x() * 2, halfExtents.y() * 2, halfExtents.z() * 2);


    const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Update the position and rotation of the mesh according to the rigidbody
    const transform = rigidBody.getWorldTransform();
    const position = transform.getOrigin();
    const quaternion = transform.getRotation();
    mesh.position.set(position.x(), position.y(), position.z());
    mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());

    return mesh;
}

const clamp = (val, min, max) => Math.min(Math.max(val, min), max)
