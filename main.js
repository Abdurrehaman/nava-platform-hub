import './style.css';
import { initDashboard } from './modules/dashboard.js';
import { initPricing } from './modules/pricing-engine.js';
import { initAssistant } from './modules/ai-assistant.js';
import { initSimulator } from './modules/workload-simulator.js';
import { initInferenceEngine } from './modules/inference-engine.js';
import { initGPUSREOps } from './modules/gpu-sre-ops.js';
import { initNetworkFabric } from './modules/network-fabric.js';

// Global Nav Logic
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Modules
  initDashboard();
  initPricing();
  initAssistant();
  initSimulator();
  initInferenceEngine();
  initGPUSREOps();
  initNetworkFabric();
  
  // Tabs
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
      
      if (viewName === 'network') {
        initNetworkFabric();
      } else if (viewName === 'inference') {
        initInferenceEngine();
      } else if (viewName === 'sre') {
        initGPUSREOps();
      }
    });
  });

  // Resume Cheat Sheet Modal logic
  const cheatBtn = document.getElementById('cheatsheet-btn');
  const cheatModal = document.getElementById('cheatsheet-modal');
  const cheatClose = document.getElementById('cheatsheet-close');

  if (cheatBtn && cheatModal) {
    cheatBtn.addEventListener('click', () => cheatModal.classList.remove('hidden'));
  }
  if (cheatClose && cheatModal) {
    cheatClose.addEventListener('click', () => cheatModal.classList.add('hidden'));
  }

  // Provision Modal logic
  const modal = document.getElementById('provision-modal');
  const cancelBtn = document.getElementById('prov-cancel');
  const deployBtn = document.getElementById('prov-deploy');
  
  document.querySelectorAll('.provision-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  });
  
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
  
  if (deployBtn) {
    deployBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      const name = document.getElementById('prov-name').value;
      const type = document.getElementById('prov-type').value;
      const gpu = document.getElementById('prov-gpu').value;
      const nodes = document.getElementById('prov-nodes').value;
      
      const event = new CustomEvent('nava:deploy', {
        detail: { name, type, gpu, nodes }
      });
      window.dispatchEvent(event);
    });
  }
  
  const nodesSlider = document.getElementById('prov-nodes');
  const nodesVal = document.getElementById('prov-nodes-val');
  if (nodesSlider && nodesVal) {
    nodesSlider.addEventListener('input', (e) => {
      nodesVal.textContent = e.target.value;
    });
  }

  // Simulator shortcut listener
  window.addEventListener('nava:openSimulator', () => {
    const simTab = document.querySelector('.nav-tab[data-view="simulator"]');
    if (simTab) simTab.click();
  });
});

// PITCH MODE LOGIC
const pitchSteps = [
  { target: '#view-dashboard', title: '1. The Autonomous AI Cloud Console', script: "Welcome to Nava Platform Hub — an autonomous AI-native GPU cloud. We provide real-time hardware telemetry, live compute utilization, and automated fleet management across H100, A100, and B200 SXM nodes.", position: 'bottom' },
  { target: '#nav-inference', title: '2. Inference Stack Telemetry (vLLM & SGLang)', script: "Nava prioritizes hyperscale inference efficiency. This stack visualizes real-time metrics for vLLM, SGLang, and TensorRT-LLM engines, tracking PagedAttention KV-Cache pressure and Time-To-First-Token (TTFT).", position: 'bottom' },
  { target: '#nav-sre', title: '3. GPU SRE & Bare-Metal Self-Healing Ops', script: "Our SRE observability engine instruments NVIDIA DCGM metrics and monitors kernel Xid errors in real-time. When a critical failure like Xid 79 occurs, automated runbooks isolate the failed GPU node via the NVIDIA Operator.", position: 'bottom' },
  { target: '#nav-network', title: '4. High-Throughput GPU Network Fabric', script: "Modern AI performance relies heavily on networking. This view maps Clos / Leaf-Spine topologies and tracks 800G RoCEv2 / InfiniBand GPUDirect RDMA throughput with PFC pause frame congestion control.", position: 'bottom' },
  { target: '#nav-simulator', title: '5. Workload & Quantization Simulator', script: "Our killer feature! Before spending a single dollar, users can benchmark FP8/AWQ quantization performance, test vLLM vs TensorRT-LLM, and evaluate EAGLE speculative decoding speedups to optimize their cloud spend.", position: 'bottom' }
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
    
    if (step.target === '#view-dashboard') {
       document.querySelector('.nav-tab[data-view="dashboard"]')?.click();
    } else if (step.target === '#nav-inference') {
       document.querySelector('.nav-tab[data-view="inference"]')?.click();
    } else if (step.target === '#nav-sre') {
       document.querySelector('.nav-tab[data-view="sre"]')?.click();
    } else if (step.target === '#nav-network') {
       document.querySelector('.nav-tab[data-view="network"]')?.click();
    } else if (step.target === '#nav-simulator') {
       document.querySelector('.nav-tab[data-view="simulator"]')?.click();
    }
    
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
        } else if (step.position === 'left') {
          tooltip.style.top = rect.top + 'px';
          tooltip.style.left = (rect.left - 370) + 'px';
        } else if (step.position === 'right') {
          tooltip.style.top = rect.top + 'px';
          tooltip.style.left = (rect.right + 20) + 'px';
        }
      }
    }, 120);
  }
});
