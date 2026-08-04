// ─────────────────────────────────────────────────────────────
//  modules/network-fabric.js — Nava Platform Hub
//  GPU Network Fabric, RoCEv2, InfiniBand & GPUDirect RDMA
// ─────────────────────────────────────────────────────────────

import { generateNetworkFabricData } from './data-simulator.js';

export function initNetworkFabric() {
  const canvas = document.getElementById('fabric-canvas');
  if (!canvas) return;

  renderFabricDiagram(canvas);
  renderFabricMetrics();
}

export function renderFabricMetrics() {
  const data = generateNetworkFabricData();
  const infoCard = document.getElementById('network-info-card');
  if (infoCard) {
    infoCard.innerHTML = `
      <div class="dcgm-card">
        <span class="dcgm-label">Fabric Architecture</span>
        <span class="dcgm-val text-primary">${data.fabricType}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Topology</span>
        <span class="dcgm-val">${data.topology}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">GPUDirect RDMA Latency</span>
        <span class="dcgm-val text-secondary">${data.rdmaLatency}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Fabric Throughput</span>
        <span class="dcgm-val">${data.throughputGbps} Gbps</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">PFC Pause Frames / ECN Rate</span>
        <span class="dcgm-val">${data.pfcPauseFrames} frames (${data.ecnCongestionRate})</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Hardware Acceleration</span>
        <span class="dcgm-val">${data.dpuHardware}</span>
      </div>
    `;
  }
}

function renderFabricDiagram(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  // Define Clos / Leaf-Spine Nodes
  const spineNodes = [
    { x: width * 0.25, y: 50, label: 'Spine-01 (NVIDIA Quantum)' },
    { x: width * 0.50, y: 50, label: 'Spine-02 (NVIDIA Quantum)' },
    { x: width * 0.75, y: 50, label: 'Spine-03 (NVIDIA Quantum)' },
  ];

  const leafNodes = [
    { x: width * 0.15, y: 180, label: 'Leaf-01' },
    { x: width * 0.38, y: 180, label: 'Leaf-02' },
    { x: width * 0.62, y: 180, label: 'Leaf-03' },
    { x: width * 0.85, y: 180, label: 'Leaf-04' },
  ];

  const gpuNodes = [
    { x: width * 0.10, y: 310, label: 'H100 Node 1 (GPUDirect)' },
    { x: width * 0.23, y: 310, label: 'H100 Node 2' },
    { x: width * 0.35, y: 310, label: 'B200 Node 3' },
    { x: width * 0.50, y: 310, label: 'B200 Node 4' },
    { x: width * 0.65, y: 310, label: 'A100 Node 5' },
    { x: width * 0.78, y: 310, label: 'A100 Node 6' },
    { x: width * 0.90, y: 310, label: 'L40S Node 7' },
  ];

  // Draw Leaf-to-Spine Interconnect Lines (Clos Fabric)
  ctx.lineWidth = 1.5;
  spineNodes.forEach(spine => {
    leafNodes.forEach(leaf => {
      ctx.beginPath();
      ctx.moveTo(spine.x, spine.y);
      ctx.lineTo(leaf.x, leaf.y);
      ctx.strokeStyle = 'rgba(0, 229, 200, 0.15)';
      ctx.stroke();
    });
  });

  // Draw Leaf-to-GPU Interconnect Lines
  leafNodes.forEach((leaf, idx) => {
    gpuNodes.forEach((gpu, gIdx) => {
      if (Math.abs(gIdx - idx * 1.8) < 2) {
        ctx.beginPath();
        ctx.moveTo(leaf.x, leaf.y);
        ctx.lineTo(gpu.x, gpu.y);
        ctx.strokeStyle = 'rgba(124, 92, 252, 0.25)';
        ctx.stroke();
      }
    });
  });

  // Draw Spine Nodes
  spineNodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#00E5C8';
    ctx.fill();
    ctx.fillStyle = '#8A8FA8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, n.x, n.y - 20);
  });

  // Draw Leaf Nodes
  leafNodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#7C5CFC';
    ctx.fill();
    ctx.fillStyle = '#8A8FA8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, n.x, n.y - 18);
  });

  // Draw GPU Endpoint Nodes
  gpuNodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#4ECDC4';
    ctx.fill();
    ctx.fillStyle = '#C8CCD0';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, n.x, n.y + 22);
  });
}
