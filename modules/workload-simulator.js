/**
 * AI Workload Simulator Module
 * The unique 4th pillar feature for Nava Platform Hub.
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
  
  // Range sliders update labels
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
  const gpuEl = document.getElementById('sim-gpu-type');
  const countEl = document.getElementById('sim-gpu-count');
  const datasetEl = document.getElementById('sim-dataset-size');
  const storageEl = document.getElementById('sim-storage');
  
  simConfig = {
    type: typeEl ? typeEl.value : 'llm-finetune',
    gpu: gpuEl ? gpuEl.value : 'h100',
    gpuCount: countEl ? parseInt(countEl.value) : 4,
    datasetGB: datasetEl ? parseInt(datasetEl.value) : 500,
    storageGB: storageEl ? parseInt(storageEl.value) : 2000
  };
  
  // Reset state
  simTime = 0;
  historyGPU = [];
  historyNet = [];
  currentCost = 0;
  
  const alertsEl = document.getElementById('sim-alerts');
  const recsEl = document.getElementById('sim-recommendations');
  if (alertsEl) alertsEl.innerHTML = '';
  if (recsEl) recsEl.classList.add('hidden');
  
  document.getElementById('sim-progress-text').textContent = 'Initializing cluster...';
  
  if (simulationInterval) clearInterval(simulationInterval);
  simulationInterval = setInterval(simulationTick, 100); // 10 ticks per second
}

function stopSimulation() {
  if (simulationInterval) clearInterval(simulationInterval);
}

function simulationTick() {
  simTime++;
  const maxTicks = 150; // 15 seconds total duration
  const progress = Math.min(100, (simTime / maxTicks) * 100);
  
  document.getElementById('sim-progress-fill').style.width = `${progress}%`;
  
  const stage = getStage(progress);
  document.getElementById('sim-progress-text').textContent = stage.text;
  
  // Generate metrics based on stage
  let utilTarget = stage.utilTarget;
  let vramTarget = stage.vramTarget;
  let netTarget = stage.netTarget;
  
  // Apply random noise
  const util = Math.max(0, Math.min(100, utilTarget + (Math.random() - 0.5) * 10));
  const vram = Math.max(0, Math.min(100, vramTarget + (Math.random() - 0.5) * 5));
  const net = Math.max(0, netTarget + (Math.random() - 0.5) * 20);
  
  historyGPU.push({ x: simTime, y: util });
  historyNet.push({ x: simTime, y: Math.min(100, net / 4) }); // scale down for 0-100 chart
  
  if (historyGPU.length > 50) historyGPU.shift();
  if (historyNet.length > 50) historyNet.shift();
  
  // Cost accumulator
  const gpuPrices = { h100: 3.50, a100: 2.10, b200: 5.20, l40s: 1.40 };
  const hourlyRate = (gpuPrices[simConfig.gpu] || 3.50) * simConfig.gpuCount;
  // accelerate cost drastically for visual effect (tick represents hours)
  currentCost += (hourlyRate * 0.5); 
  
  updateDisplay(util, vram, net);
  
  // Triggers
  if (simTime === 60) triggerBottleneck();
  
  if (simTime >= maxTicks) {
    stopSimulation();
    document.getElementById('sim-progress-text').textContent = 'Simulation Complete';
    showRecommendations();
  }
}

function getStage(progress) {
  if (progress < 10) return { text: 'Provisioning Nodes & Storage (9AC, 9PB)...', utilTarget: 5, vramTarget: 2, netTarget: 10 };
  if (progress < 25) return { text: 'Loading Dataset into Memory...', utilTarget: 15, vramTarget: 40, netTarget: 380 };
  if (progress < 40) return { text: 'Epoch 1/10: Warmup...', utilTarget: 60, vramTarget: 75, netTarget: 120 };
  if (progress < 85) return { text: 'Epoch 2-9: Deep Training Phase...', utilTarget: 95, vramTarget: 92, netTarget: 250 };
  if (progress < 95) return { text: 'Epoch 10: Finalizing & Checkpointing...', utilTarget: 100, vramTarget: 94, netTarget: 400 };
  return { text: 'Saving Model Artifacts...', utilTarget: 10, vramTarget: 10, netTarget: 300 };
}

function updateDisplay(util, vram, net) {
  document.getElementById('sim-gpu-util').textContent = `${util.toFixed(1)}%`;
  
  const vramMax = simConfig.gpu === 'b200' ? 192 : 80;
  const vramUsed = (vram / 100) * vramMax;
  document.getElementById('sim-vram-label').textContent = `${vramUsed.toFixed(1)} / ${vramMax} GB`;
  
  document.getElementById('sim-net-throughput').textContent = `${net.toFixed(0)} Gbps`;
  
  document.getElementById('sim-cost-ticker').textContent = `$${currentCost.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  
  const estTotal = currentCost * 2.5; // fake projection
  document.getElementById('sim-est-total').textContent = `Est. Total: ~$${estTotal.toLocaleString(undefined, {maximumFractionDigits:0})}`;
  document.getElementById('sim-est-time').textContent = `Est. Time: ${(12 + Math.random()*4).toFixed(1)}h`;
  
  // Render charts
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
  
  // Deterministic bottleneck based on config
  let alert = '';
  
  if (simConfig.gpu === 'h100' && simConfig.datasetGB > 1000 && simConfig.storageGB <= 2000) {
    alert = `
      <div class="sim-alert danger">
        <div class="sim-alert-icon">⚠️</div>
        <div class="sim-alert-text">
          <strong>I/O Bottleneck Detected</strong>
          Data loading from 9PB is 2.4x slower than H100 compute capacity. GPUs are starved for data.
        </div>
      </div>
    `;
  } else if (simConfig.gpuCount > 16) {
    alert = `
      <div class="sim-alert warning">
        <div class="sim-alert-icon">⚡</div>
        <div class="sim-alert-text">
          <strong>Network Fabric Congestion</strong>
          High latency across ${simConfig.gpuCount} nodes during gradient synchronization.
        </div>
      </div>
    `;
  } else if (simConfig.gpu === 'l40s' && simConfig.type.includes('llm')) {
    alert = `
      <div class="sim-alert danger">
        <div class="sim-alert-icon">🔥</div>
        <div class="sim-alert-text">
          <strong>VRAM OOM Risk</strong>
          LLM training memory footprint exceeds L40S limits (48GB). High risk of OutOfMemory crashes.
        </div>
      </div>
    `;
  } else {
    alert = `
      <div class="sim-alert success">
        <div class="sim-alert-icon">✅</div>
        <div class="sim-alert-text">
          <strong>Architecture Optimal</strong>
          Compute, memory, and storage I/O are perfectly balanced for this workload.
        </div>
      </div>
    `;
  }
  
  alertsEl.innerHTML = alert;
}

function showRecommendations() {
  const recsEl = document.getElementById('sim-recommendations');
  const listEl = document.getElementById('sim-rec-list');
  if (!recsEl || !listEl) return;
  
  let recs = '';
  
  if (simConfig.gpu === 'h100' && simConfig.storageGB <= 2000) {
    recs += `
      <div class="sim-rec-item">
        <div class="sim-rec-icon">💡</div>
        <div class="sim-rec-text">
          <strong>Upgrade to Atomic Object Store (9AO)</strong>
          Using 9AO with parallel pipelines will eliminate the I/O bottleneck and keep your H100s at 99% utilization.
          <span class="sim-rec-impact">Saves ~14% total training time.</span>
        </div>
      </div>
    `;
  } else if (simConfig.gpu === 'l40s' && simConfig.type.includes('llm')) {
    recs += `
      <div class="sim-rec-item">
        <div class="sim-rec-icon">💡</div>
        <div class="sim-rec-text">
          <strong>Switch to A100 80GB</strong>
          The 80GB VRAM is required for this model size. Using L40S will result in failure.
          <span class="sim-rec-impact">Prevents complete failure.</span>
        </div>
      </div>
    `;
  } else {
    recs += `
      <div class="sim-rec-item">
        <div class="sim-rec-icon">🏆</div>
        <div class="sim-rec-text">
          <strong>Use Spot Capacity (Flex Reservations)</strong>
          This workload supports checkpointing. Switching to preemptible capacity can slash costs.
          <span class="sim-rec-impact">Saves ~$4,200 on total run.</span>
        </div>
      </div>
    `;
  }
  
  listEl.innerHTML = recs;
  recsEl.classList.remove('hidden');
}

function deployFromSimulator() {
  // Fire event to switch tabs and deploy
  window.dispatchEvent(new CustomEvent('nava:deploy', {
    detail: {
      name: `simulated-${simConfig.type}`,
      model: `NVIDIA ${simConfig.gpu.toUpperCase()}`,
      gpuCount: simConfig.gpuCount
    }
  }));
  
  // Switch to dashboard
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('nav-dashboard').classList.add('active');
  
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-dashboard').classList.add('active');
  
  // Reset simulator
  stopSimulation();
  document.getElementById('sim-display').classList.add('hidden');
  document.getElementById('sim-config').classList.remove('hidden');
}
