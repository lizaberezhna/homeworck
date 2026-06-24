import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Онлайн URL моделей (можна використовувати будь-які публічні URL)
const MODEL_URLS = {
  // Приклад з GitHub або будь-якого CDN
  HAT: 'https://raw.githubusercontent.com/your-repo/models/main/hat.gltf',
  OCCLUDER: 'https://raw.githubusercontent.com/your-repo/models/main/headOccluder.glb',
  
  // Або використовуйте інші безкоштовні джерела:
  // HAT: 'https://threejs.org/examples/models/gltf/FlightHelmet/glTF/FlightHelmet.gltf',
  // HAT: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/models/gltf/FlightHelmet/glTF/FlightHelmet.gltf'
};

document.addEventListener("DOMContentLoaded", () => {
  initARExperience();
});

/**
 * Головна функція ініціалізації AR досвіду
 */
async function initARExperience() {
  try {
    // 1. Налаштування MindAR
    const mindarThree = setupMindAR();
    
    // 2. Налаштування сцени
    setupScene(mindarThree);
    
    // 3. Завантаження моделей
    await loadModels(mindarThree);
    
    // 4. Запуск AR
    await mindarThree.start();
    
    // 5. Запуск рендерингу
    startRenderLoop(mindarThree);
    
    // 6. Додаткові функції
    setupVideoToggle();
    
  } catch (error) {
    console.error('Помилка ініціалізації AR:', error);
  }
}

/**
 * Налаштування MindAR
 */
function setupMindAR() {
  return new MindARThree({
    container: document.body,
    uiLoading: 'no',
    uiScanning: 'no',
  });
}

/**
 * Налаштування сцени та освітлення
 */
function setupScene(mindarThree) {
  const { scene, renderer } = mindarThree;
  renderer.autoClear = false;
  setupLighting(scene);
}

/**
 * Налаштування освітлення
 */
function setupLighting(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directLight = new THREE.DirectionalLight(0xffffff, 1);
  directLight.position.set(0, 1, 1);
  scene.add(directLight);
  
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(0, -1, 0.5);
  scene.add(fillLight);
}

/**
 * Завантаження всіх 3D моделей
 */
async function loadModels(mindarThree) {
  const loader = new GLTFLoader();
  
  // Додаємо DRACO декодер (якщо потрібно)
  // const dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  // loader.setDRACOLoader(dracoLoader);
  
  // Завантажуємо моделі паралельно
  await Promise.all([
    loadOccluder(mindarThree, loader),
    loadHatFromURL(mindarThree, loader)
  ]);
}

/**
 * Завантаження оклюдера
 */
function loadOccluder(mindarThree, loader) {
  return new Promise((resolve, reject) => {
    // Можна також завантажити з URL
    const occluderURL = MODEL_URLS.OCCLUDER;
    
    loader.load(
      occluderURL,
      (gltf) => {
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
        
        resolve();
      },
      undefined,
      (error) => {
        console.error('Помилка завантаження оклюдера:', error);
        reject(error);
      }
    );
  });
}

/**
 * Завантаження капелюха з онлайн URL
 */
function loadHatFromURL(mindarThree, loader) {
  return new Promise((resolve, reject) => {
    // Використовуємо онлайн URL для капелюха
    const hatURL = MODEL_URLS.HAT;
    
    console.log('Завантаження капелюха з:', hatURL);
    
    loader.load(
      hatURL,
      (gltf) => {
        const hat = gltf.scene;
        
        // Налаштування матеріалів
        hat.traverse((child) => {
          if (child.isMesh) {
            child.material.depthTest = true;
            child.material.depthWrite = true;
            
            // Якщо потрібно змінити колір
            // child.material.color.setHex(0xff0000);
          }
        });
        
        hat.renderOrder = 1;
        
        const anchor = mindarThree.addAnchor(10);
        anchor.group.add(hat);
        
        // Позиціонуємо
        hat.position.set(0, 1.3, -0.7);
        hat.scale.set(0.5, 0.5, 0.5);
        hat.rotation.set(0, Math.PI, 0);
        
        console.log('Капелюх успішно завантажено');
        resolve();
      },
      (progress) => {
        // Відстеження прогресу завантаження
        const percent = (progress.loaded / progress.total * 100).toFixed(0);
        console.log(`Завантаження капелюха: ${percent}%`);
      },
      (error) => {
        console.error('Помилка завантаження капелюха:', error);
        // Якщо модель не завантажилась, створюємо просту геометрію
        createFallbackHat(mindarThree);
        resolve(); // Продовжуємо виконання
      }
    );
  });
}

/**
 * Створення простого капелюха як запасний варіант
 */
function createFallbackHat(mindarThree) {
  console.log('Створення простого капелюха як запасний варіант');
  
  const group = new THREE.Group();
  
  // Основа капелюха (циліндр)
  const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32);
  const baseMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8B4513,
    shininess: 30
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.15;
  group.add(base);
  
  // Верхня частина (конус)
  const topGeometry = new THREE.ConeGeometry(0.4, 0.5, 32);
  const topMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8B4513,
    shininess: 30
  });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 0.4;
  group.add(top);
  
  // Поля капелюха (тор)
  const brimGeometry = new THREE.TorusGeometry(0.6, 0.08, 16, 32);
  const brimMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x8B4513,
    shininess: 30
  });
  const brim = new THREE.Mesh(brimGeometry, brimMaterial);
  brim.position.y = 0.05;
  brim.rotation.x = Math.PI / 2;
  group.add(brim);
  
  const anchor = mindarThree.addAnchor(10);
  anchor.group.add(group);
  
  group.position.set(0, 1.3, -0.7);
  group.scale.set(0.5, 0.5, 0.5);
}

/**
 * Створення простого капелюха з геометрії (альтернативний метод)
 */
function createSimpleHat(mindarThree) {
  const hatGroup = new THREE.Group();
  
  // Використовуємо готові геометрії Three.js
  const geometries = {
    brim: new THREE.CylinderGeometry(0.7, 0.7, 0.05, 32),
    crown: new THREE.CylinderGeometry(0.4, 0.5, 0.4, 32),
    top: new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  };
  
  const material = new THREE.MeshPhongMaterial({
    color: 0x2c3e50,
    shininess: 50,
    specular: new THREE.Color(0x444444)
  });
  
  // Поля
  const brim = new THREE.Mesh(geometries.brim, material);
  brim.position.y = 0.025;
  hatGroup.add(brim);
  
  // Тулія
  const crown = new THREE.Mesh(geometries.crown, material);
  crown.position.y = 0.25;
  hatGroup.add(crown);
  
  // Верх
  const top = new THREE.Mesh(geometries.top, material);
  top.position.y = 0.45;
  top.scale.set(1, 0.5, 1);
  hatGroup.add(top);
  
  const anchor = mindarThree.addAnchor(10);
  anchor.group.add(hatGroup);
  
  hatGroup.position.set(0, 1.3, -0.7);
  hatGroup.scale.set(0.4, 0.4, 0.4);
}

/**
 * Запуск циклу рендерингу
 */
function startRenderLoop(mindarThree) {
  const { scene, camera, renderer } = mindarThree;
  
  renderer.setAnimationLoop(() => {
    renderer.clear();
    renderer.render(scene, camera);
  });
}

/**
 * Налаштування перемикання відео
 */
function setupVideoToggle() {
  window.toggleVideo = function() {
    const video = document.querySelector("video");
    if (!video) {
      console.warn('Відео елемент не знайдено');
      return;
    }
    
    video.style.visibility = 
      video.style.visibility === "hidden" ? "visible" : "hidden";
  };
  
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      window.toggleVideo();
    }
  });
}

export { initARExperience };
