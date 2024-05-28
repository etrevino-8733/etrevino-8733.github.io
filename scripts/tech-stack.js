import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
//import * as AMMO from 'https://cdn.jsdelivr.net/gh/kripken/ammo.js@HEAD/builds/ammo.js';

// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
// import { MMDPhysics } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/animation/MMDPhysics.js';
import { OrbitControls } from '../libraries/Three/OrbitControls.js';

import { FontLoader } from '../libraries/Three/FontLoader.js';
import { TextGeometry } from '../libraries/Three/TextGeometry.js';
// import { Mesh } from '../libraries/Three/three.module.js';
import gsap from "../libraries/Three/gsap-core.js";

let timeElapsed = 0;
let APP_ = null;
let CONTROLS_ = null;
let previousRAF_ = null;
const DEFAULT_MASS = 10;
const DEFALUT_CAM_POS = new THREE.Vector3(0, 2, 0);
const CAM_START_POS = new THREE.Vector3(-55, 40, -10);


const scene = new THREE.Scene();
const canvas = document.querySelector('#tech-stack');
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#tech-stack'),
    antialias: true,
  });
const canvasHeight = 500;

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
  
        APP_.step_(t - previousRAF_);
        renderer.render(scene, CONTROLS_.camera);
        animate();
        previousRAF_ = t;
      });
}

function onWindowResize(){
    CONTROLS_.camera.aspect = window.innerWidth / canvasHeight;
    CONTROLS_.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 80, canvasHeight);
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
        console.log('Click', e);
        const sphereGeo = new THREE.SphereGeometry(.5, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({color: '#F2630F', roughness: 0.5, metalness: 0});
        
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
        CONTROLS_.centerCamera(5);
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
            CONTROLS_.centerCamera(5);

            renderer.render( scene, CONTROLS_.camera );

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
        const groundGeometry = new THREE.BoxGeometry(200, 1, 100);
        const groundMaterial = new THREE.MeshStandardMaterial( {color: '#65A87A', roughness: 0.5, metalness: 0 } );
        const plane = new THREE.Mesh( groundGeometry, groundMaterial );
        plane.receiveShadow = true;
        scene.add( plane );

        const rbGround = new RigidBody();
        rbGround.createBox(0, new THREE.Vector3(0, 0, 0), plane.quaternion, new THREE.Vector3(200, 1, 100));
        rbGround.setRestitution(0.99);
        this.physicsWorld_.addRigidBody(rbGround.body_);
        this.rigidBodies_ = [];


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
                    const textMaterial = new THREE.MeshStandardMaterial({color: '#86DFDF', roughness: 0.01, metalness: 0});
                    const text = new THREE.Mesh(textGeometry, textMaterial);
                    text.castShadow = true;
                    text.receiveShadow = true;
                    text.position.set(techXPos, techYPos, 0);
                    text.quaternion.set(0, 0, 0, 1);
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
        const font = loader.load('../assets/fonts/Heebo Black_Regular.json');
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
                mirror: true
            });
            const textGeometryBottom = new TextGeometry('TECH', {
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
                new THREE.MeshPhongMaterial( { color: "#F2630F", flatShading: true } ), // front
                new THREE.MeshPhongMaterial( { color: '#c24e0a' } ) // side
            ];
            const topText = new THREE.Mesh(textGeometryTop, textMaterial);
            const textBottom = new THREE.Mesh(textGeometryBottom, textMaterial);
            textBottom.castShadow = true;
            textBottom.position.y = logoPositionY;
            textBottom.position.x = logoPositionX;
            textBottom.position.z = logoPositionZ;
            //textBottom.rotation.y = Math.PI / 2;
            scene.add(textBottom);
            topText.castShadow = true;
            topText.position.y = logoPositionY + logoSize;
            topText.position.x = logoPositionX;
            topText.position.z = logoPositionZ;
            //topText.rotation.y = Math.PI / 5;
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

            APP_.physicsWorld_.addRigidBody(rbTopText.body_);
            APP_.rigidBodies_.push({ mesh: topText, rigidBody: rbTopText });
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
              color: '#F2630F',
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
    camera = new THREE.PerspectiveCamera( 80, window.innerWidth / canvasHeight, 1, 1000 );
    controls = null;

    constructor(){
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth - 80, canvasHeight );
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.position.copy(CAM_START_POS);
        
        const light = new THREE.DirectionalLight(0xffffff, 1, 100);
        light.position.set( -50, 50, 50 );
        light.p
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
        scene.background = new THREE.Color("#dfe2e6"); 
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
        this.controls.target = new THREE.Vector3(-40, 40, -10);
    }

    centerCamera(seconds){
        let controls = this.controls;
        gsap.to(this.camera.position, {
          x: 0,
          y: 2,
          z: 30,
          duration: seconds
        });
        gsap.to(this.controls.target, {
            x: 0,
            y: 2,
            z: 0,
            duration: seconds,
            onUpdate: function(){
                controls.update();
              }
            });
        gsap.updateRoot(timeElapsed);
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
