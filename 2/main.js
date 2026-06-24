import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

let mindarThree;
let renderer;
let scene;
let camera;

let cube;
let sphere;
let cone;

init();

async function init() {
    createMindARScene();
    createObjects();
    addObjectsToMarker();

    await startAR();
}

function createMindARScene() {
    mindarThree = new MindARThree({
        container: document.body,
        imageTargetSrc: '../assets/cats.mind'
    });

    renderer = mindarThree.renderer;
    scene = mindarThree.scene;
    camera = mindarThree.camera;
}

function createObjects() {
    cube = createCube();
    sphere = createSphere();
    cone = createCone();
}

function createCube() {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({
        color: 0x7707d3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-0.6, 0, 0);

    return mesh;
}

function createSphere() {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff95
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0.6, 0, 0);

    return mesh;
}

function createCone() {
    const geometry = new THREE.ConeGeometry(0.3, 0.7, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0099
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0.7, 0);

    return mesh;
}

function addObjectsToMarker() {
    const markerAnchor = mindarThree.addAnchor(0);

    markerAnchor.group.add(cube);
    markerAnchor.group.add(sphere);
    markerAnchor.group.add(cone);
}

async function startAR() {
    await mindarThree.start();

    renderer.setAnimationLoop((time) => {
        animateObjects(time);
        renderer.render(scene, camera);
    });
}

function animateObjects(time) {
    cube.rotation.y = time / 1000;
    sphere.rotation.x = time / 1200;
    cone.rotation.z = time / 1400;
}
