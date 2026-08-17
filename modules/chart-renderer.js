/**
 * Chart Renderer Module
 * Uses pure HTML5 Canvas API without external libraries.
 * Includes fixed HiDPI scaling to prevent canvas layout expansion bugs.
 */

export function setupHiDPI(canvas) {
  const dpr = window.devicePixelRatio || 1;
  
  // Use client dimensions of parent container to strictly prevent layout growth
  const width = canvas.parentElement ? canvas.parentElement.clientWidth - 32 : (canvas.clientWidth || 300);
  const height = canvas.clientHeight || canvas.offsetHeight || 180;

  const targetWidth = Math.floor(width * dpr);
  const targetHeight = Math.floor(height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset scale matrix on every redraw
  ctx.scale(dpr, dpr);

  return { ctx, width, height };
}

export function clearCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
}

export function drawLineChart(canvas, dataSets, options = {}) {
  const { ctx, width, height } = setupHiDPI(canvas);
  clearCanvas(canvas);

  const yMax = options.yMax || 100;
  const yMin = options.yMin || 0;
  const padding = { top: 20, right: 20, bottom: 20, left: 35 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Draw Grid
  if (options.gridLines !== false) {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (graphHeight / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);

      ctx.fillStyle = '#8A8FA8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const labelValue = yMax - ((yMax - yMin) / 4) * i;
      ctx.fillText(Math.round(labelValue), padding.left - 8, y);
    }
    ctx.stroke();
  }

  // Draw Data Sets
  dataSets.forEach(set => {
    if (!set.data || set.data.length === 0) return;

    const xStep = graphWidth / (Math.max(1, set.data.length - 1));

    ctx.beginPath();

    set.data.forEach((point, index) => {
      const x = padding.left + index * xStep;
      const normalizedY = (point.y - yMin) / (yMax - yMin);
      const y = padding.top + graphHeight - (normalizedY * graphHeight);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = padding.left + (index - 1) * xStep;
        const prevNormalizedY = (set.data[index - 1].y - yMin) / (yMax - yMin);
        const prevY = padding.top + graphHeight - (prevNormalizedY * graphHeight);

        const cp1x = prevX + xStep / 2;
        const cp1y = prevY;
        const cp2x = prevX + xStep / 2;
        const cp2y = y;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
    });

    ctx.strokeStyle = set.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (set.fill) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      let rgb = '124, 92, 252';
      if (set.color === '#00E5C8') rgb = '0, 229, 200';
      if (set.color === '#7C5CFC') rgb = '124, 92, 252';

      gradient.addColorStop(0, `rgba(${rgb}, 0.25)`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);

      ctx.lineTo(padding.left + (set.data.length - 1) * xStep, padding.top + graphHeight);
      ctx.lineTo(padding.left, padding.top + graphHeight);
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.fill();
    }
  });
}
