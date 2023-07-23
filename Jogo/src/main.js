import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { CharacterControls } from './CharacterControls.js';
import * as CANNON from 'cannon-es';

async function loadGLTFModel(url, camera, char) {
    return new Promise((resolve, reject) => {
        const loaderGLTF = new GLTFLoader();
        loaderGLTF.load(
            url,
            (gltf) => {
                var model = gltf.scene;
                model.traverse(function (object) {
                    if (object.isMesh) object.castShadow = true;
                });
                var gltfAnimations = gltf.animations;
                var mixer = new THREE.AnimationMixer(model);
                var animationsMap = new Map();
                gltfAnimations.filter(a => a.name != 'TPose').forEach(a => {
                    animationsMap.set(a.name, mixer.clipAction(a));
                });
                console.log(model)
                if (char) {
                    camera.lookAt(model.position);
                    var characterControls = new CharacterControls(model, mixer, animationsMap, camera, 'Idle');
                    resolve(characterControls);
                }
                else {
                    for (var child of model.children) {
                        console.log(child.name);
                    }
                    resolve(model);
                }
            },
            undefined,
            (error) => {
                reject(error);
            }
        );
    });
}

async function main() {
    const canvas = document.querySelector('#c');
    const view1Elem = document.querySelector('#game');
    const view2Elem = document.querySelector('#map');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    // CAMERA
    const fov = 45;
    const aspect = 2;
    const near = 5;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 15, 36);

    const cameraHelper = new THREE.CameraHelper(camera);
    scene.add(cameraHelper);

    // MAP
    const camera2 = new THREE.PerspectiveCamera(60, 2, 0.1, 500,);
    camera2.position.set(40, 10, 30);
    camera2.lookAt(0, 5, 0);

    // PLANO
    {
        const planeSize = 2000;

        const loader = new THREE.TextureLoader();
        const texture = loader.load('../Texture/terra.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = 10;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);

        const planeMat = new THREE.MeshPhongMaterial({
            map: texture
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    // LUZES
    {
        let color = 0xFFFFFF;
        let intensity = 0.8;
        let light = new THREE.DirectionalLight(color, intensity);
        light.castShadow = true;
        light.position.set(0, 50, 100);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        scene.add(light.target);
        var d = 500;
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;
        light.shadow.bias = -0.001;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 500;

    }

    // MODEL
    var characterControls = await loadGLTFModel("../Models/Soldier.glb", camera, true);
    var arvore = await loadGLTFModel("../Models/Arvores.glb", camera, false);


    scene.add(characterControls.model);
    scene.add(arvore);
    var object = scene.getObjectByName("tree002");
    object.position.set(0, 0, -10);
    object = scene.getObjectByName("tree003");
    object.position.set(3, 0, -7);
    object = scene.getObjectByName("tree004");
    object.position.set(30, 0, -10);
    object = scene.getObjectByName("tree005");
    object.position.set(10, 0, 5);
    object = scene.getObjectByName("tree006");
    object.position.set(-4, 0, -5);
    object = scene.getObjectByName("tree007");
    object.position.set(-7, 0, -2);
    object = scene.getObjectByName("tree008");
    object.position.set(23, 0, 9);
    object = scene.getObjectByName("tree009");
    object.position.set(30, 0, -45);
    object = scene.getObjectByName("tree010");
    object.position.set(37, 0, -20);
    object = scene.getObjectByName("tree011");
    object.position.set(42, 0, 12);
    object = scene.getObjectByName("tree012");
    object.position.set(50, 0, 16);
    object = scene.getObjectByName("tree013");
    object.position.set(60, 0, -32);
    object = scene.getObjectByName("tree014");
    object.position.set(62, 0, -35);
    object = scene.getObjectByName("tree015");
    object.position.set(64, 0, 25);
    object = scene.getObjectByName("tree016");
    object.position.set(70, 0, 10);
    object = scene.getObjectByName("tree017");
    object.position.set(76, 0, -8);

    // Arbustos
    object = scene.getObjectByName("bush001");
    object.position.set(75, 0, -7);
    object = scene.getObjectByName("bush002");
    object.position.set(5, 0, 10);
    object = scene.getObjectByName("bush003");
    object.position.set(27, 0, -30);
    object = scene.getObjectByName("bush004");
    object.position.set(40, 0, 10);
    object = scene.getObjectByName("bush005");
    object.position.set(42, 0, 5);
    object = scene.getObjectByName("bush007");
    object.position.set(60, 0, -34);
    object = scene.getObjectByName("bush008");
    object.position.set(69, 0, -10);

    // Arvores secas e podres:
    object = scene.getObjectByName("tree001");
    object.position.set(100, 0, -63);
    object = scene.getObjectByName("tree018");
    object.position.set(107, 0, -58);
    object = scene.getObjectByName("tree022");
    object.position.set(115, 0, -47);
    object = scene.getObjectByName("tree023");
    object.position.set(130, 0, -55);
    // Arvores Fora de scena
    object = scene.getObjectByName("tree019");
    scene.remove(object);
    object = scene.getObjectByName("tree020");
    scene.remove(object);
    console.log(object);
    //scene.add(characterControls.cubeMesh);
    // CANNON-ES
    const physicsWorld = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0), });
    const groundBody = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane(), });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(groundBody);

    const radius = 1;
    const sphereBody = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(radius), });
    sphereBody.position.set(5, 10, 0);
    sphereBody.material = new CANNON.Material();
    physicsWorld.addBody(sphereBody);


    const geometry = new THREE.SphereGeometry(radius);
    const material = new THREE.MeshNormalMaterial();
    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    physicsWorld.addBody(characterControls.box);

    // CANNON DEBUGGER
    //const cannonDebugger = new CannonDebugger(scene, physicsWorld, {});
    // INPUT
    var keyPressed = {};
    document.addEventListener("keydown", (event) => {
        if (event.shiftKey && characterControls) {
            characterControls.switchRunToggle();
        } else {
            keyPressed[event.key.toLowerCase()] = true;
        }

    }, false);

    document.addEventListener("keyup", (event) => {
        keyPressed[event.key.toLowerCase()] = false;
    }, false);

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
            document.body.appendChild(renderer.domElement);
        }
        return needResize;
    }

    function setScissorForElement(elem) {
        const canvasRect = canvas.getBoundingClientRect();
        const elemRect = elem.getBoundingClientRect();

        const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
        const left = Math.max(0, elemRect.left - canvasRect.left);
        const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
        const top = Math.max(0, elemRect.top - canvasRect.top);

        const width = Math.min(canvasRect.width, right - left);
        const height = Math.min(canvasRect.height, bottom - top);

        const positiveYUpBottom = canvasRect.height - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        return width / height;
    }

    const clock = new THREE.Clock();
    function render() {
        physicsWorld.fixedStep();
        sphereMesh.position.copy(sphereBody.position);
        sphereMesh.quaternion.copy(sphereBody.quaternion);

        let mixerUpdateDelta = clock.getDelta();
        if (characterControls) {
            characterControls.update(mixerUpdateDelta, keyPressed);
        }
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.setScissorTest(true);
        {
            const aspect = setScissorForElement(view1Elem);

            camera.left = -aspect;
            camera.right = aspect;

            camera.updateProjectionMatrix();
            cameraHelper.update();

            cameraHelper.visible = false;

            scene.background.set(0x000000);

            renderer.render(scene, camera);
        }
        {
            const aspect = setScissorForElement(view2Elem);

            camera2.aspect = aspect;
            camera2.updateProjectionMatrix();

            cameraHelper.visible = true;

            scene.background.set(0x000040);

            renderer.render(scene, camera2);
        }


        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();