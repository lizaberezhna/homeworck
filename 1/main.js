import * as THREE from 'three';

let scene;
let camera;
let renderer;
let cube;
let video;

init();

function init() {
    createScene();
    createCamera();
    createRenderer();
    createCube();
    createVideoBackground();

    window.addEventListener('resize', onWindowResize);

    renderer.setAnimationLoop(animate);
}

function createScene() {
    scene = new THREE.Scene();
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    camera.position.set(1, 1, 5);
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(renderer.domElement);
}

function createCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        color: 0xe72e15
    });

    cube = new THREE.Mesh(geometry, material);

    cube.position.set(0, 0, 0);
    cube.rotation.set(0, Math.PI / 2, 0);

    scene.add(cube);
}

function createVideoBackground() {
    video = document.createElement('video');

    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    document.body.prepend(video);

    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment'
        },
        audio: false
    })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error('Не вдалося отримати доступ до камери:', error);
    });
}

function animate(time) {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}