// ─────────────────────────────────────────────────────────────
//  modules/inference-engine.js — Nava Platform Hub
//  vLLM, SGLang, and TensorRT-LLM Engine Telemetry & KV-Cache
// ─────────────────────────────────────────────────────────────

import { generateInferenceMetrics } from './data-simulator.js';
import { drawLineChart, drawRadialGauge } from './chart-renderer.js';

export function initInferenceEngine() {
  const container = document.getElementById('inference-metrics-container');
  if (!container) return;

  renderInferenceMetrics();
}

export function renderInferenceMetrics() {
  const data = generateInferenceMetrics();
  
  // Render Engine Cards
  const enginesGrid = document.getElementById('inference-engines-grid');
  if (enginesGrid) {
    enginesGrid.innerHTML = data.engines.map(e => `
      <div class="panel-card engine-card">
        <div class="engine-header">
          <span class="engine-badge">${e.name}</span>
          <span class="engine-eff">Efficiency: ${e.efficiency}</span>
        </div>
        <div class="engine-stats">
          <div class="stat-mini">
            <span class="stat-mini-label">TTFT (First Token)</span>
            <span class="stat-mini-val">${e.avgTTFT}</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-label">ITL (Inter-Token)</span>
            <span class="stat-mini-val">${e.avgITL}</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-label">Throughput</span>
            <span class="stat-mini-val text-primary">${e.throughput}</span>
          </div>
        </div>
        <div class="kv-meter-container">
          <div class="kv-label"><span>KV-Cache Paged Memory</span><span>${e.kvCacheUsage}%</span></div>
          <div class="kv-meter-bar">
            <div class="kv-meter-fill" style="width: ${e.kvCacheUsage}%;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render Deployments Table
  const tableBody = document.getElementById('inference-table-body');
  if (tableBody) {
    tableBody.innerHTML = data.deployments.map(d => `
      <tr>
        <td><strong>${d.model}</strong></td>
        <td><span class="tag-pill">${d.engine}</span></td>
        <td><span class="tag-pill tag-quant">${d.quantization}</span></td>
        <td>${d.gpus}</td>
        <td>${d.ttft}</td>
        <td>${d.itl}</td>
        <td class="text-primary"><strong>${d.throughput}</strong></td>
        <td><span class="status-badge active">${d.status}</span></td>
      </tr>
    `).join('');
  }

  // Draw KV Cache Gauge
  const canvasGauge = document.getElementById('kv-cache-gauge');
  if (canvasGauge) {
    drawRadialGauge(canvasGauge, 76, 100, {
      color: '#00E5C8',
      label: 'KV-CACHE PRESSURE',
      unit: '%',
      warningThreshold: 80,
      dangerThreshold: 90
    });
  }
}
