import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener("DOMContentLoaded", () => {

    const start = async() => {
        
        const mindarThree = new MindARThree({
            container: document.body,
            uiScanning: "yes",
            uiLoading: "yes",
        });

        const {scene, camera, renderer} = mindarThree;

        renderer.autoClear = false;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directLight = new THREE.DirectionalLight(0xffffff, 1);
        directLight.position.set(0, 1, 1);
        scene.add(directLight);

        // Додаткове світло для кращого освітлення
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(0, 0, -1);
        scene.add(backLight);

        const loader = new GLTFLoader();

        // Завантаження оклюдера
        loader.load('../assets/headOccluder.glb', (gltf) => {
            const occluder = gltf.scene;
            occluder.traverse((node) => {
                if (node.isMesh) {
                    node.material.colorWrite = false;
                    node.material.depthWrite = true;
                }
            });
            occluder.renderOrder = 0;

            const anchor = mindarThree.addAnchor(168);
            anchor.group.add(occluder);
            occluder.position.set(0, -0.3, 0.15);
            occluder.scale.set(0.065, 0.065, 0.065);
        }, undefined, (error) => {
            console.error('Помилка завантаження оклюдера:', error);
        });

        // Завантаження капелюха з онлайн URL
        loader.load(
            'https://threejs.org/examples/models/gltf/FlightHelmet/glTF/FlightHelmet.gltf',
            (gltf) => {
                console.log('Капелюх завантажено успішно!');
                const hat = gltf.scene;
                
                // Налаштування матеріалів
                hat.traverse((child) => {
                    if (child.isMesh) {
                        child.material.depthTest = true;
                        child.material.depthWrite = true;
                        // Додаємо для кращої видимості
                        child.material.needsUpdate = true;
                    }
                });

                hat.renderOrder = 1;

                const anchor = mindarThree.addAnchor(10);
                anchor.group.add(hat);

                // Позиціонуємо капелюх
                hat.position.set(0, 1.3, -0.7);
                hat.scale.set(0.5, 0.5, 0.5);
                hat.rotation.set(0, Math.PI, 0);

                console.log('Капелюх додано до сцени');
            },
            (progress) => {
                console.log(`Завантаження капелюха: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
            },
            (error) => {
                console.error('Помилка завантаження капелюха:', error);
                // Створюємо простий капелюх як запасний варіант
                createFallbackHat(mindarThree);
            }
        );

        await mindarThree.start();

        renderer.setAnimationLoop(() => {
            renderer.clear();
            renderer.render(scene, camera);
        });
    }

    // Функція створення запасного капелюха
    function createFallbackHat(mindarThree) {
        console.log('Створення запасного капелюха з геометрії');
        
        const hatGroup = new THREE.Group();
        
        // Матеріал капелюха
        const material = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 50,
            specular: new THREE.Color(0x444444)
        });
        
        // Поля капелюха
        const brimGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.05, 32);
        const brim = new THREE.Mesh(brimGeometry, material);
        brim.position.y = 0.025;
        hatGroup.add(brim);
        
        // Тулія (основна частина)
        const crownGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.4, 32);
        const crown = new THREE.Mesh(crownGeometry, material);
        crown.position.y = 0.25;
        hatGroup.add(crown);
        
        // Верхня частина
        const topGeometry = new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const top = new THREE.Mesh(topGeometry, material);
        top.position.y = 0.45;
        top.scale.set(1, 0.5, 1);
        hatGroup.add(top);
        
        // Додаємо до сцени
        const anchor = mindarThree.addAnchor(10);
        anchor.group.add(hatGroup);
        
        hatGroup.position.set(0, 1.3, -0.7);
        hatGroup.scale.set(0.4, 0.4, 0.4);
    }

    window.flipflop = () => {
        const video = document.querySelector("video");
        const button = document.querySelector("#flipflop");

        if (!video) return;

        if (video.style.visibility === "hidden") {
            video.style.visibility = "visible";
            if (button) button.innerHTML = "Перейти до віртуальної реальності";
        } else {
            video.style.visibility = "hidden";
            if (button) button.innerHTML = "Перейти до доповненої реальності";
        }
    }

    start();
});
