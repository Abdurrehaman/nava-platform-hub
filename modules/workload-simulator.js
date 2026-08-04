/**
 * AI Workload & Quantization Simulator Module
 * Benchmarks vLLM, SGLang, TensorRT-LLM, FP8/AWQ Quantization & Speculative Decoding.
 */
import { drawLineChart, drawRadialGauge } from './chart-renderer.js';

let simulationInterval = null;
let simTime = 0;
let simConfig = {};
let historyGPU = [];
let historyNet = [];
let currentCost = 0;

export function initSimulator() {
  const runBtn = document.getElementById('sim-run-btn');
  if (runBtn) runBtn.addEventListener('click', startSimulation);
  
  const tweakBtn = document.getElementById('sim-tweak-btn');
  if (tweakBtn) tweakBtn.addEventListener('click', () => {
    stopSimulation();
    document.getElementById('sim-display').classList.add('hidden');
    document.getElementById('sim-config').classList.remove('hidden');
  });
  
  const deployBtn = document.getElementById('sim-deploy-btn');
  if (deployBtn) deployBtn.addEventListener('click', deployFromSimulator);
  
  const gpuCount = document.getElementById('sim-gpu-count');
  const gpuCountVal = document.getElementById('sim-gpu-count-val');
  if (gpuCount && gpuCountVal) {
    gpuCount.addEventListener('input', () => gpuCountVal.textContent = gpuCount.value);
  }
  
  const dataset = document.getElementById('sim-dataset-size');
  const datasetVal = document.getElementById('sim-dataset-val');
  if (dataset && datasetVal) {
    dataset.addEventListener('input', () => datasetVal.textContent = `${dataset.value} GB`);
  }
}

function startSimulation() {
  document.getElementById('sim-config').classList.add('hidden');
  document.getElementById('sim-display').classList.remove('hidden');
  
  const typeEl = document.getElementById('sim-workload-type');
  const engineEl = document.getElementById('sim-engine');
  const quantEl = document.getElementById('sim-quantization');
  const specEl = document.getElementById('sim-speculative');
  const gpuEl = document.getElementById('sim-gpu-type');
  const countEl = document.getElementById('sim-gpu-count');
  
  simConfig = {
    type: typeEl ? typeEl.value : 'llm-finetune',
    engine: engineEl ? engineEl.value : 'vllm',
    quantization: quantEl ? quantEl.value : 'fp8',
    speculative: specEl ? specEl.value : 'eagle',
    gpu: gpuEl ? gpuEl.value : 'h100',
    gpuCount: countEl ? parseInt(countEl.value) : 4,
  };
  
  simTime = 0;
  historyGPU = [];
  historyNet = [];
  currentCost = 0;
  
  const alertsEl = document.getElementById('sim-alerts');
  const recsEl = document.getElementById('sim-recommendations');
  if (alertsEl) alertsEl.innerHTML = '';
  if (recsEl) recsEl.classList.add('hidden');
  
  document.getElementById('sim-progress-text').textContent = `Initializing ${simConfig.engine.toUpperCase()} runtime...`;
  
  if (simulationInterval) clearInterval(simulationInterval);
  simulationInterval = setInterval(simulationTick, 100);
}

function stopSimulation() {
  if (simulationInterval) clearInterval(simulationInterval);
}

function simulationTick() {
  simTime++;
  const maxTicks = 150;
  const progress = Math.min(100, (simTime / maxTicks) * 100);
  
  document.getElementById('sim-progress-fill').style.width = `${progress}%`;
  
  const stage = getStage(progress);
  document.getElementById('sim-progress-text').textContent = stage.text;
  
  let utilTarget = stage.utilTarget;
  let vramTarget = stage.vramTarget;
  let netTarget = stage.netTarget;
  
  // Quantization VRAM reduction
  if (simConfig.quantization === 'fp8') vramTarget *= 0.65;
  if (simConfig.quantization === 'awq') vramTarget *= 0.45;

  const util = Math.max(0, Math.min(100, utilTarget + (Math.random() - 0.5) * 10));
  const vram = Math.max(0, Math.min(100, vramTarget + (Math.random() - 0.5) * 5));
  const net = Math.max(0, netTarget + (Math.random() - 0.5) * 20);
  
  historyGPU.push({ x: simTime, y: util });
  historyNet.push({ x: simTime, y: Math.min(100, net / 4) });
  
  if (historyGPU.length > 50) historyGPU.shift();
  if (historyNet.length > 50) historyNet.shift();
  
  const gpuPrices = { h100: 3.50, a100: 2.10, b200: 5.20, l40s: 1.40 };
  const hourlyRate = (gpuPrices[simConfig.gpu] || 3.50) * simConfig.gpuCount;
  currentCost += (hourlyRate * 0.5); 
  
  updateDisplay(util, vram, net);
  
  if (simTime === 60) triggerBottleneck();
  
  if (simTime >= maxTicks) {
    stopSimulation();
    document.getElementById('sim-progress-text').textContent = 'Benchmark Complete';
    showRecommendations();
  }
}

function getStage(progress) {
  if (progress < 15) return { text: `Loading ${simConfig.quantization.toUpperCase()} Model Weights into ${simConfig.engine.toUpperCase()} KV-Cache...`, utilTarget: 20, vramTarget: 40, netTarget: 200 };
  if (progress < 40) return { text: `Warmup & PagedAttention Cache Allocation...`, utilTarget: 65, vramTarget: 60, netTarget: 350 };
  if (progress < 85) return { text: `Serving Inference Prompts (${simConfig.speculative !== 'disabled' ? 'Speculative EAGLE Draft Engine Active' : 'Standard Decoding'})...`, utilTarget: 96, vramTarget: 75, netTarget: 480 };
  return { text: 'Saving Telemetry Metrics...', utilTarget: 15, vramTarget: 20, netTarget: 100 };
}

function updateDisplay(util, vram, net) {
  document.getElementById('sim-gpu-util').textContent = `${util.toFixed(1)}%`;
  
  const vramMax = simConfig.gpu === 'b200' ? 192 : 80;
  const vramUsed = (vram / 100) * vramMax;
  document.getElementById('sim-vram-label').textContent = `${vramUsed.toFixed(1)} / ${vramMax} GB`;
  
  document.getElementById('sim-net-throughput').textContent = `${net.toFixed(0)} Gbps`;
  document.getElementById('sim-cost-ticker').textContent = `$${currentCost.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  
  const estTotal = currentCost * 2.5;
  document.getElementById('sim-est-total').textContent = `Est. Total: ~$${estTotal.toLocaleString(undefined, {maximumFractionDigits:0})}`;
  document.getElementById('sim-est-time').textContent = `Est. Time: ${(8 + Math.random()*3).toFixed(1)}h`;
  
  const gpuCanvas = document.getElementById('sim-gpu-chart');
  const netCanvas = document.getElementById('sim-network-chart');
  const gaugeCanvas = document.getElementById('sim-vram-gauge');
  
  if (gpuCanvas) {
    drawLineChart(gpuCanvas, [{ data: historyGPU, color: '#00E5C8', fill: true }], { gridLines: false });
  }
  if (netCanvas) {
    drawLineChart(netCanvas, [{ data: historyNet, color: '#7C5CFC', fill: true }], { gridLines: false });
  }
  if (gaugeCanvas) {
    drawRadialGauge(gaugeCanvas, vram, 100, { color: '#7C5CFC', warningThreshold: 0.85, dangerThreshold: 0.95 });
  }
}

function triggerBottleneck() {
  const alertsEl = document.getElementById('sim-alerts');
  if (!alertsEl) return;
  
  let alert = `
    <div class="sim-alert success">
      <div class="sim-alert-icon">⚡</div>
      <div class="sim-alert-text">
        <strong>${simConfig.engine.toUpperCase()} + ${simConfig.quantization.toUpperCase()} Optimized</strong>
        KV-Cache memory pressure reduced by 48%. Speculative Decoding (${simConfig.speculative.toUpperCase()}) boosting throughput by 2.4x.
      </div>
    </div>
  `;
  alertsEl.innerHTML = alert;
}

function showRecommendations() {
  const recsEl = document.getElementById('sim-recommendations');
  const listEl = document.getElementById('sim-rec-list');
  if (!recsEl || !listEl) return;
  
  let recs = `
    <div class="sim-rec-item">
      <div class="sim-rec-icon">🏆</div>
      <div class="sim-rec-text">
        <strong>Deploy with FP8 Quantization + EAGLE Speculative Decoding</strong>
        Saves 52% VRAM memory while increasing Tokens/sec from 92 → 220 t/s.
        <span class="sim-rec-impact">Reduces monthly cloud cost by ~$3,400.</span>
      </div>
    </div>
  `;
  
  listEl.innerHTML = recs;
  recsEl.classList.remove('hidden');
}

function deployFromSimulator() {
  window.dispatchEvent(new CustomEvent('nava:deploy', {
    detail: {
      name: `simulated-${simConfig.type}`,
      model: `NVIDIA ${simConfig.gpu.toUpperCase()}`,
      gpuCount: simConfig.gpuCount
    }
  }));
  
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('nav-dashboard').classList.add('active');
  
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-dashboard').classList.add('active');
  
  stopSimulation();
  document.getElementById('sim-display').classList.add('hidden');
  document.getElementById('sim-config').classList.remove('hidden');
}
