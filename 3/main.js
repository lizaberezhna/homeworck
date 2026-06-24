import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", () => {

    const mindarThree = new MindARThree({
        container: document.body,
        imageTargetSrc: "../assets/card.mind",
    });

    const { renderer, scene, camera } = mindarThree;

    const anchor = mindarThree.addAnchor(0);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    const geometry1 = new THREE.BoxGeometry(1, 1, 1);

    const materials = [
        new THREE.MeshBasicMaterial({ map: textureLoader.load("../assets/unicorn.png") }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load("../assets/iodomarine.png") }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load("../assets/chashka.png") }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load("../assets/valery.jpg") }),
        new THREE.MeshBasicMaterial({ map: textureLoader.load("../assets/morda.png") })
    ];

    const cube = new THREE.Mesh(geometry1, materials);
    cube.position.set(0, 0, -1.5);


    const geometry2 = new THREE.CapsuleGeometry(0.5, 0.5, 10, 20);
    const material2 = new THREE.MeshBasicMaterial({ map: textureGitHub });

    const capsule = new THREE.Mesh(geometry2, material2);
    capsule.position.set(-2, 0, 0);


    const textureExternal = textureLoader.load(
        "https://i.imgur.com/UZWIaZk.jpeg"
    );

    const geometry3 = new THREE.CircleGeometry(0.7, 32);
    const material3 = new THREE.MeshBasicMaterial({
        map: textureExternal,
        side: THREE.DoubleSide // критично для кола
    });

    const circle = new THREE.Mesh(geometry3, material3);
    circle.position.set(1.2, 0, 0);

    // додаємо в anchor
    anchor.group.add(cube);
    anchor.group.add(capsule);
    anchor.group.add(circle);

    const start = async () => {
        await mindarThree.start();

        renderer.setAnimationLoop((time) => {

            cube.rotation.x = time / 2000;
            cube.rotation.y = time / 1000;

            const s = 0.3 * Math.sin(time / 1000) + 0.8;
            capsule.scale.set(s, s, s);

            circle.position.x = 1.2 + Math.sin(time / 1000) * 0.8;

            renderer.render(scene, camera);
        });
    };

    start();
});
