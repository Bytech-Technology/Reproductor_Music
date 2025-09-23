// visualizer.js
/**
 * Módulo para inicializar y dibujar el visualizador de audio
 */

let analyser, bufferLength, dataArray, ctx, canvas;
let animationId = null;

/**
 * Inicializa el visualizador con el elemento <audio>
 */
export function initVisualizer(audio) {
  canvas = document.getElementById("visualizer");
  if (!canvas || !(window.AudioContext || window.webkitAudioContext)) {
    console.warn("[DEBUG] visualizer: canvas o Web Audio API no disponible");
    return;
  }

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    ctx = canvas.getContext("2d");

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    startDrawing();
  } catch (err) {
    console.warn("[DEBUG] visualizer: No se pudo crear AudioContext/analyser:", err);
  }
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function startDrawing() {
  if (!analyser || !ctx) return;

  function draw() {
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const numBars = 12;
    const barWidth = canvas.width / numBars;
    const binsPerBar = Math.floor(bufferLength / numBars);
    let x = 0;

    for (let i = 0; i < numBars; i++) {
      let sum = 0;
      for (let j = 0; j < binsPerBar; j++) {
        sum += dataArray[(i * binsPerBar) + j];
      }
      const avg = sum / binsPerBar;
      const barHeight = avg / 2;
      const y = canvas.height - barHeight;
      const radius = Math.min(barWidth / 2, barHeight / 2);

      roundedRect(ctx, x, y, barWidth, barHeight, radius);
      ctx.fillStyle = "#E886AC";
      ctx.fill();

      x += barWidth + 5;
    }
  }

  draw();
}

/**
 * Dibuja un rectángulo con bordes redondeados
 */
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Limpia el loop de animación
 */
export function stopVisualizer() {
  if (animationId) cancelAnimationFrame(animationId);
}
