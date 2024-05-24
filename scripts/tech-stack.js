import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
// import * as Ammo from 'https://cdn.jsdelivr.net/gh/kripken/ammo.js@HEAD/builds/ammo.js';

// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { MMDPhysics } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/animation/MMDPhysics.js';
// import * as Clock from 'https://cdn.jsdelivr.net/npm/three@0.164.1/src/core/Clock.js';
import { OrbitControls } from '../libraries/Three/OrbitControls.js';

import { FontLoader } from '../libraries/Three/FontLoader.js';
import { TextGeometry } from '../libraries/Three/TextGeometry.js';
// import { Mesh } from '../libraries/Three/three.module.js';
// import gsap from "../libraries/Three/gsap-core.js";

let timeElapsed = 0;
let APP_ = null;
let previousRAF_ = null;

// let stack = ["HTML", "CSS", "JavaScript"];
// let startXPos = -3;

const scene = new THREE.Scene();
const canvas = document.querySelector('#tech-stack');
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#tech-stack'),
  });
const canvasHeight = 500;

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / canvasHeight, 0.1, 1000 );
camera.lookAt(0,0,0);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth - 80, canvasHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
camera.position.setZ(5);
camera.position.setY(2);
camera.position.setX(0);

const light = new THREE.DirectionalLight(0xffffff, 1, 100);
light.position.set( -5, 5, 5 )
light.castShadow = true;
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(light, ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

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
    // requestAnimationFrame( animate );
    // controls.update();
    // renderer.render( scene, camera );
    requestAnimationFrame((t) => {
        if (previousRAF_ === null) {
          previousRAF_ = t;
        }
  
        APP_.step_(t - previousRAF_);
        renderer.render(scene, camera);
        animate();
        previousRAF_ = t;
      });
}

//animate();
// const moonTexture = new THREE.TextureLoader(loadingManager).load('../assets/scenes/moon.jpeg');
// const normalTexture = new THREE.TextureLoader(loadingManager).load('../assets/scenes/moonTexture.jpeg');

// const moon = new THREE.Mesh(
//   new THREE.SphereGeometry(8, 32, 32),
//   new THREE.MeshStandardMaterial( {
//     map: moonTexture,
//     normalMap: normalTexture
//   })
// );
// moon.position.y = 0;
// moon.position.x = 0;
// moon.position.z = 0;
// moon.name = "Moon";
// scene.add(moon);

renderer.render( scene, camera );

function onWindowResize(){
    camera.aspect = window.innerWidth / canvasHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 80, canvasHeight);
  }
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('DOMContentLoaded', async() => [
    Ammo().then((lib) => {
        Ammo = lib;
        APP_ = new BasicWorldDemo();
        APP_.initialize();

        //animate();
    })
]);


class setPhysicsWorld {
    constructor() {

    }
}

// const groundGeometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
// const groundMaterial = new THREE.MeshStandardMaterial( {color: '#778B70', side: THREE.DoubleSide , roughness: 0.5, metalness: 0 } );
// const plane = new THREE.Mesh( groundGeometry, groundMaterial );
// plane.receiveShadow = true;
// plane.position.y = 0;
// plane.rotation.x = Math.PI / 2;
// scene.add( plane );



// addStack();
// addLogo();



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
        this.shape_.setMargin(0.05);

        this.inertia_ = new Ammo.btVector3(0, 0, 0);
        if(mass > 0){
            this.shape_.calculateLocalInertia(mass, this.inertia_);
        }

        this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this
            .shape_, this.inertia_);
        this.body_ = new Ammo.btRigidBody(this.info_);
        this.body_.setWorldTransform(this.transform_);
        console.log('Text box',this.body_);

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
        this.shape_.setMargin(0.05);

        this.inertia_ = new Ammo.btVector3(0, 0, 0);
        if(mass > 0){
            this.shape_.calculateLocalInertia(mass, this.inertia_);
        }

        this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this
            .shape_, this.inertia_);
        this.body_ = new Ammo.btRigidBody(this.info_);
        this.body_.setWorldTransform(this.transform_);
        console.log('Text BTSIXE',this.body_);

        Ammo.destroy(btSize);
            
    }
}

/// Physics

class BasicWorldDemo{
    constructor(){


    }
    initialize(){


        this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
        this.broadphase_ = new Ammo.btDbvtBroadphase();
        this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(
            this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
        this.physicsWorld_.setGravity(new Ammo.btVector3(0, -100, 0));  
        
        this.tmpTransform_ = new Ammo.btTransform();

        const groundGeometry = new THREE.PlaneGeometry( 100, 100, 32, 32 );
        const groundMaterial = new THREE.MeshStandardMaterial( {color: '#778B70', side: THREE.DoubleSide , roughness: 0.5, metalness: 0 } );
        const plane = new THREE.Mesh( groundGeometry, groundMaterial );
        plane.receiveShadow = true;
        plane.position.y = 0;
        plane.rotation.x = Math.PI / 2;
        scene.add( plane );

        const rbGround = new RigidBody();
        rbGround.createBox(0, new THREE.Vector3(0, 0, 0), new THREE.Quaternion(0, 0, 0, 1), new THREE.Vector3(20, 0, 20));
        rbGround.setRestitution(0.99);
        this.physicsWorld_.addRigidBody(rbGround.body_);
        this.rigidBodies_ = [];


        const box = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: '#F2630F', roughness: 0.5, metalness: 0 })
        );
        box.position.y = 5;
        box.position.x = 0;
        box.position.z = -3;
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);

        const rbBox = new RigidBody();
        rbBox.createBox(1, box.position, box.quaternion, new THREE.Vector3(1, 1, 1));
        rbBox.setRestitution(0.125);
        rbBox.setFriction(1);
        rbBox.setRollingFriction(5);
        this.physicsWorld_.addRigidBody(rbBox.body_);
        this.rigidBodies_.push({ mesh: box, rigidBody: rbBox });


        const stack = ["HTML", "CSS", "JavaScript"];
        let startXPos = -3;
        for (let i = 0; i < stack.length; i++){
            const loader = new FontLoader(loadingManager);
            const font = loader.load('../assets/fonts/Heebo Black_Regular.json');
            loader.load('../assets/fonts/Heebo Black_Regular.json', function(font){
                const textGeometry = new TextGeometry(stack[i], {
                    font: font,
                    size: .5,
                    depth: .05,
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
                text.position.y = .5;
                text.position.x = startXPos;
                text.position.z = 0;
                startXPos += (stack[i].length * .5);
                scene.add(text);

                const rbText = new RigidBody();
                rbText.createText(1, text.position, text.quaternion, new THREE.Vector3(1, 1, 1));
                rbText.setRestitution(0.125);
                rbText.setFriction(1);
                rbText.setRollingFriction(5);
                APP_.physicsWorld_.addRigidBody(rbText.body_);
                APP_.rigidBodies_.push({ mesh: text, rigidBody: rbText });
            });
            }
        
            const loader = new FontLoader(loadingManager);
            const font = loader.load('../assets/fonts/Heebo Black_Regular.json');
            loader.load('../assets/fonts/Heebo Black_Regular.json', function(font){
                const textGeometryTop = new TextGeometry('ET', {
                    font: font,
                    size: 2.2,
                    depth: 1,
                    curveSegments: .01,
                    bevelEnabled: true,
                    bevelThickness: .0022,
                    bevelSize: .001,
                    bevelOffset: 0,
                    bevelSegments: 1,
                });
                const textGeometryBottom = new TextGeometry('TECH', {
                    font: font,
                    size: 2.2,
                    depth: 1,
                    curveSegments: .01,
                    bevelEnabled: true,
                    bevelThickness: .0022,
                    bevelSize: .001,
                    bevelOffset: 0,
                    bevelSegments: 1,
                });
                const textMaterial = new THREE.MeshStandardMaterial({color: '#F2630F', roughness: 0.01, metalness: 0});
                const text = new THREE.Mesh(textGeometryTop, textMaterial);
                const textBottom = new THREE.Mesh(textGeometryBottom, textMaterial);
                textBottom.castShadow = true;
                textBottom.position.y = 0;
                textBottom.position.x = -10;
                textBottom.position.z = -5;
                textBottom.rotation.y = Math.PI / 5;
                scene.add(textBottom);
                text.castShadow = true;
                text.position.y = 2.2;
                text.position.x = -10;
                text.position.z = -5;
                text.rotation.y = Math.PI / 5;
                scene.add(text);
            });

            animate();
    }

    step_(timeElapsed){
        const timeElapsedS = timeElapsed * 0.001;

        this.countdown_ -= timeElapsedS;
        if (this.countdown_ < 0 && this.count_ < 10) {
          this.countdown_ = 0.25;
          this.count_ += 1;
          this.spawn_();
        }
    
        this.physicsWorld_.stepSimulation(timeElapsedS, 10);
    
        for (let i = 0; i < this.rigidBodies_.length; ++i) {
          this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
          const pos = this.tmpTransform_.getOrigin();
          const quat = this.tmpTransform_.getRotation();
          const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
          const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
    
          this.rigidBodies_[i].mesh.position.copy(pos3);
          this.rigidBodies_[i].mesh.quaternion.copy(quat3);
        }
    }


    //  addStack(){
    //     for (let i = 0; i < stack.length; i++){
    //         const loader = new FontLoader(loadingManager);
    //         const font = loader.load('../assets/fonts/Heebo Black_Regular.json');
    //         loader.load('../assets/fonts/Heebo Black_Regular.json', function(font){
    //             const textGeometry = new TextGeometry(stack[i], {
    //                 font: font,
    //                 size: .5,
    //                 depth: .05,
    //                 curveSegments: .01,
    //                 bevelEnabled: true,
    //                 bevelThickness: .0022,
    //                 bevelSize: .001,
    //                 bevelOffset: 0,
    //                 bevelSegments: 1,
    //             });
    //             const textMaterial = new THREE.MeshStandardMaterial({color: '#86DFDF', roughness: 0.01, metalness: 0});
    //             const text = new THREE.Mesh(textGeometry, textMaterial);
    //             text.castShadow = true;
    //             text.position.y = .5;
    //             text.position.x = this.startXPos;
    //             text.position.z = 0;
    //             startXPos += (stack[i].length * .5);
    //             scene.add(text);
    //         });
    //     }
    // }
    
    // addLogo(){
    //     const loader = new FontLoader(loadingManager);
    //     const font = loader.load('../assets/fonts/Heebo Black_Regular.json');
    //     loader.load('../assets/fonts/Heebo Black_Regular.json', function(font){
    //         const textGeometryTop = new TextGeometry('ET', {
    //             font: font,
    //             size: 2.2,
    //             depth: 1,
    //             curveSegments: .01,
    //             bevelEnabled: true,
    //             bevelThickness: .0022,
    //             bevelSize: .001,
    //             bevelOffset: 0,
    //             bevelSegments: 1,
    //         });
    //         const textGeometryBottom = new TextGeometry('TECH', {
    //             font: font,
    //             size: 2.2,
    //             depth: 1,
    //             curveSegments: .01,
    //             bevelEnabled: true,
    //             bevelThickness: .0022,
    //             bevelSize: .001,
    //             bevelOffset: 0,
    //             bevelSegments: 1,
    //         });
    //         const textMaterial = new THREE.MeshStandardMaterial({color: '#F2630F', roughness: 0.01, metalness: 0});
    //         const text = new THREE.Mesh(textGeometryTop, textMaterial);
    //         const textBottom = new THREE.Mesh(textGeometryBottom, textMaterial);
    //         textBottom.castShadow = true;
    //         textBottom.position.y = 0;
    //         textBottom.position.x = -10;
    //         textBottom.position.z = -5;
    //         textBottom.rotation.y = Math.PI / 5;
    //         scene.add(textBottom);
    //         text.castShadow = true;
    //         text.position.y = 2.2;
    //         text.position.x = -10;
    //         text.position.z = -5;
    //         text.rotation.y = Math.PI / 5;
    //         scene.add(text);
    //     });
    // }
}

