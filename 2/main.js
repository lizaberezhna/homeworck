import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", () => {

    const mindarThree = new MindARThree({
        container: document.body,
        imageTargetSrc: "../assets/cats.mind",
    });

    const { renderer, scene, camera } = mindarThree;

    const anchor = mindarThree.addAnchor(0);

    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshBasicMaterial({ color: "#7707d3" })
    );
    cube.position.set(-0.6, 0, 0);

    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 32, 32),
        new THREE.MeshBasicMaterial({ color: "#00ff95" })
    );
    sphere.position.set(0.6, 0, 0);

    const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.7, 32),
        new THREE.MeshBasicMaterial({ color: "#ff0099" })
    );
    cone.position.set(0, 0.7, 0);

    anchor.group.add(cube);
    anchor.group.add(sphere);
    anchor.group.add(cone);

    const start = async () => {
        await mindarThree.start();

        renderer.setAnimationLoop((time) => {
            cube.rotation.y = time / 1000;
            sphere.rotation.x = time / 1200;
            cone.rotation.z = time / 1400;

            renderer.render(scene, camera);
        });
    };

    start();
});