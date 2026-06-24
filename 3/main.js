import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", async () => {

    const arSystem = new MindARThree({
        container: document.body,
        imageTargetSrc: "../assets/cats.mind"
    });

    const renderer = arSystem.renderer;
    const scene = arSystem.scene;
    const camera = arSystem.camera;

    const targetAnchor = arSystem.addAnchor(0);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    // ---------- Куб ----------

    const cubeTextures = [
        new THREE.MeshBasicMaterial({ map: loader.load("../assets/unicorn.png") }),
        new THREE.MeshBasicMaterial({ map: loader.load("../assets/micky.jpg") }),
        new THREE.MeshBasicMaterial({ map: loader.load("../assets/iodomarine.png") }),
        new THREE.MeshBasicMaterial({ map: loader.load("../assets/chashka.png") }),
        new THREE.MeshBasicMaterial({ map: loader.load("../assets/valery.jpg") }),
        new THREE.MeshBasicMaterial({ map: loader.load("../assets/morda.png") })
    ];

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

    const texturedCube = new THREE.Mesh(
        cubeGeometry,
        cubeTextures
    );

    texturedCube.position.set(0, 0, -1.5);

    // ---------- Циліндр ----------

    const cylinderTexture = loader.load("../assets/micky.jpg");

    const cylinderGeometry = new THREE.CylinderGeometry(
        0.4,
        0.4,
        1.2,
        32
    );

    const cylinderMaterial = new THREE.MeshBasicMaterial({
        map: cylinderTexture
    });

    const texturedCylinder = new THREE.Mesh(
        cylinderGeometry,
        cylinderMaterial
    );

    texturedCylinder.position.set(-2, 0, 0);

    // ---------- Коло ----------

    const circleTexture = loader.load(
        "https://i.imgur.com/UZWIaZk.jpeg"
    );

    const circleGeometry = new THREE.CircleGeometry(
        0.7,
        32
    );

    const circleMaterial = new THREE.MeshBasicMaterial({
        map: circleTexture,
        side: THREE.DoubleSide
    });

    const texturedCircle = new THREE.Mesh(
        circleGeometry,
        circleMaterial
    );

    texturedCircle.position.set(1.2, 0, 0);

    // ---------- Додавання до маркера ----------

    targetAnchor.group.add(texturedCube);
    targetAnchor.group.add(texturedCylinder);
    targetAnchor.group.add(texturedCircle);

    // ---------- Запуск AR ----------

    await arSystem.start();

    renderer.setAnimationLoop((time) => {

        // обертання куба
        texturedCube.rotation.x = time * 0.0005;
        texturedCube.rotation.y = time * 0.001;

        // зміна масштабу циліндра
        const scaleFactor = 0.8 + 0.3 * Math.sin(time * 0.001);

        texturedCylinder.scale.set(
            scaleFactor,
            scaleFactor,
            scaleFactor
        );

        // рух кола
        texturedCircle.position.x =
            1.2 + Math.sin(time * 0.001) * 0.8;

        renderer.render(scene, camera);
    });

});
