/**
 * Dashboard Module — Renders GPU fleet, K8s clusters, charts, and activity feed
 */
import { generateGPUFleet, generateK8sClusters, generateActivityFeed, generateStatsData, updateMetrics, generateTimeSeriesData } from './data-simulator.js';
import { drawLineChart, setupHiDPI } from './chart-renderer.js';

let gpuFleet = [];
let k8sClusters = [];
let activityFeed = [];
let computeHistory = [];
let networkHistory = [];
let updateInterval = null;

const MAX_HISTORY = 60;

/**
 * Initialize the dashboard with simulated data
 */
export function initDashboard() {
  gpuFleet = generateGPUFleet(6);
  k8sClusters = generateK8sClusters();
  activityFeed = generateActivityFeed();

  // Initialize chart history
  computeHistory = generateTimeSeriesData(MAX_HISTORY, 65, 15);
  networkHistory = generateTimeSeriesData(MAX_HISTORY, 450, 100);

  renderStats();
  renderGPUFleet();
  renderK8sClusters();
  renderActivityFeed();
  renderCharts();

  // Start live updates
  updateInterval = setInterval(updateDashboard, 2000);

  // Listen for deploy events from AI assistant
  window.addEventListener('nava:deploy', handleDeploy);

  // Provision button
  const provBtn = document.getElementById('provision-btn');
  if (provBtn) provBtn.addEventListener('click', openProvisionModal);

  // Modal handlers
  const provCancel = document.getElementById('prov-cancel');
  const provDeploy = document.getElementById('prov-deploy');
  const provNodes = document.getElementById('prov-nodes');
  if (provCancel) provCancel.addEventListener('click', closeProvisionModal);
  if (provDeploy) provDeploy.addEventListener('click', deployFromModal);
  if (provNodes) provNodes.addEventListener('input', () => {
    document.getElementById('prov-nodes-val').textContent = provNodes.value;
  });
}

function updateDashboard() {
  updateMetrics(gpuFleet);
  updateGPUCards();
  updateChartData();
  renderCharts();
  
  // Occasionally add activity
  if (Math.random() < 0.15) {
    addRandomActivity();
  }
}

/** Render top stats row */
function renderStats() {
  const stats = generateStatsData();
  const container = document.getElementById('stats-row');
  if (!container) return;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total GPUs</div>
      <div class="stat-value gradient">${stats.totalGPUs}</div>
      <div class="stat-change up">↑ ${stats.activeGPUs} active</div>
      <div class="stat-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M10 14h4v4h-4zm8 0h4v4h-4z" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active VMs</div>
      <div class="stat-value gradient">${stats.totalVMs}</div>
      <div class="stat-change up">↑ 12 today</div>
      <div class="stat-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" stroke-width="2"/><path d="M10 10h12M10 14h8M10 18h10" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Network</div>
      <div class="stat-value gradient">${stats.networkThroughput}</div>
      <div class="stat-change up">↑ 3.2% from yesterday</div>
      <div class="stat-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 24l7-8 5 4 5-6 7-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Uptime</div>
      <div class="stat-value gradient">${stats.uptimePercent}%</div>
      <div class="stat-change up">↑ 30-day SLA met</div>
      <div class="stat-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2"/><path d="M12 16l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
  `;
}

/** Render GPU Fleet cards */
function renderGPUFleet() {
  const container = document.getElementById('gpu-fleet');
  if (!container) return;

  container.innerHTML = gpuFleet.map((gpu, i) => `
    <div class="gpu-card" id="gpu-card-${i}" style="animation-delay: ${i * 0.08}s">
      <div class="gpu-card-header">
        <span class="gpu-name">${gpu.name}</span>
        <span class="gpu-status ${gpu.status}">${gpu.status}</span>
      </div>
      <div class="gpu-model">${gpu.model}</div>
      <div class="gpu-metrics">
        <div class="gpu-metric">
          <span class="gpu-metric-label">Util</span>
          <div class="gpu-metric-bar"><div class="gpu-metric-fill util" style="width: ${gpu.utilization}%"></div></div>
          <span class="gpu-metric-val" id="gpu-util-${i}">${gpu.utilization}%</span>
        </div>
        <div class="gpu-metric">
          <span class="gpu-metric-label">VRAM</span>
          <div class="gpu-metric-bar"><div class="gpu-metric-fill vram" style="width: ${(gpu.vram / gpu.vramTotal * 100).toFixed(0)}%"></div></div>
          <span class="gpu-metric-val" id="gpu-vram-${i}">${gpu.vram.toFixed(1)} GB</span>
        </div>
        <div class="gpu-metric">
          <span class="gpu-metric-label">Temp</span>
          <div class="gpu-metric-bar"><div class="gpu-metric-fill temp" style="width: ${(gpu.temperature / 100 * 100).toFixed(0)}%"></div></div>
          <span class="gpu-metric-val" id="gpu-temp-${i}">${gpu.temperature}°C</span>
        </div>
        <div class="gpu-metric">
          <span class="gpu-metric-label">Power</span>
          <div class="gpu-metric-bar"><div class="gpu-metric-fill power" style="width: ${(gpu.power / gpu.powerMax * 100).toFixed(0)}%"></div></div>
          <span class="gpu-metric-val" id="gpu-power-${i}">${gpu.power}W</span>
        </div>
      </div>
    </div>
  `).join('');
}

/** Update GPU card values without re-rendering the full DOM */
function updateGPUCards() {
  gpuFleet.forEach((gpu, i) => {
    const card = document.getElementById(`gpu-card-${i}`);
    if (!card) return;

    const utilBar = card.querySelector('.gpu-metric-fill.util');
    const vramBar = card.querySelector('.gpu-metric-fill.vram');
    const tempBar = card.querySelector('.gpu-metric-fill.temp');
    const powerBar = card.querySelector('.gpu-metric-fill.power');

    if (utilBar) utilBar.style.width = `${gpu.utilization}%`;
    if (vramBar) vramBar.style.width = `${(gpu.vram / gpu.vramTotal * 100).toFixed(0)}%`;
    if (tempBar) tempBar.style.width = `${(gpu.temperature / 100 * 100).toFixed(0)}%`;
    if (powerBar) powerBar.style.width = `${(gpu.power / gpu.powerMax * 100).toFixed(0)}%`;

    const utilVal = document.getElementById(`gpu-util-${i}`);
    const vramVal = document.getElementById(`gpu-vram-${i}`);
    const tempVal = document.getElementById(`gpu-temp-${i}`);
    const powerVal = document.getElementById(`gpu-power-${i}`);

    if (utilVal) utilVal.textContent = `${gpu.utilization}%`;
    if (vramVal) vramVal.textContent = `${gpu.vram.toFixed(1)} GB`;
    if (tempVal) tempVal.textContent = `${gpu.temperature}°C`;
    if (powerVal) powerVal.textContent = `${gpu.power}W`;
  });
}

/** Render K8s Clusters */
function renderK8sClusters() {
  const container = document.getElementById('k8s-clusters');
  if (!container) return;

  container.innerHTML = k8sClusters.map(cluster => `
    <div class="k8s-item">
      <div class="k8s-icon">☸️</div>
      <div class="k8s-info">
        <div class="k8s-name">${cluster.name}</div>
        <div class="k8s-meta">${cluster.nodes} nodes · ${cluster.pods.running} pods running · ${cluster.region}</div>
      </div>
      <span class="k8s-status-badge">${cluster.status}</span>
    </div>
  `).join('');
}

/** Render Activity Feed */
function renderActivityFeed() {
  const container = document.getElementById('activity-feed');
  if (!container) return;

  container.innerHTML = activityFeed.map(item => `
    <div class="activity-item ${item.type}">
      <span class="activity-time">${item.time}</span>
      <span class="activity-text">${item.text}</span>
    </div>
  `).join('');
}

function addRandomActivity() {
  const activities = [
    { type: 'deploy', text: '<strong>9AC-gpu-07</strong> instance provisioned in ap-south-1' },
    { type: 'scale', text: '<strong>prod-inference-01</strong> auto-scaled to 12 replicas' },
    { type: 'alert', text: '<strong>gpu-node-03</strong> temperature threshold reached (82°C)' },
    { type: 'deploy', text: '<strong>9AK-cluster-02</strong> Kubernetes upgrade to v1.30 complete' },
    { type: 'scale', text: '<strong>edge-cdn-apac</strong> (9ED) cache invalidation completed' },
    { type: 'alert', text: '<strong>9PB-vol-12</strong> storage utilization at 85%' },
    { type: 'deploy', text: '<strong>model-registry</strong> new model artifact v2.4 pushed' },
  ];

  const newActivity = activities[Math.floor(Math.random() * activities.length)];
  newActivity.time = 'now';
  activityFeed.unshift(newActivity);
  if (activityFeed.length > 12) activityFeed.pop();
  renderActivityFeed();
}

/** Update chart time-series data */
function updateChartData() {
  const avgUtil = gpuFleet.reduce((sum, g) => sum + g.utilization, 0) / gpuFleet.length;
  computeHistory.push({ x: computeHistory.length, y: avgUtil + (Math.random() - 0.5) * 5 });
  if (computeHistory.length > MAX_HISTORY) computeHistory.shift();

  const netVal = 400 + Math.sin(Date.now() / 5000) * 150 + (Math.random() - 0.5) * 60;
  networkHistory.push({ x: networkHistory.length, y: Math.max(0, netVal) });
  if (networkHistory.length > MAX_HISTORY) networkHistory.shift();
}

/** Render charts */
function renderCharts() {
  const computeCanvas = document.getElementById('chart-compute');
  const networkCanvas = document.getElementById('chart-network');

  if (computeCanvas) {
    drawLineChart(computeCanvas, [
      { data: computeHistory, color: '#00E5C8', label: 'GPU Avg', fill: true }
    ], { gridLines: true, yMax: 100, yMin: 0 });
  }

  if (networkCanvas) {
    drawLineChart(networkCanvas, [
      { data: networkHistory, color: '#7C5CFC', label: 'Throughput (Gbps)', fill: true }
    ], { gridLines: true, yMax: 800, yMin: 0 });
  }
}

/** Handle deploy events from AI assistant */
function handleDeploy(event) {
  const detail = event.detail || {};
  const newGPU = {
    id: `gpu-node-${String(gpuFleet.length + 1).padStart(2, '0')}`,
    name: detail.name || `GPU Node ${String(gpuFleet.length + 1).padStart(2, '0')}`,
    model: detail.model || 'NVIDIA H100 SXM 80GB',
    status: 'active',
    utilization: 5 + Math.floor(Math.random() * 15),
    vram: 2 + Math.random() * 8,
    vramTotal: 80,
    temperature: 35 + Math.floor(Math.random() * 10),
    power: 80 + Math.floor(Math.random() * 50),
    powerMax: 700
  };

  gpuFleet.push(newGPU);
  renderGPUFleet();

  // Add to cost
  window.dispatchEvent(new CustomEvent('nava:resourceAdded', {
    detail: {
      id: newGPU.id,
      name: newGPU.name,
      type: '9AC',
      gpuType: 'h100',
      gpuCount: detail.gpuCount || 1,
      hourlyRate: 3.50,
      monthlyRate: 3.50 * 730
    }
  }));

  // Add activity
  activityFeed.unshift({
    type: 'deploy',
    time: 'now',
    text: `<strong>${newGPU.name}</strong> deployed via AI Assistant`
  });
  renderActivityFeed();
}

/** Provision modal handlers */
function openProvisionModal() {
  document.getElementById('provision-modal')?.classList.remove('hidden');
}

function closeProvisionModal() {
  document.getElementById('provision-modal')?.classList.add('hidden');
}

function deployFromModal() {
  const name = document.getElementById('prov-name')?.value || 'gpu-cluster';
  const type = document.getElementById('prov-type')?.value || '9ac';
  const gpu = document.getElementById('prov-gpu')?.value || 'h100';
  const nodes = parseInt(document.getElementById('prov-nodes')?.value || '4');

  const gpuModels = {
    h100: 'NVIDIA H100 SXM 80GB',
    a100: 'NVIDIA A100 80GB',
    b200: 'NVIDIA B200 SXM 192GB'
  };

  const gpuPrices = { h100: 3.50, a100: 2.10, b200: 5.20 };

  for (let i = 0; i < Math.min(nodes, 4); i++) {
    const newGPU = {
      id: `gpu-node-${String(gpuFleet.length + 1).padStart(2, '0')}`,
      name: `${name}-${String(i + 1).padStart(2, '0')}`,
      model: gpuModels[gpu] || 'NVIDIA H100 SXM 80GB',
      status: 'active',
      utilization: Math.floor(Math.random() * 20),
      vram: Math.random() * 10,
      vramTotal: gpu === 'b200' ? 192 : 80,
      temperature: 35 + Math.floor(Math.random() * 10),
      power: 80 + Math.floor(Math.random() * 60),
      powerMax: gpu === 'b200' ? 1000 : 700
    };
    gpuFleet.push(newGPU);
  }

  renderGPUFleet();

  window.dispatchEvent(new CustomEvent('nava:resourceAdded', {
    detail: {
      id: `cluster-${Date.now()}`,
      name: name,
      type: type.toUpperCase(),
      gpuType: gpu,
      gpuCount: nodes,
      hourlyRate: (gpuPrices[gpu] || 3.50) * nodes,
      monthlyRate: (gpuPrices[gpu] || 3.50) * nodes * 730
    }
  }));

  activityFeed.unshift({
    type: 'deploy',
    time: 'now',
    text: `<strong>${name}</strong> provisioned with ${nodes}x ${gpuModels[gpu] || 'H100'}`
  });
  renderActivityFeed();

  closeProvisionModal();
}

/** Get current GPU fleet for external modules */
export function getGPUFleet() {
  return gpuFleet;
}

export function cleanup() {
  if (updateInterval) clearInterval(updateInterval);
}
