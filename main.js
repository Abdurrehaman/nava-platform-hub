import './style.css';
import { initDashboard } from './modules/dashboard.js';
import { initPricing } from './modules/pricing-engine.js';
import { initAssistant } from './modules/ai-assistant.js';
import { initSimulator } from './modules/workload-simulator.js';

// Setup Topology View
function initTopology() {
  const canvas = document.getElementById('topology-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // HiDPI Scaling
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  // Dummy Topology Rendering
  const nodes = [
    { x: 450, y: 100, label: 'Edge Router (9ED)', color: '#FFD93D' },
    { x: 450, y: 200, label: 'Firewall (9EF)', color: '#FF6B6B' },
    { x: 300, y: 350, label: 'Compute (9AC)', color: '#00E5C8' },
    { x: 600, y: 350, label: 'Kubernetes (9AK)', color: '#7C5CFC' },
    { x: 450, y: 450, label: 'Storage (9PB)', color: '#4ECDC4' },
  ];
  
  const connections = [
    [0, 1], [1, 2], [1, 3], [2, 4], [3, 4]
  ];
  
  // Draw lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  connections.forEach(([from, to]) => {
    ctx.beginPath();
    ctx.moveTo(nodes[from].x, nodes[from].y);
    ctx.lineTo(nodes[to].x, nodes[to].y);
    ctx.stroke();
  });
  
  // Draw nodes
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = n.color;
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#8A8FA8';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, n.x, n.y + 30);
  });
}

// Global Nav Logic
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Modules
  initDashboard();
  initPricing();
  initAssistant();
  initSimulator();
  
  // Tabs
  const tabs = document.querySelectorAll('.nav-tab[data-target]');
  const views = document.querySelectorAll('.view');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      
      // Activate target
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
      
      if (targetId === 'view-topology') {
        initTopology(); // Render topology on demand
      }
    });
  });

  // Provision Modal logic
  const modal = document.getElementById('provision-modal');
  const cancelBtn = document.getElementById('prov-cancel');
  const deployBtn = document.getElementById('prov-deploy');
  
  document.querySelectorAll('.provision-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  });
  
  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
  
  deployBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    const name = document.getElementById('prov-name').value;
    const type = document.getElementById('prov-type').value;
    const gpu = document.getElementById('prov-gpu').value;
    const nodes = document.getElementById('prov-nodes').value;
    
    // Dispatch custom event to simulate deployment
    const event = new CustomEvent('nava:deploy', {
      detail: { name, type, gpu, nodes }
    });
    window.dispatchEvent(event);
  });
  
  // Slider value update
  const nodesSlider = document.getElementById('prov-nodes');
  const nodesVal = document.getElementById('prov-nodes-val');
  nodesSlider.addEventListener('input', (e) => {
    nodesVal.textContent = e.target.value;
  });

  // Simulator shortcut listener
  window.addEventListener('nava:openSimulator', () => {
    const simTab = document.querySelector('.nav-tab[data-target="view-simulator"]');
    if (simTab) simTab.click();
  });
});

// PITCH MODE LOGIC
const pitchSteps = [
  { target: '#view-dashboard', title: 'The Premium Dashboard', script: 'Welcome to Nava Platform Hub. Unlike AWS or GCP clunky consoles, we built a premium, AI-native command center. Notice the real-time telemetry rendering via hardware-accelerated canvas. It’s built for modern engineering teams.', position: 'bottom' },
  { target: '#ai-toggle', title: 'Nava AI Assistant', script: 'Click this to open the AI Assistant. Instead of writing complex Terraform scripts manually, you simply ask the AI to provision an LLM training cluster, and it generates the exact infrastructure as code tailored to Nava’s 9AC and 9AK services.', position: 'left' },
  { target: '#pricing-sidebar', title: 'Dynamic Pricing Engine', script: 'Transparency is our core. As you add or remove GPU clusters, this sidebar calculates your costs in real-time. It even compares our H100 pricing directly against CoreWeave and AWS, proving our cost efficiency.', position: 'right' },
  { target: '#nav-simulator', title: 'Workload Flight Simulator', script: 'This is our killer feature. Before spending a single dollar, click here to simulate your AI workload. We mathematically predict VRAM constraints, network bottlenecks, and exactly how long your Llama 3 fine-tuning will take, allowing you to optimize before deploying.', position: 'bottom' }
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
    // small delay to allow display block to apply before animating opacity
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
    
    // Ensure the view is active if targeting a tab/view
    if (step.target === '#view-dashboard') {
       document.querySelector('.nav-tab[data-target="view-dashboard"]')?.click();
    } else if (step.target === '#nav-simulator') {
       document.querySelector('.nav-tab[data-target="view-simulator"]')?.click();
    }
    
    // wait for layout
    setTimeout(() => {
      const targetEl = document.querySelector(step.target);
      if (!targetEl) return;
      
      const rect = targetEl.getBoundingClientRect();
      
      // Set highlight box
      if (highlight) {
        highlight.style.top = (rect.top - 10) + 'px';
        highlight.style.left = (rect.left - 10) + 'px';
        highlight.style.width = (rect.width + 20) + 'px';
        highlight.style.height = (rect.height + 20) + 'px';
      }
      
      // Position tooltip
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
    }, 100);
  }
});
