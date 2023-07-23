import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

async function loadGLTFModel(url) {
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
                camera.lookAt(model.position);
                console.log(model);
                resolve(model);
            },
            undefined,
            (error) => {
                reject(error);
            }
        );
    });
}

async function main(scene) {
    var model = await loadGLTFModel("../Models/Arvores.glb");
    scene.add(model);
    return;
}