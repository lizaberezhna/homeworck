import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

let mindarThree;
let renderer;
let scene;
let camera;
let markerAnchor;

let cube;
let capsule;
let circle;

const LOCAL_TEXTURES = [
    '../assets/unicorn.png',
    '../assets/micky.jpg',
    '../assets/iodomarine.png',
    '../assets/chashka.png',
    '../assets/valery.jpg',
    '../assets/morda.png'
];

const GITHUB_TEXTURE =
    'https://raw.githubusercontent.com/ssemerikov/SR_Im-25/refs/heads/main/assets/micky.jpg';

const EXTERNAL_TEXTURE =
    'https://i.imgur.com/UZWIaZk.jpeg';

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');

init();

async function init() {
    setupARScene();
    createMarkerAnchor();
    createTexturedCube();
    createTexturedCapsule();
    createTexturedCircle();
    addObjectsToAnchor();

    await startScene();
}

function setupARScene() {
    mindarThree = new MindARThree({
        container: document.body,
        imageTargetSrc: '../assets/cats.mind'
    });

    renderer = mindarThree.renderer;
    scene = mindarThree.scene;
    camera = mindarThree.camera;
}

function createMarkerAnchor() {
    markerAnchor = mindarThree.addAnchor(0);
}

function loadTexture(path) {
    return textureLoader.load(path);
}

function createTexturedCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const cubeMaterials = LOCAL_TEXTURES.map((texturePath) => {
        return new THREE.MeshBasicMaterial({
            map: loadTexture(texturePath)
        });
    });

    cube = new THREE.Mesh(geometry, cubeMaterials);
    cube.position.set(0, 0, -1.5);
}

function createTexturedCapsule() {
    const geometry = new THREE.CapsuleGeometry(0.5, 0.5, 10, 20);

    const material = new THREE.MeshBasicMaterial({
        map: loadTexture(GITHUB_TEXTURE)
    });

    capsule = new THREE.Mesh(geometry, material);
    capsule.position.set(-2, 0, 0);
}

function createTexturedCircle() {
    const geometry = new THREE.CircleGeometry(0.7, 32);

    const material = new THREE.MeshBasicMaterial({
        map: loadTexture(EXTERNAL_TEXTURE),
        side: THREE.DoubleSide
    });

    circle = new THREE.Mesh(geometry, material);
    circle.position.set(1.2, 0, 0);
}

function addObjectsToAnchor() {
    markerAnchor.group.add(cube);
    markerAnchor.group.add(capsule);
    markerAnchor.group.add(circle);
}

async function startScene() {
    await mindarThree.start();

    renderer.setAnimationLoop((time) => {
        updateAnimation(time);
        renderer.render(scene, camera);
    });
}

function updateAnimation(time) {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;

    const scaleValue = 0.3 * Math.sin(time / 1000) + 0.8;
    capsule.scale.set(scaleValue, scaleValue, scaleValue);

    circle.position.x = 1.2 + Math.sin(time / 1000) * 0.8;
}
