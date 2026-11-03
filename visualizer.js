// visualizer.js
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

let audioCtx = null;
let analyser = null;
let dataArray = null;
let bufferLength = 0;

export function setupAudioContext(audioElement) {
    if (audioCtx) return;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    
    const source = audioCtx.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    analyser.fftSize = 64;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    drawVisualizer();
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    if (!analyser) return;
    
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 1.1;
    let barHeight, x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 7;
        canvasCtx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.25 + (barHeight / 35), 0.85)})`;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, canvas.height - barHeight, barWidth - 3, barHeight, 2);
        canvasCtx.fill();
        x += barWidth;
    }
}
