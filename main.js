import './style.css';
import { initGPUSREOps } from './modules/gpu-sre-ops.js';

const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize SRE Ops module
  initGPUSREOps();

  // Tab Navigation
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

  // Diagnostics Form Submission Handler
  const diagForm = document.getElementById('diag-form');
  const resultsOutput = document.getElementById('diag-results-output');
  const healthBadge = document.getElementById('diag-health-score');

  if (diagForm) {
    diagForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        gpu_count: parseInt(document.getElementById('diag-gpu-count').value) || 8,
        gpu_model: document.getElementById('diag-gpu-model').value,
        workload_type: document.getElementById('diag-workload').value,
        cooling_type: document.getElementById('diag-cooling').value,
        pcie_gen: document.getElementById('diag-pcie').value,
        power_limit_w: parseInt(document.getElementById('diag-power').value) || 700,
        vram_gb: parseInt(document.getElementById('diag-vram').value) || 80,
      };

      if (resultsOutput) {
        resultsOutput.innerHTML = '<div class="placeholder-msg">⚡ Running Python Backend Flaw Analysis...</div>';
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const report = await res.json();
        renderDiagnosticReport(report);
      } catch (err) {
        // Standalone Client-Side Fallback Analysis if backend is not running
        const report = fallbackDiagnosticAnalysis(payload);
        renderDiagnosticReport(report);
      }
    });
  }

  // Python API Explorer Buttons
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
          responseBox.textContent = `// Note: Ensure Python FastAPI server is running (python -m uvicorn backend.app:app --reload)\n// Demo Standalone Response for ${endpoint}:\n\n` + JSON.stringify({
            status: "STANDALONE_DEMO",
            endpoint: endpoint,
            info: "Start Python backend server for live SQLite database connection",
            sample_data: endpoint.includes('nodes') ? [
              { id: "gpu-node-01", name: "GPU Node 01", model: "NVIDIA H100 SXM 80GB", status: "healthy" },
              { id: "gpu-node-06", name: "GPU Node 06", model: "NVIDIA L40S 48GB", status: "isolated", k8s_cordoned: true }
            ] : { info: "FastAPI REST Server API Ready" }
          }, null, 2);
        }
      }
    });
  });
});

function renderDiagnosticReport(report) {
  const resultsOutput = document.getElementById('diag-results-output');
  const healthBadge = document.getElementById('diag-health-score');

  if (healthBadge) {
    healthBadge.textContent = `Fleet Score: ${report.health_score}%`;
    if (report.health_score < 70) {
      healthBadge.style.color = '#FF6B6B';
      healthBadge.style.borderColor = '#FF6B6B';
    } else {
      healthBadge.style.color = '#00E5C8';
      healthBadge.style.borderColor = '#00E5C8';
    }
  }

  if (!resultsOutput) return;

  const flawsHtml = report.flaws.map(f => `
    <div class="flaw-card ${f.severity.toLowerCase()}">
      <div class="flaw-header">
        <span>${f.category.toUpperCase()}: ${f.title}</span>
        <span>${f.severity}</span>
      </div>
      <div class="flaw-desc">${f.description}</div>
      <div class="flaw-impact">Expected Impact: ${f.impact}</div>
    </div>
  `).join('');

  const recsHtml = report.recommendations.map(r => `<li>💡 ${r}</li>`).join('');

  resultsOutput.innerHTML = `
    ${flawsHtml}
    <div class="rec-box">
      <h4>🛠️ Recommended SRE Optimization Actions:</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; margin-top: 6px;">
        ${recsHtml}
      </ul>
    </div>
  `;
}

function fallbackDiagnosticAnalysis(p) {
  let score = 100;
  const flaws = [];
  const recs = [];

  if (p.gpu_model.includes('H100') && p.cooling_type === 'air') {
    flaws.append ? null : flaws.push({
      category: 'Thermal',
      severity: 'CRITICAL',
      title: 'Thermal Throttling Vulnerability (>85°C)',
      description: `Air cooling is insufficient for ${p.gpu_model} running at ${p.power_limit_w}W. Dynamic SM clock downclocking (Xid 43) will occur.`,
      impact: '20-35% computing throughput degradation'
    });
    recs.push('Switch to Direct Liquid Cooling (DLC) to keep junction temps under 72°C.');
    score -= 25;
  }

  if (p.pcie_gen === 'gen4' && p.gpu_count >= 8) {
    flaws.push({
      category: 'Interconnect',
      severity: 'WARNING',
      title: 'PCIe Gen 4 Host-to-Device Bottleneck',
      description: `PCIe Gen 4 (32 GB/s) limits multi-node gradient synchronization across ${p.gpu_count} GPUs.`,
      impact: 'Increases inter-node latency by 2.2x'
    });
    recs.push('Upgrade host bus to PCIe Gen 5 (64 GB/s) or configure GPUDirect RDMA over 800G RoCEv2.');
    score -= 15;
  }

  if (flaws.length === 0) {
    flaws.push({
      category: 'Optimal',
      severity: 'INFO',
      title: 'No Critical Hardware Flaws Detected',
      description: `Configuration is well-balanced for ${p.workload_type}.`,
      impact: 'Operating at peak theoretical capacity'
    });
    recs.push('Configuration is optimal for day-2 operations.');
  }

  return { health_score: Math.max(15, score), flaws, recommendations: recs };
}
