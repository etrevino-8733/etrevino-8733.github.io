import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
//import * as AMMO from 'https://cdn.jsdelivr.net/gh/kripken/ammo.js@HEAD/builds/ammo.js';

// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
// import { MMDPhysics } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/animation/MMDPhysics.js';
import { OrbitControls } from '../libraries/Three/OrbitControls.js';

import { FontLoader } from '../libraries/Three/FontLoader.js';
import { TextGeometry } from '../libraries/Three/TextGeometry.js';
// import { Mesh } from '../libraries/Three/three.module.js';
import gsap from "../libraries/Three/gsap-core.js";

import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js';


let timeElapsed = 0;
let APP_ = null;
let CONTROLS_ = null;
let previousRAF_ = null;
const DEFAULT_MASS = 10;
const DEFALUT_CAM_POS = new THREE.Vector3(0, 2, 0);
// const CAM_START_POS = new THREE.Vector3(-30, 10, -20);
const CAM_START_POS = new THREE.Vector3(-35, 20, -20);
const TARGET_START_POS = new THREE.Vector3(-30, 45, -40);

const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({ color:  0x000000 });
const materials = {};

function nonBloomed(obj){
    if(obj.isMesh && bloomLayer.test(obj.layers) === false){
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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onPointerDown(event){
    mouse.x = (event.clientX / (window.innerWidth)) * 2 - 1;
    mouse.y = -(event.clientY / canvasHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, CONTROLS_.camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if(intersects.length > 0){
        const object = intersects[0].object;
        object.layers.toggle(BLOOM_SCENE);
    }
}


let topText = null;
let textBottom = null;  

// const primaryColor = '#F2630F';
// const primaryColorDark = '#5B89A6';
// const secondaryColor = '#86DFDF';
// const tertiaryColor = '#65A87A';
const primaryColor = '#B6DBF2';
const primaryColorDark = '#10403B';
const secondaryColor = '#8AA6A3';
const tertiaryColor = '#10403B';
const canvasHeight = 500;


const scene = new THREE.Scene();
const canvas = document.querySelector('#tech-stack');
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#tech-stack'),
    antialias: true,
  });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth - 80, canvasHeight );
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
 }

function animate(){
    requestAnimationFrame((t) => {
        if (previousRAF_ === null) {
          previousRAF_ = t;
        }

        // if(topText !== null){
        //     let scalingFactor = 20;
    
        //     let resultantImpulse = new Ammo.btVector3( 20, 20, 2 )
        //     resultantImpulse.op_mul(scalingFactor);
        
        //     console.log('Top text', topText);
        //     let physicsBody = topText.userData.physicsBody;
        // }
        scene.traverse(nonBloomed);

        scene.traverse((object) => {
            if (object.isMesh && object.name === 'star') {
              object.position.y -= 0.01;
              object.position.x += Math.sin(object.position.y * 0.1) * 0.01;
                if (object.position.y < -1) {
                    object.position.y = 200;
                }
            }
        });
  
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
    CONTROLS_.camera.aspect = window.innerWidth / canvasHeight;
    CONTROLS_.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 80, canvasHeight);
    CONTROLS_.composer.setSize(window.innerWidth - 80, canvasHeight);
    CONTROLS_.finalComposer.setSize(window.innerWidth - 80, canvasHeight);

  }

function setupControls(){
    const mouse = new THREE.Vector2();
    const intersectionPoint = new THREE.Vector3();
    const planeNormal = new THREE.Vector3();
    const plane = new THREE.Plane();
    const raycaster = new THREE.Raycaster();
    const tempPos = new THREE.Vector3();
    
    canvas.addEventListener('mousemove', function(e){
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / canvasHeight) * 2 + 1.5;
        planeNormal.copy(CONTROLS_.camera.position).normalize();
        plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
        raycaster.setFromCamera(mouse, CONTROLS_.camera);
        raycaster.ray.intersectPlane(plane, intersectionPoint);
    });
    canvas.addEventListener('click', function(e){
        const sphereGeo = new THREE.SphereGeometry(.5, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({color: primaryColor, roughness: 0.5, metalness: 0});
        
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.castShadow = true;
        sphereMesh.quaternion.set(0, 0, 0, 1);
    
        scene.add(sphereMesh);
        const shotY = intersectionPoint.y < 0 ? 0 : intersectionPoint.y;
        sphereMesh.position.set(CONTROLS_.camera.position.x, shotY + CONTROLS_.controls.target.y, CONTROLS_.camera.position.z);
    
        const sphereBody = new RigidBody();
        sphereBody.createSphere(5, sphereMesh.position, 1);
        sphereBody.setRestitution(0.99);
        sphereBody.setFriction(0.5);
        sphereBody.setRollingFriction(0.5);
        APP_.physicsWorld_.addRigidBody(sphereBody.body_);
        APP_.rigidBodies_.push({ mesh: sphereMesh, rigidBody: sphereBody });
    
        tempPos.copy(raycaster.ray.direction);
        tempPos.multiplyScalar(50);
        console.log('Sphere body', sphereBody.body_);
        sphereBody.body_.setLinearVelocity(new Ammo.btVector3(tempPos.x, tempPos.y, tempPos.z));    
    });
}


window.addEventListener('resize', onWindowResize, false);
window.addEventListener('DOMContentLoaded', async() => {
    Ammo().then((lib) => {
        Ammo = lib;
        APP_ = new MyWorld();
        CONTROLS_ = new Controls();
        APP_.initialize();
        setTimeout(() => {
            CONTROLS_.centerCamera(10);
        }, 1000);
    });
    const respawn = document.getElementById('respawn');
    respawn.addEventListener('click', function(){
            console.log('Respawn');
            
            APP_.rigidBodies_.forEach((rb) => {
                scene.remove(rb.mesh);
                APP_.physicsWorld_.removeRigidBody(rb.rigidBody.body_);
            });
            APP_.rigidBodies_ = [];
            APP_.count_ = 0;
            APP_.countdown_ = 1.0;
            APP_.initialize();
            CONTROLS_.centerCamera(10);

            //renderer.render( scene, CONTROLS_.camera );

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
        

        /// SET GROUND
        const groundGeometry = new THREE.BoxGeometry(400, 1, 200);
        const groundMaterial = new THREE.MeshStandardMaterial( {color: tertiaryColor, roughness: 0, metalness: 0 } );
        const plane = new THREE.Mesh( groundGeometry, groundMaterial );
        plane.receiveShadow = true;
        scene.add( plane );

        // const backWallGeometry = new THREE.BoxGeometry(400, 200, 1);
        // const backWallMaterial = new THREE.MeshStandardMaterial( {color: '#dfe2e6', roughness: 1, metalness: 0 } );
        // const backWall = new THREE.Mesh( backWallGeometry, backWallMaterial );
        // backWall.position.z = -100;
        // backWall.position.y = 50;
        // backWall.receiveShadow = false;
        // scene.add( backWall );

        // const leftWallGeometry = new THREE.BoxGeometry(1, 200, 400);
        // const leftWallMaterial = new THREE.MeshStandardMaterial( {color: '#dfe2e6', roughness: 1, metalness: 0 } );
        // const leftWall = new THREE.Mesh( leftWallGeometry, leftWallMaterial );
        // leftWall.position.x = -200;
        // leftWall.position.y = 50;
        // leftWall.receiveShadow = false;
        // scene.add( leftWall );

        // const rightWallGeometry = new THREE.BoxGeometry(1, 200, 400);
        // const rightWallMaterial = new THREE.MeshStandardMaterial( {color: '#dfe2e6', roughness: 1, metalness: 0 } );
        // const rightWall = new THREE.Mesh( rightWallGeometry, rightWallMaterial );
        // rightWall.position.x = 200;
        // rightWall.position.y = 50;
        // rightWall.receiveShadow = false;
        // scene.add( rightWall );
        

        const rbGround = new RigidBody();
        rbGround.createBox(0, new THREE.Vector3(0, 0, 0), plane.quaternion, new THREE.Vector3(200, 1, 100));
        rbGround.setRestitution(0.99);
        this.physicsWorld_.addRigidBody(rbGround.body_);
        this.rigidBodies_ = [];

        function addStar() {
            const geometry = new THREE.SphereGeometry(.05, 10, 10);
            const material = new THREE.MeshStandardMaterial( { color: 'white', roughness: 0, metalness: 1, emissive: '#454545', flatShading: true})
            const star = new THREE.Mesh( geometry, material );
          
            const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread( 100 ) );
            star.position.set(x, y, z );
            star.name = 'star';
            scene.add(star)
          
          }
          
          Array(200).fill().forEach(addStar);


        // SET ENVIRONMENT TEXT
        const stack = [
            {"tech": ["SQL Server", "Mongo DB","Azure", "Docker"]},
            {"tech": [".Net Core", "asp.net", "Angular", "NX"]},            
            {"tech": ["TypeScript", "JavaScript", "HTML", "CSS", "SASS", "C#"]},
        ];
        let height = 2;
        let startXPos = -25;
        let longestTech = 0;
        for (let x = 0; x < stack.length; x++){
            startXPos = startXPos + (longestTech * height);
            longestTech = 0;
            for (let i = 0; i < stack[x].tech.length; i++){
                const techYPos = i * height + 1;

                const tech = stack[x].tech[i];
                const techXPos = startXPos;

                if (tech.length > longestTech){
                    longestTech = tech.length;
                    console.log('Longest tech', longestTech);
                }
                const loader = new FontLoader(loadingManager);
                const font = loader.load('../assets/fonts/Heebo Black_Regular.json');
                loader.load('../assets/fonts/Heebo Black_Regular.json', function(font){
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
                    });
                    const textMaterial = new THREE.MeshStandardMaterial({color: secondaryColor, roughness: 1, metalness: 0.05});
                    const text = new THREE.Mesh(textGeometry, textMaterial);
                    text.castShadow = true;
                    text.receiveShadow = true;
                    text.position.set(techXPos, techYPos, 0);
                    text.quaternion.set(0, 0, 0, 1);
                    text.name = 'text';

                    scene.add(text);
    
                    const rbText = new RigidBody();
                    rbText.createText(35, new THREE.Vector3(text.position.x, text.position.y, text.position.z), text.quaternion, new THREE.Vector3(height * tech.length, 2, 1.5));
                    rbText.setRestitution(0);
                    rbText.setFriction(.5);
                    rbText.setRollingFriction(0);
                    APP_.physicsWorld_.addRigidBody(rbText.body_);
                    APP_.rigidBodies_.push({ mesh: text, rigidBody: rbText });
                    //createRigidbodyOutlineHelper(scene, rbText.body_, 0x86DFDF);

                });
            }
        }

        const logoSize = 10;
        const logoPositionX = -50;
        const logoPositionZ = -30;
        const logoPositionY = 25;
        const loader = new FontLoader(loadingManager);
        loader.load('../assets/fonts/Heebo Black_Regular.json', function(font){
            const textGeometryTop = new TextGeometry('ET', {
                font: font,
                size: logoSize,
                depth: 5,
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
                depth: 5,
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
            //textBottom.rotation.y = Math.PI / 2;
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

        animate();
    }

    step_(timeElapsed){
        const timeElapsedS = timeElapsed * 0.001;

        this.countdown_ -= timeElapsedS;
        // if (this.countdown_ < 0 && this.count_ < 12) {
        //     console.log('Spawn', this.countdown_);
        //   this.countdown_ = 0.25;
        //   this.count_ += 1;
        //   this.spawn_();
        // }
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
    camera = new THREE.PerspectiveCamera( 80, window.innerWidth  / canvasHeight, 1, 1000 );
    controls = null;

    renderScene = new RenderPass(scene, this.camera);
    composer = new EffectComposer(renderer);
    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth - 80, canvasHeight), 
        1, 
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
        this.composer.setSize(window.innerWidth - 80, canvasHeight);
        this.composer.addPass(this.renderScene);
        this.composer.addPass(this.bloomPass);
        this.composer.renderToScreen = false;

        //this.composer.addPass(this.outputPass);

        this.finalComposer.setSize(window.innerWidth - 80, canvasHeight);
        this.finalComposer.addPass(this.renderScene);
        this.finalComposer.addPass(this.mixPass);
        this.finalComposer.addPass(this.outputPass);


        this.camera.position.copy(CAM_START_POS);
        //this.camera.position.z = window.innerWidth > 600 ? CAM_START_POS.x : 20;
        
        const light = new THREE.DirectionalLight(0xffffff, 1, 100);
        light.position.set( -50, 50, 50 );
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
        
        //scene.background = new THREE.Color("#dfe2e6"); 
        //scene.fog = new THREE.Fog( 0xcccccc, 10, 200 );
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

        this.controls.update();
    }

    async centerCamera(seconds){
        let ms = seconds * 1000;
        setTimeout(() => {
            this.setScene(CAM_START_POS.x + 10, CAM_START_POS.y, CAM_START_POS.z + 20, TARGET_START_POS.x, TARGET_START_POS.y - 15, TARGET_START_POS.z + 20, seconds * 0.4); 
        }, 0);
        setTimeout(() => {
            this.setScene(-25,5, 5, -20, 5, -2, seconds * 0.2);
        }, (ms * .4) - 500);
        setTimeout(() => {
            this.setScene(0, 2, window.innerWidth > 600 ? 30 : 45, 0, 2, 0, seconds * 0.4);
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
            //ease: "expo.inOut",
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
    setLights(){
        scene.remove(this.ambientLight);
        scene.remove(this.light);
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
    // if (shape instanceof Ammo.btSphereShape) {
    //     const radius = shape.getRadius();
    //     geometry = new THREE.SphereGeometry(radius, 32, 32);
    // } else if (shape instanceof Ammo.btBoxShape) {
    //     const halfExtents = shape.getHalfExtentsWithMargin();
    //     geometry = new THREE.BoxGeometry(halfExtents.x() * 2, halfExtents.y() * 2, halfExtents.z() * 2);
    // } else if (shape instanceof Ammo.btCylinderShape) {
    //     const radius = shape.getRadius();
    //     const height = shape.getHalfExtentsWithoutMargin().y() * 2;
    //     geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    // } else {
    //     console.warn("Unsupported shape type for debug visualization.");
    //     return;
    // }

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
