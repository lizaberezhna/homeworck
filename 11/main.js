import * as THREE from 'three';

const day = 24.0 * 60 * 60;
const AR_SCALE = 3e11;

const planetsData = [
    { radius: 0.015, dist: 0,         mass: 1.989e30, T: 0,       texture: '../assets/solar_system/2k_sun.jpg' },
    { radius: 0.003, dist: 57.910e9,  mass: 3.3011e23, T: 88,     texture: '../assets/solar_system/2k_mercury.jpg' },
    { radius: 0.005, dist: 108.21e9,  mass: 4.867e24,  T: 224.701, texture: '../assets/solar_system/2k_venus_atmosphere.jpg' },
    { radius: 0.005, dist: 149.598e9, mass: 5.972e24,  T: 365.256, texture: '../assets/solar_system/2k_earth_daymap.jpg' },
    { radius: 0.004, dist: 227.9e9,   mass: 6.4171e23, T: 687,    texture: '../assets/solar_system/2k_mars.jpg' },
    { radius: 0.012, dist: 778.5e9,   mass: 1.898e27,  T: 4333,   texture: '../assets/solar_system/2k_jupiter.jpg' },
    { radius: 0.010, dist: 1432e9,    mass: 5.683e26,  T: 10759,  texture: '../assets/solar_system/2k_saturn.jpg' },
    { radius: 0.007, dist: 2867e9,    mass: 8.681e25,  T: 30687,  texture: '../assets/solar_system/2k_uranus.jpg' },
    { radius: 0.007, dist: 4515e9,    mass: 1.024e26,  T: 60190,  texture: '../assets/solar_system/2k_neptune.jpg' }
];

document.addEventListener("DOMContentLoaded", () => {
    const initialize = async () => {
        const arButton = document.querySelector("#ar-button");
        const supported = navigator.xr && await navigator.xr.isSessionSupported("immersive-ar");

        if (!supported) {
            arButton.textContent = "WebXR не пiдтримується";
            arButton.disabled = true;
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        const solarSystemGroup = new THREE.Group();
        solarSystemGroup.position.set(0, -0.1, -0.4);
        scene.add(solarSystemGroup);

        const textureLoader = new THREE.TextureLoader();
        const planets = [];

        planetsData.forEach(data => {
            const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
            let material;
            
            if (data.T === 0) {
                material = new THREE.MeshBasicMaterial({ map: textureLoader.load(data.texture) });
            } else {
                material = new THREE.MeshStandardMaterial({ map: textureLoader.load(data.texture) });
            }

            const mesh = new THREE.Mesh(geometry, material);

            const planetPhysics = {
                mesh: mesh,
                mass: data.mass,
                pos: [data.dist, 0, 0],
                v: [0, 0, 0],
                a: [0, 0, 0]
            };

            const tSeconds = data.T * day;
            if (tSeconds !== 0) {
                planetPhysics.v[2] = 2 * Math.PI * data.dist / tSeconds;
            }

            mesh.position.set(planetPhysics.pos[0] / AR_SCALE, planetPhysics.pos[1] / AR_SCALE, planetPhysics.pos[2] / AR_SCALE);
            solarSystemGroup.add(mesh);
            planets.push(planetPhysics);
        });

        const updatePhysics = () => {
            const dt = day / 3; 
            const G = 6.67e-11;

            for (let i = 0; i < planets.length; i++) {
                let p_i = planets[i];
                p_i.a[0] = p_i.a[1] = p_i.a[2] = 0;

                for (let j = 0; j < planets.length; j++) {
                    let p_j = planets[j];
                    if (i !== j) {
                        let deltapos = [
                            p_j.pos[0] - p_i.pos[0],
                            p_j.pos[1] - p_i.pos[1],
                            p_j.pos[2] - p_i.pos[2]
                        ];

                        let r = Math.sqrt(Math.pow(deltapos[0], 2) + Math.pow(deltapos[1], 2) + Math.pow(deltapos[2], 2));
                        
                        if (r > 0) {
                            for (let k = 0; k < 3; k++) {
                                p_i.a[k] += G * p_j.mass * deltapos[k] / Math.pow(r, 3);
                            }
                        }
                    }
                }

                for (let k = 0; k < 3; k++) p_i.v[k] += p_i.a[k] * dt;
                for (let k = 0; k < 3; k++) p_i.pos[k] += p_i.v[k] * dt;

                p_i.mesh.position.set(p_i.pos[0] / AR_SCALE, p_i.pos[1] / AR_SCALE, p_i.pos[2] / AR_SCALE);
            }
        };

        renderer.xr.addEventListener("sessionstart", () => {
            console.log("Сесiю WebXR розпочато");
        });

        renderer.xr.addEventListener("sessionend", () => {
            console.log("Сесiю WebXR завершено");
        });

        let currentSession = null;
        
        const start = async () => {
            currentSession = await navigator.xr.requestSession(
                "immersive-ar", {
                    optionalFeatures: ["dom-overlay"],
                    domOverlay: { root: document.body }
                }
            );

            renderer.xr.enabled = true;
            renderer.xr.setReferenceSpaceType("local");

            await renderer.xr.setSession(currentSession);
            
            arButton.textContent = "Завершити сесiю WebXR";
            
            renderer.setAnimationLoop(() => {
                if (!currentSession) return;
                
                updatePhysics(); 
                
                renderer.render(scene, camera);
            });
        };

        const end = async () => {
            await currentSession.end();
            renderer.setAnimationLoop(null);
            renderer.clear();
            currentSession = null;
            renderer.xr.enabled = false;
            arButton.textContent = "Увiйти до WebXR";
        };

        arButton.addEventListener("click", () => {
            if (currentSession) {
                end();
            } else {
                start();
            }
        });
    }

    initialize();
});