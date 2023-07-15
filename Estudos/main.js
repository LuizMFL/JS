import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function main() {
    const canvas = document.querySelector('#c');
    const view1Elem = document.querySelector('#view1');
    const view2Elem = document.querySelector('#view2');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.shadowMap.enabled = true;

    /*
    const fov = 45;
    const aspect = 2;
    const near = 5;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    */

    var left = -1;
    var right = 1;
    var top = 1;
    var bottom = -1;
    var near = 5;
    var far = 50;
    const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera.zoom = 0.1;

    camera.position.set(0, 10, 20);

    const cameraHelper = new THREE.CameraHelper(camera);

    const camera2 = new THREE.PerspectiveCamera(
        60,
        2,
        0.1,
        500,
    );
    camera2.position.set(40, 10, 30);
    camera2.lookAt(0, 5, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    scene.add(cameraHelper);


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
    {
        const cubeSize = 4;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
        scene.add(mesh);
    }

    {
        const sphereRadius = 3;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
        const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);

        camera.lookAt(mesh.position.x, mesh.position.y, mesh.position.z);
        scene.add(mesh);
    }
    {
        const loader = new GLTFLoader();
        loader.load('Flower.glb', function (gltf) {
            scene.add(gltf.scene);
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, function (error) {
            console.error(error);
        });

    }
    const luzes = new THREE.Object3D();
    scene.add(luzes);
    luzes.position.set(0, 0, 0);
    {
        for (let z = -2; z < 2; z++) {
            for (let x = -2; x < 2; x++) {
                let color = 0xFFFFFF;
                let intensity = 0.5;
                let light = new THREE.SpotLight(color, intensity);
                light.angle = Math.PI / 50;
                light.castShadow = false;
                light.position.set(0, 20, 0);
                light.target.position.set(x * 5, 0, z * 5);
                luzes.add(light);
                luzes.add(light.target);
                //const cameraHelper = new THREE.SpotLightHelper(light);
                //scene.add(cameraHelper);
            }
        }
        /*
        const color = 0xFFFFFF;
        const intensity = 1;
        //const light = new THREE.DirectionalLight(color, intensity);
        const light = new THREE.SpotLight(color, intensity);
        light.angle = Math.PI / 50;
        //const light = new THREE.PointLight(color, intensity);
        light.castShadow = true;
        light.position.set(0, 20, 0);
        light.target.position.set(0, 0, 0);
        luzes.add(light);
        luzes.add(light.target);
        //const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
        //const cameraHelper = new THREE.DirectionalLightHelper(light);
        const cameraHelper = new THREE.SpotLightHelper(light);
        //const cameraHelper = new THREE.PointLightHelper(light);
        scene.add(cameraHelper);
        */
    }

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

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        renderer.setScissorTest(true);
        {
            luzes.rotation.y += Math.PI / 100;
        }
        {
            const aspect = setScissorForElement(view1Elem);

            //camera.aspect = aspect;

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