import * as THREE from '../libraries/Three/three.module.min.js';
import { OrbitControls } from '../libraries/Three/OrbitControls.js';

import { FontLoader } from '../libraries/Three/FontLoader.js';
import { TextGeometry } from '../libraries/Three/TextGeometry.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';

import gsap from "../libraries/Three/gsap-core.js";

import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js';
// import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/controls/PointerLockControls.js';


let timeElapsed = 0;
let APP_ = null;
let CONTROLS_ = null;
let previousRAF_ = null;
const DEFAULT_MASS = 10;
const DEFALUT_CAM_POS = new THREE.Vector3(0, 2, 0);
// const CAM_START_POS = new THREE.Vector3(-30, 10, -20);
// const CAM_START_POS = new THREE.Vector3(-35, 20, -20);
// const TARGET_START_POS = new THREE.Vector3(-30, 45, -40);
const CAM_START_POS = new THREE.Vector3(55, 2, -20);
const TARGET_START_POS = new THREE.Vector3(57, 35, -25);

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

let raycaster;



let topText = null;
let textBottom = null;  

const primaryColor = '#B6DBF2';
const primaryColorDark = '#10403B';
const secondaryColor = '#8AA6A3';
const tertiaryColor = '#10403B';


const scene = new THREE.Scene();
const canvas = document.querySelector('#tech-stack');
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#tech-stack'),
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

const progressBar = document.getElementById('progress-bar');
loadingManager.onProgress = function(url, loaded, total){
  progressBar.value = (loaded / total) * 100;
}

const progressBarContainer = document.querySelector('.progress-bar-container');
loadingManager.onLoad = function(){
   progressBarContainer.style.display = 'none';
   
   CONTROLS_.centerCamera(10);
 }

function animate(){
    requestAnimationFrame((t) => {
        if (previousRAF_ === null) {
          previousRAF_ = t;
        }

        scene.traverse(nonBloomed);

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


  
        //characterMotions();
        APP_.step_(t - previousRAF_);
        CONTROLS_.composer.render();
        scene.traverse(restoreMaterial);
        CONTROLS_.finalComposer.render();
        //renderer.render(scene, CONTROLS_.camera);
        animate();
        previousRAF_ = t;
      });
}

function onWindowResize(){
    CONTROLS_.camera.aspect = window.innerWidth / window.innerHeight;
    CONTROLS_.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth , window.innerHeight);
    CONTROLS_.composer.setSize(window.innerWidth , window.innerHeight);
    CONTROLS_.finalComposer.setSize(window.innerWidth , window.innerHeight);

  }

function setupControls(){




    // const mouse = new THREE.Vector2();
    // const intersectionPoint = new THREE.Vector3();
    // const planeNormal = new THREE.Vector3();
    // const plane = new THREE.Plane();
    // const raycaster = new THREE.Raycaster();
    // const tempPos = new THREE.Vector3();
    
    // canvas.addEventListener('mousemove', function(e){
    //     mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    //     mouse.y = -(e.clientY / window.innerHeight) * 2 + 1.5;
    //     planeNormal.copy(CONTROLS_.camera.position).normalize();
    //     plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    //     raycaster.setFromCamera(mouse, CONTROLS_.camera);
    //     raycaster.ray.intersectPlane(plane, intersectionPoint);
    // });
    // canvas.addEventListener('click', function(e){
    //     const sphereGeo = new THREE.SphereGeometry(.5, 32, 32);
    //     const sphereMat = new THREE.MeshStandardMaterial({color: primaryColor, roughness: 0.5, metalness: 0});
        
    //     const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    //     sphereMesh.castShadow = true;
    //     sphereMesh.quaternion.set(0, 0, 0, 1);
    
    //     scene.add(sphereMesh);
    //     const shotY = intersectionPoint.y < 0 ? 0 : intersectionPoint.y;
    //     sphereMesh.position.set(CONTROLS_.camera.position.x, shotY + CONTROLS_.controls.target.y, CONTROLS_.camera.position.z);
    
    //     const sphereBody = new RigidBody();
    //     sphereBody.createSphere(5, sphereMesh.position, 1);
    //     sphereBody.setRestitution(0.99);
    //     sphereBody.setFriction(0.5);
    //     sphereBody.setRollingFriction(0.5);
    //     APP_.physicsWorld_.addRigidBody(sphereBody.body_);
    //     APP_.rigidBodies_.push({ mesh: sphereMesh, rigidBody: sphereBody });
    
    //     tempPos.copy(raycaster.ray.direction);
    //     tempPos.multiplyScalar(50);
    //     console.log('Sphere body', sphereBody.body_);
    //     sphereBody.body_.setLinearVelocity(new Ammo.btVector3(tempPos.x, tempPos.y, tempPos.z));    
    // });
}


window.addEventListener('resize', onWindowResize, false);
window.addEventListener('DOMContentLoaded', async() => {
    Ammo().then((lib) => {
        Ammo = lib;
        APP_ = new MyWorld();
        CONTROLS_ = new Controls();
        //APP_.initialize();
        animate();
    });
    const respawn = document.getElementById('respawn');
    respawn.addEventListener('click', function(){
            CONTROLS_.centerCamera(10);
        });
    setupControls();   
});

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
    }
    initialize(){
        this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
        this.broadphase_ = new Ammo.btDbvtBroadphase();
        this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(
            this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
        this.physicsWorld_.setGravity(new Ammo.btVector3(0, -50, 0));

        // SET ENVIRONMENT

        // const coffeeShop = new GLTFLoader(loadingManager); coffeeShop.load('../assets/scenes/cyberpunk_isometric_coffee_shop_cycles/scene.gltf', function( gltf ) {
        //     gltf.scene.position.x = -40;
        //     gltf.scene.position.y = 0;
        //     gltf.scene.position.z = -20;
        //     gltf.scene.rotation.y = 1.57;
        //     gltf.scene.scale.set(5, 5, 5);
        //     gltf.scene.name = "coffeeShop";
        //     gltf.scene.traverse( function( node ) {
          
        //       //  node.castShadow = true; 
        //       //  node.receiveShadow = true;
          
        //   } );
        //   scene.add( gltf.scene);
        //   }, undefined, function ( error ) { console.error(error); });

        //   const store = new GLTFLoader(loadingManager); store.load('../assets/scenes/247_cyberpunk_store/scene.gltf', function( gltf ) {
        //     gltf.scene.position.x = 40;
        //     gltf.scene.position.y = 2;
        //     gltf.scene.position.z = -20;
        //     gltf.scene.rotation.y = -1.57;
        //     gltf.scene.scale.set(5, 5, 5);
        //     gltf.scene.name = "coffeeShop";
        //     gltf.scene.traverse( function( node ) {
          
        //       //  node.castShadow = true; 
        //       //  node.receiveShadow = true;
          
        //   } );
        //   scene.add( gltf.scene);
        //   }, undefined, function ( error ) { console.error(error); });

        const store = new GLTFLoader(loadingManager); store.load('../assets/scenes/247_cyberpunk_store/scene.gltf', function( gltf ) {
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
        

        /// SET GROUND
        const groundGeometry = new THREE.BoxGeometry(400, 1, 200);
        const groundMaterial = new THREE.MeshStandardMaterial( {color: 'black', roughness: 1, metalness: .2} );
        const plane = new THREE.Mesh( groundGeometry, groundMaterial );
        plane.receiveShadow = true;
        scene.add( plane );

        const rbGround = new RigidBody();
        rbGround.createBox(0, new THREE.Vector3(0, 0, 0), plane.quaternion, new THREE.Vector3(200, 1, 100));
        rbGround.setRestitution(0.99);
        this.physicsWorld_.addRigidBody(rbGround.body_);
        this.rigidBodies_ = [];

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
          
        Array(500).fill().forEach(addRain);
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

            const rbTopText = new RigidBody();
            rbTopText.createText(0, topText.position, topText.quaternion, new THREE.Vector3(logoSize * 2, logoSize, 1));
            rbTopText.setRestitution(0.125);
            rbTopText.setFriction(10);
            rbTopText.setRollingFriction(10);

            const rbTextBottom = new RigidBody();
            rbTextBottom.createText(0, textBottom.position, textBottom.quaternion, new THREE.Vector3(logoSize * 4, logoSize, 1));
            rbTextBottom.setRestitution(0.125);
            rbTextBottom.setFriction(10);
            rbTextBottom.setRollingFriction(10);


            textBottom.userData.physicsBody = rbTextBottom.body_ ;
            topText.userData.physicsBody = rbTopText.body_;

            APP_.physicsWorld_.addRigidBody(rbTopText.body_);
            APP_.rigidBodies_.push({ id: "test", mesh: topText, rigidBody: rbTopText });
            APP_.physicsWorld_.addRigidBody(rbTextBottom.body_);
            APP_.rigidBodies_.push({ mesh: textBottom, rigidBody: rbTextBottom });
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
        this.physicsWorld_.stepSimulation(timeElapsedS, 10);


        for (let i = 0; i < this.rigidBodies_.length; ++i) {
            if(this.rigidBodies_[i].mesh.position.y < -10){
                scene.remove(this.rigidBodies_[i].mesh);
                this.physicsWorld_.removeRigidBody(this.rigidBodies_[i].rigidBody.body_);
                this.rigidBodies_.splice(i, 1);
                i--;
            }
          this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
          const pos = this.tmpTransform_.getOrigin();
          const quat = this.tmpTransform_.getRotation();
          const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
          const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
    
          this.rigidBodies_[i].mesh.position.copy(pos3);
          this.rigidBodies_[i].mesh.quaternion.copy(quat3);
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
}

class Controls{
    camera = new THREE.PerspectiveCamera( 80, window.innerWidth  / window.innerHeight, 1, 1000 );
    controls = null;

    renderScene = new RenderPass(scene, this.camera);
    composer = new EffectComposer(renderer);
    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth , window.innerHeight), 
        1.2, 
        0.005, 
        0.05
    );
    mixPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: this.composer.renderTarget2.texture }
            },
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
        }), 'baseTexture'
    );

    finalComposer = new EffectComposer(renderer);

    outputPass = new OutputPass();

    constructor(){        
        this.composer.setSize(window.innerWidth , window.innerHeight);
        this.composer.addPass(this.renderScene);
        this.composer.addPass(this.bloomPass);
        this.composer.renderToScreen = false;

        //this.composer.addPass(this.outputPass);

        this.finalComposer.setSize(window.innerWidth , window.innerHeight);
        this.finalComposer.addPass(this.renderScene);
        this.finalComposer.addPass(this.mixPass);
        this.finalComposer.addPass(this.outputPass);


        this.camera.position.copy(CAM_START_POS);
        
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

        // const lightHelper = new THREE.PointLight( light, 5 );
        // scene.add( lightHelper );

        // const helper = new THREE.CameraHelper( light.shadow.camera );
        // scene.add( helper );

        this.controls = new OrbitControls(this.camera, renderer.domElement);
        
        this.controls.minDistance = 1;
        this.controls.maxDistance = 1000;
        this.controls.minPolarAngle = 1;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target = TARGET_START_POS;
        // SET USER CONTROLS
        // this.controls = new PointerLockControls(this.camera, renderer.domElement);
        // this.controls.lock();
        // scene.add(this.controls.getObject());

        // raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

        this.controls.update();
    }

    async centerCamera(seconds){
        let ms = seconds * 1000;
        setTimeout(() => {
            this.setScene(CAM_START_POS.x + 10, CAM_START_POS.y, CAM_START_POS.z + 20, TARGET_START_POS.x - 5, TARGET_START_POS.y - 10, TARGET_START_POS.z + 10, seconds * 0.4); 
        }, 0);
        setTimeout(() => {
            this.setScene(-10, 10, 5, -5, 10, -2, seconds * 0.2);
        }, (ms * .4) - 500);
        setTimeout(() => {
            this.setScene(0, 20, window.innerWidth > 600 ? 30 : 45, 0, 20, 0, seconds * 0.4);
        }, (ms * .6) - 500);
        setTimeout(() => {
            flickerStack();
        }, ms);
    }

    setScene(cx, cy, cz,tx ,ty ,tz, seconds){
        let controls = this.controls;
        gsap.to(this.camera.position, {
            x: cx,
            y: cy,
            z: cz,
            duration: seconds,
            ease: "back.inOut(1)",
              onUpdate: function(){
                controls.update();
              }
          });
        gsap.to(this.controls.target, {
              x: tx,
              y: ty,
              z: tz,
              duration: seconds,
              onUpdate: function(){
                  controls.update();
                }
          });
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, seconds * 1000);
          });
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


// user controls

var ArrowUpVar = 0.5;
var ArrowDownVar =  -0.5;
document.onkeydown = checkKeyDown;
document.onkeyup = checkKeyUp;

var moveup = false;
var moveleft = false;
var movedown = false;
var moveright = false;
var moveforward = false;
var moveback = false

document.addEventListener("keyup", function(){ArrowUpVar = 0.05; ArrowDownVar = -0.05});
function checkKeyUp(e) {

    switch(e.keyCode){
        case 38:
            moveup = false;
            ArrowUpVar = ArrowUpVar + -0.1;
            break;
        case 40:
            movedown = false;
            ArrowDownVar = ArrowDownVar + 0.1;
            break;
        case 37:
            moveleft = false;
            ArrowUpVar = ArrowUpVar + -0.1;
            break;
        case 39:
            moveright = false;
            ArrowDownVar = ArrowDownVar + 0.1;
            break;
        case 87:
            moveup = false;
            ArrowUpVar = ArrowUpVar + -0.1;
            break;
        case 83:
            movedown = false;
            ArrowDownVar = ArrowDownVar + 0.1;
            break;
        case 65:
            moveleft = false;
            ArrowUpVar = ArrowUpVar + -0.1;
            break;
        case 68:
            moveright = false;
            ArrowDownVar = ArrowDownVar + 0.1;
            break;
        case 32:
            moveforward = false;
            break;
        case 16:
            moveback = false;
            break;
    }
  }
function checkKeyDown(e) {

    switch(e.keyCode){
        case 38:
            moveup = true;
            break;
        case 40:
            movedown = true;
            break;
        case 37:
            moveleft = true;
            break;
        case 39:
            moveright = true;
            break;
        case 87:
            moveup = true;
            break;
        case 83:
            movedown = true;
            break;
        case 65:
            moveleft = true;
            break;
        case 68:
            moveright = true;
            break;
        case 32:
            moveforward = true;
            break;
        case 16:
            moveback = true;
            break;
    }
  }

function characterMotions(){
    if(moveup){
        CONTROLS_.setScene(CONTROLS_.camera.position.x, 
            CONTROLS_.camera.position.y, 
            CONTROLS_.camera.position.z += ArrowUpVar, 
            CONTROLS_.controls.target.x, 
            CONTROLS_.controls.target.y, 
            CONTROLS_.controls.target.z += ArrowUpVar, 0);
        
      }
      if(moveright){
        CONTROLS_.camera.rotation.y -= 0.1;
        CONTROLS_.controls.rotation.x -= 0.1;
        CONTROLS_.controls.update();
        // CONTROLS_.setScene(CONTROLS_.camera.position.x, 
        //     CONTROLS_.camera.position.y, 
        //     CONTROLS_.camera.position.z += ArrowDownVar, 
        //     CONTROLS_.controls.target.x, 
        //     CONTROLS_.controls.target.y, 
        //     CONTROLS_.controls.target.z += ArrowDownVar, 0);

        // CONTROLS_.controls.target.x += ArrowDownVar;
      }
      if(movedown){
        CONTROLS_.setScene(CONTROLS_.camera.position.x, 
            CONTROLS_.camera.position.y, 
            CONTROLS_.camera.position.z += ArrowDownVar, 
            CONTROLS_.controls.target.x, 
            CONTROLS_.controls.target.y, 
            CONTROLS_.controls.target.z += ArrowDownVar, 0);
        // CONTROLS_.camera.position.z += ArrowDownVar;
        // CONTROLS_.controls.target.z += ArrowDownVar;
      }
      if(moveleft){
        // CONTROLS_.camera.position.x += ArrowUpVar;
        // CONTROLS_.controls.target.x += ArrowUpVar;
        CONTROLS_.camera.rotation.y += 0.1;
        CONTROLS_.controls.target.x += 0.1;
        //CONTROLS_.controls.update();

      }
      if(moveforward){
    
      }
      if(moveback){
        
      }
}