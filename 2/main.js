import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", () => {

    const arScene = new MindARThree({
        container: document.body,
        imageTargetSrc: "../assets/cats.mind",
    });

    const renderer = arScene.renderer;
    const scene = arScene.scene;
    const camera = arScene.camera;

    const marker = arScene.addAnchor(0);

    const purpleCube = createCube();
    const greenSphere = createSphere();
    const pinkCone = createCone();

    marker.group.add(purpleCube);
    marker.group.add(greenSphere);
    marker.group.add(pinkCone);

    const startScene = async () => {
        await arScene.start();

        renderer.setAnimationLoop((time) => {
            rotateObjects(time, purpleCube, greenSphere, pinkCone);
            renderer.render(scene, camera);
        });
    };

    startScene();

});

function createCube() {
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    const cubeMaterial = new THREE.MeshBasicMaterial({
        color: "#7707d3"
    });

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-0.6, 0, 0);

    return cube;
}

function createSphere() {
    const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);

    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: "#00ff95"
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0.6, 0, 0);

    return sphere;
}

function createCone() {
    const coneGeometry = new THREE.ConeGeometry(0.3, 0.7, 32);

    const coneMaterial = new THREE.MeshBasicMaterial({
        color: "#ff0099"
    });

    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(0, 0.7, 0);

    return cone;
}

function rotateObjects(time, cube, sphere, cone) {
    cube.rotation.y = time / 1000;
    sphere.rotation.x = time / 1200;
    cone.rotation.z = time / 1400;
}
