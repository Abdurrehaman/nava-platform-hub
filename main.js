import './style.css';
import { initGPUSREOps } from './modules/gpu-sre-ops.js';

// Base API URL for Python FastAPI server
const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize GPU SRE Ops module
  initGPUSREOps();

  // Navigation Tabs
  const tabs = document.querySelectorAll('.nav-tab[data-view]');
  const views = document.querySelectorAll('.view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const viewName = tab.getAttribute('data-view');
      const targetId = 'view-' + viewName;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');

      if (viewName === 'sre') {
        initGPUSREOps();
      }
    });
  });

  // Cheat Sheet Modal
  const cheatBtn = document.getElementById('cheatsheet-btn');
  const cheatModal = document.getElementById('cheatsheet-modal');
  const cheatClose = document.getElementById('cheatsheet-close');

  if (cheatBtn && cheatModal) {
    cheatBtn.addEventListener('click', () => cheatModal.classList.remove('hidden'));
  }
  if (cheatClose && cheatModal) {
    cheatClose.addEventListener('click', () => cheatModal.classList.add('hidden'));
  }

  // Python API Inspector Buttons
  const apiBtns = document.querySelectorAll('.api-endpoint-btn');
  const responseBox = document.getElementById('api-response-box');

  apiBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const endpoint = btn.getAttribute('data-endpoint');
      if (responseBox) responseBox.textContent = `GET ${endpoint}\nFetching from Python FastAPI backend...`;

      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const data = await res.json();
        if (responseBox) {
          responseBox.textContent = `// 200 OK — ${API_BASE_URL}${endpoint}\n\n` + JSON.stringify(data, null, 2);
        }
      } catch (err) {
        if (responseBox) {
          responseBox.textContent = `// Note: Ensure Python FastAPI server is running (python -m uvicorn backend.app:app --reload)\n// Standalone Demo Fallback Response for ${endpoint}:\n\n` + JSON.stringify({
            status: "DEMO_STANDALONE",
            endpoint: endpoint,
            info: "Start backend server to query live SQLite database",
            sample_data: endpoint.includes('nodes') ? [
              { id: "gpu-node-01", name: "GPU Node 01", model: "NVIDIA H100 SXM 80GB", status: "healthy" },
              { id: "gpu-node-06", name: "GPU Node 06", model: "NVIDIA L40S 48GB", status: "isolated", k8s_cordoned: true }
            ] : { info: "FastAPI REST Server Connected" }
          }, null, 2);
        }
      }
    });
  });
});

// PITCH MODE LOGIC
const pitchSteps = [
  { target: '#view-sre', title: '1. Bare-Metal GPU Reliability & SRE Platform', script: "Welcome to Nava GPU SRE Sentinel. Built with a Python FastAPI backend and SQLite database, this platform monitors hyperscale bare-metal GPU clusters, tracking compute health and hardware errors.", position: 'bottom' },
  { target: '#dcgm-stats-grid', title: '2. NVIDIA DCGM Hardware Observability', script: "Our Python engine ingests NVIDIA DCGM metrics in real time. We monitor SM Occupancy %, Power Draw in Watts, Temperature °C, and PCIe bus bandwidth across H100, A100, and B200 SXM nodes.", position: 'bottom' },
  { target: '#xid-error-feed', title: '3. Kernel Xid 79 Errors & Self-Healing Runbooks', script: "When a hardware failure like Xid 79 occurs (GPU fallen off PCIe bus), our Python self-healing worker automatically cordons the node in Kubernetes, drains active workloads, issues a PCIe bus reset, and logs an immutable audit trail.", position: 'top' }
];

let currentPitchStep = 0;

document.addEventListener('DOMContentLoaded', () => {
  const pitchBtn = document.getElementById('pitch-mode-btn');
  const overlay = document.getElementById('pitch-overlay');
  const highlight = document.getElementById('pitch-highlight');
  const tooltip = document.getElementById('pitch-tooltip');

  if (pitchBtn) pitchBtn.addEventListener('click', startPitch);

  document.getElementById('pitch-close')?.addEventListener('click', endPitch);
  document.getElementById('pitch-next')?.addEventListener('click', () => showPitchStep(currentPitchStep + 1));
  document.getElementById('pitch-prev')?.addEventListener('click', () => showPitchStep(currentPitchStep - 1));

  function startPitch() {
    currentPitchStep = 0;
    if (overlay) overlay.classList.remove('hidden');
    setTimeout(() => {
      if (overlay) overlay.classList.add('active');
      showPitchStep(0);
    }, 50);
  }

  function endPitch() {
    if (overlay) overlay.classList.remove('active');
    setTimeout(() => { if (overlay) overlay.classList.add('hidden'); }, 300);
  }

  function showPitchStep(index) {
    if (index < 0 || index >= pitchSteps.length) {
      endPitch();
      return;
    }
    currentPitchStep = index;
    const step = pitchSteps[index];

    document.getElementById('pitch-step-num').textContent = index + 1;
    document.getElementById('pitch-title').textContent = step.title;
    document.getElementById('pitch-body').textContent = step.script;

    setTimeout(() => {
      const targetEl = document.querySelector(step.target);
      if (!targetEl) return;

      const rect = targetEl.getBoundingClientRect();

      if (highlight) {
        highlight.style.top = (rect.top - 10) + 'px';
        highlight.style.left = (rect.left - 10) + 'px';
        highlight.style.width = (rect.width + 20) + 'px';
        highlight.style.height = (rect.height + 20) + 'px';
      }

      if (tooltip) {
        if (step.position === 'bottom') {
          tooltip.style.top = (rect.bottom + 20) + 'px';
          tooltip.style.left = Math.max(20, rect.left + (rect.width/2) - 175) + 'px';
        } else if (step.position === 'top') {
          tooltip.style.top = Math.max(20, rect.top - 180) + 'px';
          tooltip.style.left = Math.max(20, rect.left + (rect.width/2) - 175) + 'px';
        }
      }
    }, 120);
  }
});
