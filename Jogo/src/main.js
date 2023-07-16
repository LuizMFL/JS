import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CharacterControls } from './CharacterControls.js';
//import * as CANNON from '../cannon-es';

function main() {
    const canvas = document.querySelector('#c');
    const view1Elem = document.querySelector('#game');
    const view2Elem = document.querySelector('#map');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.shadowMap.enabled = true;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    // CAMERA
    const fov = 45;
    const aspect = 2;
    const near = 5;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 5, 12);

    const cameraHelper = new THREE.CameraHelper(camera);
    scene.add(cameraHelper);

    // MAP
    const camera2 = new THREE.PerspectiveCamera(60, 2, 0.1, 500,);
    camera2.position.set(40, 10, 30);
    camera2.lookAt(0, 5, 0);

    // PLANO
    {
        const planeSize = 40;

        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.receiveShadow = true;
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    // LUZES
    {
        let color = 0xFFFFFF;
        let intensity = 0.5;
        let light = new THREE.DirectionalLight(color, intensity);
        light.castShadow = true;
        light.position.set(0, 10000, 0);

        light.target.position.set(0, 0, 0);
        scene.add(light);
        scene.add(light.target);
        light = new THREE.SpotLight(color, intensity);
        light.angle = Math.PI / 2;
        light.castShadow = false;
        light.position.set(0, 10, 100);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }

    // MODEL
    var characterControls;
    {
        var loaderGLTF = new GLTFLoader();
        loaderGLTF.load(
            "../Models/Soldier.glb",
            function (gltf) {
                let model = gltf.scene;
                model.traverse(function (object) {
                    if (object.isMesh) object.castShadow = true;
                });
                scene.add(model);
                var gltfAnimations = gltf.animations;
                var mixer = new THREE.AnimationMixer(model);
                var animationsMap = new Map();
                gltfAnimations.filter(a => a.name != 'TPose').forEach(a => {
                    animationsMap.set(a.name, mixer.clipAction(a));
                });
                characterControls = new CharacterControls(model, mixer, animationsMap, camera, 'Idle');
                camera.lookAt(model.position.x, model.position.y + 2, model.position.z);

            },
            undefined, // We don't need this function
            function (error) {
                console.error(error);
            }
        );
    }

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