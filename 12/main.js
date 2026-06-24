import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

let camera, scene, renderer;
let mesh;

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate); 
    renderer.xr.enabled = true; 
    container.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer));

    const geometry = new THREE.TorusKnotGeometry(0.1, 0.03, 100, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ffcc, 
        roughness: 0.3,
        metalness: 0.8 
    });
    mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(0, 0, -0.5);
    scene.add(mesh);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(timestamp, frame) {
    if (mesh) {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}