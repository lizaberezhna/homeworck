import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener("DOMContentLoaded", () => {

  const start = async () => {

    const mindarThree = new MindARThree({
      container: document.body,
    });

    const { scene, camera, renderer } = mindarThree;

    renderer.autoClear = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(0xffffff, 1);
    directLight.position.set(0, 1, 1);
    scene.add(directLight);

    const loader = new GLTFLoader();

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
    });

    // Завантаження капелюха з онлайн URL
    loader.load('https://threejs.org/examples/models/gltf/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {

      const hat = gltf.scene;

      hat.traverse((child) => {
        if (child.isMesh) {
          child.material.depthTest = true;
          child.material.depthWrite = true;
        }
      });

      hat.renderOrder = 1;

      const anchor = mindarThree.addAnchor(10);
      anchor.group.add(hat);

      hat.position.set(0, 1.3, -0.7);
      hat.scale.set(0.5, 0.5, 0.5);
      hat.rotation.set(0, Math.PI, 0);
    });

    await mindarThree.start();

    renderer.setAnimationLoop(() => {
      renderer.clear();
      renderer.render(scene, camera);
    });
  };

  start();

  window.flipflop = () => {
    const video = document.querySelector("video");
    if (!video) return;

    video.style.visibility =
      video.style.visibility === "hidden" ? "visible" : "hidden";
  };

});
