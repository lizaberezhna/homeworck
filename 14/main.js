const MODEL_URL = "./my_model/";
let model, webcam, labelContainer, maxPredictions;
let presidentTextElement;
let currentPresidentName = "Сканування...";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-btn").addEventListener("click", initApp);
    presidentTextElement = document.getElementById("president-text");
});

async function initApp() {
    document.getElementById("overlay-start").style.display = "none";
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "Завантаження ШІ моделі...";

    model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
    maxPredictions = model.getTotalClasses();

    const width = window.innerWidth;
    const height = window.innerHeight;

    webcam = new tmImage.Webcam(width, height, false); 
    
    await webcam.setup({ facingMode: "environment" }); 
    await webcam.play();
    
    const container = document.getElementById("webcam-container");
    container.appendChild(webcam.canvas);

    const videoElement = container.querySelector('video');
    if (videoElement) {
        videoElement.style.width = "100vw";
        videoElement.style.height = "100vh";
        videoElement.style.objectFit = "cover";
    }

    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    window.requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    let highestProb = 0;
    let bestMatchClass = "Сканування...";

    for (let i = 0; i < maxPredictions; i++) {
        const prob = prediction[i].probability;
        labelContainer.childNodes[i].innerHTML = `${prediction[i].className}: ${(prob * 100).toFixed(0)}%`;

        if (prob > highestProb) {
            highestProb = prob;
            bestMatchClass = prediction[i].className;
        }
    }

    if (highestProb > 0.80) {
        if (currentPresidentName !== bestMatchClass) {
            currentPresidentName = bestMatchClass;
            presidentTextElement.innerHTML = currentPresidentName;
        }
    } else {
        if (currentPresidentName !== "Сканування...") {
            currentPresidentName = "Сканування...";
            presidentTextElement.innerHTML = currentPresidentName;
        }
    }
}

window.addEventListener('resize', () => {
    if (webcam && webcam.canvas) {
        webcam.canvas.style.width = "100vw";
        webcam.canvas.style.height = "100vh";
    }
});