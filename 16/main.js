import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import * as faceapi from '@vladmandic/face-api';

const genderUA = {
    male: 'Чоловік',
    female: 'Жінка'
};

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

document.addEventListener('DOMContentLoaded', () => {

    const start = async () => {
        const ageEl = document.querySelector('#age');
        const genderEl = document.querySelector('#gender');
        const arLabelDiv = document.querySelector('#ar-label');

        try {
            ageEl.textContent = "Вік: завантаження ваг...";
            genderEl.textContent = "Стать: завантаження ваг...";
            
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
            
            console.log("Ізольовані моделі face-api успішно завантажено.");
            ageEl.textContent = "Вік: пошук обличчя...";
            genderEl.textContent = "Стать: пошук обличчя...";
        } catch (error) {
            console.error("Помилка завантаження моделей face-api:", error);
            ageEl.textContent = "Помилка ШІ";
            return;
        }

        const mindarThree = new MindARThree({
            container: document.body,
            uiScanning: 'yes',
            uiLoading: 'yes',
        });

        const { scene, cssScene, camera, renderer, cssRenderer } = mindarThree;

        const cssObj = new CSS3DObject(arLabelDiv);
        const anchor = mindarThree.addCSSAnchor(10); 
        anchor.group.add(cssObj);

        await mindarThree.start();
        const video = document.querySelector('video');

        let isDetecting = false;

        renderer.setAnimationLoop(async () => {
            if (!isDetecting && video && video.readyState >= 2) {
                isDetecting = true;

                faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
                    .withAgeAndGender()
                    .then((result) => {
                        if (result) {
                            const { age, gender, genderProbability } = result;
                            const roundedAge = Math.round(age);
                            const translatedGender = genderUA[gender] || gender;

                            ageEl.textContent = `Вік: ~${roundedAge} р.`;
                            genderEl.textContent = `Стать: ${translatedGender} (${(genderProbability * 100).toFixed(0)}%)`;

                            arLabelDiv.style.display = 'block';
                            arLabelDiv.textContent = `${translatedGender}, ${roundedAge} р.`;
                        } else {
                            arLabelDiv.style.display = 'none';
                        }
                    })
                    .catch((err) => {
                        console.error('Помилка обробки кадру face-api:', err);
                    })
                    .finally(() => {
                        isDetecting = false;
                    });
            }

            renderer.render(scene, camera);
            cssRenderer.render(cssScene, camera);
        });
    };

    start();
});