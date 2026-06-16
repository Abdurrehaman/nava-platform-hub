/**
 * Chart Renderer Module
 * Uses pure HTML5 Canvas API without external libraries.
 */

export function setupHiDPI(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  
  return { ctx, width: rect.width, height: rect.height };
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
  const padding = { top: 20, right: 20, bottom: 20, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Draw Grid
  if (options.gridLines !== false) {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (graphHeight / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      
      // Y-axis labels
      ctx.fillStyle = '#8A8FA8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const labelValue = yMax - ((yMax - yMin) / 4) * i;
      ctx.fillText(Math.round(labelValue), padding.left - 10, y);
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
        // Simple smoothing
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
    
    // Stroke the line
    ctx.strokeStyle = set.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fill area below
    if (set.fill) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      
      // Convert hex to rgba for gradient
      let rgb = '0, 229, 200'; // Default to primary
      if (set.color === '#00E5C8') rgb = '0, 229, 200';
      if (set.color === '#7C5CFC') rgb = '124, 92, 252';
      
      gradient.addColorStop(0, `rgba(${rgb}, 0.2)`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);
      
      ctx.lineTo(padding.left + (set.data.length - 1) * xStep, padding.top + graphHeight);
      ctx.lineTo(padding.left, padding.top + graphHeight);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  });
}

export function drawRadialGauge(canvas, value, max, options = {}) {
  const { ctx, width, height } = setupHiDPI(canvas);
  clearCanvas(canvas);

  const cx = width / 2;
  const cy = height / 2 + 10;
  const radius = Math.min(width, height) / 2 - 15;
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const arcSpan = endAngle - startAngle;
  
  // Draw background track
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.strokeStyle = '#1a1d2e'; // dark bg
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Draw colored arc
  const ratio = Math.min(Math.max(value / max, 0), 1);
  const currentAngle = startAngle + (arcSpan * ratio);
  
  let color = options.color || '#00E5C8';
  if (options.warningThreshold && ratio > options.warningThreshold) color = '#f5b041'; // warning
  if (options.dangerThreshold && ratio > options.dangerThreshold) color = '#e74c3c'; // danger
  
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, currentAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // We handle the text in HTML usually, but we can draw it here if needed
}
