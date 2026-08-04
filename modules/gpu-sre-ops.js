// ─────────────────────────────────────────────────────────────
//  modules/gpu-sre-ops.js — Nava Platform Hub
//  GPU SRE Fleet Operations, NVIDIA DCGM & Xid Self-Healing
// ─────────────────────────────────────────────────────────────

import { generateDCGMMetrics } from './data-simulator.js';
import { drawRadialGauge } from './chart-renderer.js';

export function initGPUSREOps() {
  const container = document.getElementById('sre-ops-container');
  if (!container) return;

  renderSREMetrics();
  bindSREActions();
}

export function renderSREMetrics() {
  const data = generateDCGMMetrics();

  // DCGM Stats
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
  if (xidFeed) {
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

  // DCGM Gauge
  const dcgmGauge = document.getElementById('dcgm-occupancy-gauge');
  if (dcgmGauge) {
    drawRadialGauge(dcgmGauge, data.dcgmStats.smOccupancy, 100, {
      color: '#7C5CFC',
      label: 'SM OCCUPANCY',
      unit: '%',
      warningThreshold: 85,
      dangerThreshold: 95
    });
  }
}

function bindSREActions() {
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-remediate-action')) {
      const node = e.target.getAttribute('data-node');
      const code = e.target.getAttribute('data-code');
      
      e.target.textContent = '⏳ Executing Runbook...';
      e.target.disabled = true;

      setTimeout(() => {
        e.target.textContent = '✅ Node Drained & Isolated';
        e.target.style.background = 'rgba(0, 229, 200, 0.2)';
        e.target.style.color = '#00E5C8';

        // Notify user via event
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
