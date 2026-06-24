import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';

document.addEventListener("DOMContentLoaded", () => {

    const start = async() => {
        
        const mindarThree = new MindARThree({
            container: document.body,
            uiScanning: "yes",
            uiLoading: "yes",
        });

        const {scene, camera, renderer} = mindarThree;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directLight = new THREE.DirectionalLight(0xffffff, 1);
        directLight.position.set(0, 0, 1);
        scene.add(directLight);

        // Завантаження текстури маски з онлайн URL
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('https://raw.githubusercontent.com/your-repo/images/main/face.png');
        // Або використовуйте будь-яке інше онлайн зображення:
        // const texture = textureLoader.load('https://i.imgur.com/your-image.png');
        // const texture = textureLoader.load('https://cdn.jsdelivr.net/gh/your-repo/face.png');
        
        const faceMesh = mindarThree.addFaceMesh();
        faceMesh.material.map = texture;
        faceMesh.material.transparent = true;
        faceMesh.material.needsUpdate = true;
        scene.add(faceMesh);
        
        await mindarThree.start();

        renderer.setAnimationLoop(( time ) => {
            renderer.render(scene, camera);
        });
    }

    window.flipflop = () => {
        const video = document.querySelector("video");
        const button = document.querySelector("#flipflop");

        if (video.style.visibility === "hidden") {
            video.style.visibility = "visible";
            button.innerHTML = "Перейти до віртуальної реальності";
        } else {
            video.style.visibility = "hidden";
            button.innerHTML = "Перейти до доповненої реальності";
        }
    }

    start();
});
