import * as THREE from 'three';
import { UARButton } from 'webxr/UARButton';

document.addEventListener("DOMContentLoaded", () => {
    const initialize = async () => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
        light.position.set(0.5, 1, 0.25);
        scene.add(light);

        document.body.appendChild(UARButton.createButton(renderer, {
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.body }
        }));

        const rayGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        ]);
        const rayMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const rayLine = new THREE.Line(rayGeometry, rayMaterial);
        rayLine.name = "visualRay";
        rayLine.visible = false;

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });

        const preloadModels = async () => {
            const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
            const loader = new GLTFLoader();
            const modelSpecs = [
                { name: "hat", glbPath: "/assets/hat.gltf", scale: { x: 0.01, y: 0.01, z: 0.01 } },
                { name: "house", glbPath: "/assets/house.glb", scale: { x: 0.5, y: 0.5, z: 0.5 } },
                { name: "boat", glbPath: "/assets/ramona_steam_boat.glb", scale: { x: 0.0005, y: 0.0005, z: 0.0005 } }
            ];

            const promises = modelSpecs.map(spec => {
                return new Promise((resolve, reject) => {
                    loader.load(spec.glbPath, (gltf) => {
                        resolve({
                            scene: gltf.scene,
                            scale: spec.scale,
                            name: spec.name
                        });
                    }, undefined, (error) => {
                        console.error(`Помилка завантаження моделі ${spec.name}:`, error);
                        reject(error);
                    });
                });
            });

            return Promise.all(promises);
        };

        let preloadedModels = [];
        try {
            preloadedModels = await preloadModels();
            console.log("Усі моделі успішно завантажено");
        } catch (e) {
            console.error("Не вдалося завантажити деякі моделі", e);
        }

        function getRandomModelClone() {
            if (preloadedModels.length === 0) return null;
            const randomIndex = Math.floor(Math.random() * preloadedModels.length);
            const { scene: modelScene, scale, name } = preloadedModels[randomIndex];
            
            const clone = modelScene.clone(true);
            clone.scale.set(scale.x, scale.y, scale.z);
            console.log(`Клоновано модель: ${name}`);
            return clone;
        }

        const controller = renderer.xr.getController(0);
        controller.add(rayLine);
        scene.add(controller);

        controller.addEventListener('select', () => {
            console.log("Контролер активовано (дотик до екрану) - розміщуємо модель");

            const model = getRandomModelClone();
            if (!model) return;

            const position = new THREE.Vector3(0, 0, -0.5);
            position.applyMatrix4(controller.matrixWorld);
            model.position.copy(position);

            const rotation = new THREE.Quaternion();
            controller.matrixWorld.decompose(new THREE.Vector3(), rotation, new THREE.Vector3());
            model.quaternion.copy(rotation);

            scene.add(model);
        });

        renderer.xr.addEventListener("sessionstart", () => {
            console.log("Сесію WebXR розпочато");
            rayLine.visible = true;
        });

        renderer.xr.addEventListener("sessionend", () => {
            console.log("Сесію WebXR завершено");
            rayLine.visible = false;
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initialize();
});