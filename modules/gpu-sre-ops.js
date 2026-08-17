// ─────────────────────────────────────────────────────────────
//  modules/gpu-sre-ops.js — Nava Platform Hub
//  GPU SRE Fleet Operations, NVIDIA DCGM & Real-Time SM Occupancy Line Chart
// ─────────────────────────────────────────────────────────────

import { generateDCGMMetrics } from './data-simulator.js';
import { drawLineChart } from './chart-renderer.js';

let telemetryInterval = null;
let smOccupancyHistory = [];

export function initGPUSREOps() {
  const container = document.getElementById('sre-ops-container');
  if (!container) return;

  // Initialize seed history
  if (smOccupancyHistory.length === 0) {
    for (let i = 0; i < 20; i++) {
      smOccupancyHistory.push({ x: i, y: Math.floor(75 + Math.random() * 20) });
    }
  }

  renderSREMetrics();
  bindSREActions();

  // Continuous live loop: update every 1.5 seconds
  if (telemetryInterval) clearInterval(telemetryInterval);
  telemetryInterval = setInterval(() => {
    renderSREMetrics();
  }, 1500);
}

export function renderSREMetrics() {
  const data = generateDCGMMetrics();

  // Update SM Occupancy History array
  const currentVal = data.dcgmStats.smOccupancy;
  smOccupancyHistory.push({ x: smOccupancyHistory.length, y: currentVal });
  if (smOccupancyHistory.length > 35) {
    smOccupancyHistory.shift();
  }

  // Update DOM Badge Value
  const smValBadge = document.getElementById('dcgm-occupancy-val');
  if (smValBadge) {
    smValBadge.textContent = `${currentVal}%`;
  }

  // Render Line Chart
  const chartCanvas = document.getElementById('dcgm-occupancy-chart');
  if (chartCanvas) {
    drawLineChart(chartCanvas, [
      { data: smOccupancyHistory, color: '#7C5CFC', fill: true }
    ], { yMin: 0, yMax: 100, gridLines: true });
  }

  // DCGM Stats Grid
  const dcgmGrid = document.getElementById('dcgm-stats-grid');
  if (dcgmGrid) {
    dcgmGrid.innerHTML = `
      <div class="dcgm-card">
        <span class="dcgm-label">SM Occupancy</span>
        <span class="dcgm-val text-primary">${data.dcgmStats.smOccupancy}%</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Avg Power Draw</span>
        <span class="dcgm-val">${data.dcgmStats.avgPowerWatts} W / ${data.dcgmStats.maxPowerWatts} W</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">PCIe Bus Bandwidth</span>
        <span class="dcgm-val">${data.dcgmStats.pcieBandwidth}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">NVLink Interconnect</span>
        <span class="dcgm-val text-secondary">${data.dcgmStats.nvlinkBandwidth}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Driver / CUDA</span>
        <span class="dcgm-val">${data.dcgmStats.driverVersion} (${data.dcgmStats.cudaVersion})</span>
      </div>
    `;
  }

  // Xid Error Feed
  const xidFeed = document.getElementById('xid-error-feed');
  if (xidFeed && !xidFeed.dataset.userInteracted) {
    xidFeed.innerHTML = data.xidLogs.map(log => `
      <div class="xid-item ${log.severity.toLowerCase()}">
        <div class="xid-header">
          <span class="xid-code">${log.code}</span>
          <span class="xid-node">Node: ${log.node}</span>
          <span class="xid-time">${log.time}</span>
        </div>
        <div class="xid-desc">${log.desc}</div>
        <div class="xid-footer">
          <span class="xid-status">Action: ${log.action}</span>
          <button class="btn-remediate-action" data-node="${log.node}" data-code="${log.code}">⚡ Remediate via Operator</button>
        </div>
      </div>
    `).join('');
  }
}

function bindSREActions() {
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-remediate-action')) {
      const node = e.target.getAttribute('data-node');
      const code = e.target.getAttribute('data-code');

      const xidFeed = document.getElementById('xid-error-feed');
      if (xidFeed) xidFeed.dataset.userInteracted = "true";

      e.target.textContent = '⏳ Executing Runbook...';
      e.target.disabled = true;

      setTimeout(() => {
        e.target.textContent = '✅ Node Drained & Isolated';
        e.target.style.background = 'rgba(0, 229, 200, 0.2)';
        e.target.style.color = '#00E5C8';

        const toast = document.getElementById('sre-toast-notification');
        if (toast) {
          toast.textContent = `[Self-Healing Runbook] Successfully cordoned ${node} (NVIDIA GPU Operator isolated ${code})`;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 4000);
        }
      }, 1200);
    }
  });
}
