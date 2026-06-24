import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MindARThree} from 'mindar-image-three';

let isStarted = false;
let mindarThree = null;
let renderer = null;

document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector("#win2");

    const start = async() => {
        mindarThree = new MindARThree({
            container: container,
            imageTargetSrc: "../assets/targets.mind",
            maxTrack: 2,
            uiScanning: "no",
            uiLoading: "no",
        });

        ({renderer} = mindarThree);
        const {scene, camera} = mindarThree;

        const anchor1 = mindarThree.addAnchor(0);

        const textureLoader = new THREE.TextureLoader();

        const geometry1 = new THREE.BoxGeometry(1, 1, 1);
        const materials = [
            new THREE.MeshBasicMaterial({map: textureLoader.load("../assets/unicorn.png"), transparent: true, opacity: 0.7}),
            new THREE.MeshBasicMaterial({map: textureLoader.load("../assets/micky.jpg")}),
            new THREE.MeshBasicMaterial({map: textureLoader.load("../assets/iodomarine.png")}),
            new THREE.MeshBasicMaterial({map: textureLoader.load("../assets/chashka.png")}),
            new THREE.MeshBasicMaterial({map: textureLoader.load("../assets/valery.jpg"), color: 0xff0000}),
            new THREE.MeshBasicMaterial({map: textureLoader.load("../assets/morda.png")})
        ];
        const cube = new THREE.Mesh(geometry1, materials);

        cube.position.set(0, 0, -2);
        cube.rotation.set(0, Math.PI/4, 0);

        const pictureTexture = textureLoader.load("https://raw.githubusercontent.com/ssemerikov/SR_Im-25/refs/heads/main/assets/micky.jpg");

        const geometry2 = new THREE.CapsuleGeometry( 0.2, 1, 10, 20, 1 );
        const material2 = new THREE.MeshBasicMaterial({map: pictureTexture});
        const capsule = new THREE.Mesh(geometry2, material2);
        capsule.position.set(-1, 0, 0);

        const pictureTexture2 = textureLoader.load("../assets/unicorn.png");

        const geometry3= new THREE.CircleGeometry( 1, 32, 0, Math.PI);
        const material3 = new THREE.MeshBasicMaterial({map: pictureTexture2});
        const circle = new THREE.Mesh(geometry3, material3);

        circle.position.set(1, 0, 0);

        anchor1.group.add(cube);
        anchor1.group.add(capsule);
        anchor1.group.add(circle);

        
        const anchor2 = mindarThree.addAnchor(1);

        const gltfLoader = new GLTFLoader();
        gltfLoader.load("../assets/house.glb", (gltf) => {
            const house = gltf.scene;
            house.scale.set(0.5, 0.5, 0.5);
            house.position.set(0, -0.3, 0);
            anchor2.group.add(house);
        });

        const saucer = new THREE.Mesh(
            new THREE.TorusGeometry(0.6, 0.08, 8, 32),
            new THREE.MeshBasicMaterial({color: 0xf5f5dc})
        );
        saucer.rotation.x = -Math.PI / 2;
        saucer.position.set(0, 1, 0);
        anchor2.group.add(saucer);

        const steamMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.3});
        const steam1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), steamMaterial);
        const steam2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), steamMaterial.clone());
        const steam3 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), steamMaterial.clone());
        steam1.position.set(-0.05, 0.3, 0);
        steam2.position.set(0.05, 0.5, 0);
        steam3.position.set(0, 0.7, 0);
        anchor2.group.add(steam1, steam2, steam3);

        const scanOverlay = document.createElement("div");
        scanOverlay.id = "scanOverlay";
        scanOverlay.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center;gap:20px;z-index:10;pointer-events:none;";

        const createMarkerImg = (src) => {
            const img = document.createElement("img");
            img.src = src;
            img.style.cssText = "width:40%;max-width:200px;opacity:0.5;animation:markerFlip 3s ease-in-out infinite;";
            return img;
        };

        scanOverlay.appendChild(createMarkerImg("../assets/cats.png"));
        scanOverlay.appendChild(createMarkerImg("../assets/chashka.png"));
        container.appendChild(scanOverlay);

        const removeScanOverlay = () => {
            if (scanOverlay.parentNode) scanOverlay.parentNode.removeChild(scanOverlay);
        };
        anchor1.onTargetFound = removeScanOverlay;
        anchor2.onTargetFound = removeScanOverlay;

        await mindarThree.start();
        renderer.setAnimationLoop(( time ) => {

            cube.rotation.x = time / 2000;
            cube.rotation.y = time / 1000;

            capsule.scale.setScalar(0.5*Math.sin(time/1000) + 0.5,
                        0.5*Math.sin(time/1000) + 0.5,
                        0.5*Math.sin(time/1000) + 0.5);

            circle.position.z = -(2*Math.sin(time/1000)+2);

            steam1.position.y = 0.3 + 0.2 * Math.sin(time / 800);
            steam2.position.y = 0.5 + 0.2 * Math.sin(time / 900 + 1);
            steam3.position.y = 0.7 + 0.2 * Math.sin(time / 700 + 2);
            steam1.material.opacity = 0.15 + 0.15 * Math.sin(time / 600);
            steam2.material.opacity = 0.15 + 0.15 * Math.sin(time / 700 + 1);
            steam3.material.opacity = 0.15 + 0.15 * Math.sin(time / 500 + 2);
            saucer.rotation.z = time / 3000;

            renderer.render(scene, camera);
        });
    }

    const stop = () => {
        renderer.setAnimationLoop(null);
        mindarThree.stop();
        renderer.dispose();

        const video = container.querySelector("video");
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        document.querySelectorAll(".mindar-ui-overlay").forEach(el => el.remove());

        mindarThree = null;
        renderer = null;
    }

    const button = document.querySelector("#startButton");
    button.addEventListener("click", () => {
        if(!isStarted) {
            start();
            isStarted = true;
            button.textContent = "Зупинити WebAR";
        }
        else {
            stop();
            isStarted = false;
            button.textContent = "Запустити WebAR";
        }
    });
});
