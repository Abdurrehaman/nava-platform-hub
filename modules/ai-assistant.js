// ──────────────────────────────────────────────────────────────
//  Nava Platform Hub — AI Assistant Module
//  Handles the chat panel, user input, pattern-matched responses,
//  and dispatches platform events for cross-module integration.
// ──────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let messagesContainer = null;

// ─── Initialization ──────────────────────────────────────────

/**
 * Sets up all event listeners for the AI Assistant panel.
 * Binds toggle, close, send, enter-key, and quick-chip actions.
 */
export function initAssistant() {
  messagesContainer = document.getElementById('ai-messages');

  const panel   = document.getElementById('ai-assistant');
  const toggle  = document.getElementById('ai-toggle');
  const close   = document.getElementById('ai-close');
  const send    = document.getElementById('ai-send');
  const input   = document.getElementById('ai-input');

  if (toggle && panel) {
    toggle.addEventListener('click', () => panel.classList.toggle('open'));
  }

  if (close && panel) {
    close.addEventListener('click', () => panel.classList.remove('open'));
  }

  if (send) {
    send.addEventListener('click', () => {
      const input = document.getElementById('ai-input');
      if (input && input.value.trim()) {
        handleUserMessage(input.value.trim());
        input.value = '';
      }
    });
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (input.value.trim()) {
          handleUserMessage(input.value.trim());
          input.value = '';
        }
      }
    });
  }

  document.querySelectorAll('.ai-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) handleUserMessage(prompt);
    });
  });
}

// ─── Core Message Handler ────────────────────────────────────

/**
 * Processes a user message: renders the bubble, shows a typing
 * indicator, resolves the response via pattern matching, and
 * renders the bot reply after a realistic delay.
 * @param {string} text — The raw user input text
 */
export function handleUserMessage(text) {
  if (!text) return;

  addMessage('user', escapeHTML(text));
  showTyping();

  const delay = 1000 + Math.random() * 1000; // 1–2 s

  setTimeout(() => {
    hideTyping();
    const response = matchResponse(text);
    addMessage('bot', response);
  }, delay);
}

// ─── Pattern Matching Engine ─────────────────────────────────

/**
 * Matches user input against known intent patterns and returns
 * a rich HTML response string. Dispatches platform-level custom
 * events when an action should ripple to other modules.
 * @param {string} text — The user message to analyse
 * @returns {string} HTML-formatted bot response
 */
export function matchResponse(text) {
  const t = text.toLowerCase();

  // ── Deploy / Provision ────────────────────────────────────
  if (/(deploy|provision|create|launch|setup)\b/.test(t)) {
    return handleDeployIntent(t, text);
  }

  // ── GPU Guidance ──────────────────────────────────────────
  if (/(best gpu|which gpu|recommend gpu|gpu for)\b/i.test(t)) {
    return handleGPUIntent(t);
  }

  // ── Simulator ─────────────────────────────────────────────
  if (/(simulate|simulation|test run|flight)\b/.test(t)) {
    return handleSimulateIntent();
  }

  // ── Cost / Pricing ────────────────────────────────────────
  if (/(cost|price|pricing|compare|cheaper|expensive)\b/.test(t)) {
    return handleCostIntent(t);
  }

  // ── Scale ─────────────────────────────────────────────────
  if (/(scale|resize|expand|add nodes)\b/.test(t)) {
    return handleScaleIntent(t);
  }

  // ── Fallback ──────────────────────────────────────────────
  return handleFallback();
}

// ─── Intent Handlers ─────────────────────────────────────────

/**
 * Builds a deploy / provision response with a Terraform config
 * block tailored to what the user asked for, then dispatches
 * `nava:deploy` so the dashboard can react.
 */
function handleDeployIntent(lower, original) {
  let resourceLabel = 'infrastructure';
  let terraformBlock = '';

  if (/(llm|training|model|ml|machine learning|ai)/.test(lower)) {
    resourceLabel = 'LLM Training Environment';
    terraformBlock = `# Nava Infrastructure — LLM Training Environment
resource "nava_compute_cluster" "llm_training" {
  name          = "llm-training-prod"
  instance_type = "9ac.gpu.h100"
  gpu_count     = 4
  vpc_id        = nava_vpc.main.id

  storage {
    type = "9pb"
    size = "2TB"
  }

  kubernetes {
    engine    = "9ak"
    version   = "1.29"
    autoscale = true
  }
}`;
  } else if (/(api|gateway|backend|service|microservice)/.test(lower)) {
    resourceLabel = 'API Backend Service';
    terraformBlock = `# Nava Infrastructure — API Backend Service
resource "nava_compute_instance" "api_backend" {
  name          = "api-backend-prod"
  instance_type = "9ac.cpu.large"
  replicas      = 3
  vpc_id        = nava_vpc.main.id

  networking {
    edge    = "9ed"
    firewall = "9ef"
    ingress  = true
  }

  database {
    engine  = "9rd"
    version = "16"
    tier    = "ha"
  }

  queue {
    engine = "9mq"
    topics = ["requests", "events"]
  }
}`;
  } else if (/(database|db|postgres|mysql|data)/.test(lower)) {
    resourceLabel = 'Managed Database Cluster';
    terraformBlock = `# Nava Infrastructure — Managed Database Cluster
resource "nava_database" "primary" {
  name    = "primary-db-prod"
  engine  = "9rd"
  version = "16"
  tier    = "ha-enterprise"

  storage {
    type = "9pb"
    size = "500GB"
    iops = 10000
  }

  vpc {
    id       = nava_vpc.main.id
    firewall = "9ef"
  }

  backup {
    store     = "9ao"
    frequency = "6h"
    retention = "30d"
  }
}`;
  } else if (/(kubernetes|k8s|cluster|container)/.test(lower)) {
    resourceLabel = 'Kubernetes Cluster';
    terraformBlock = `# Nava Infrastructure — Kubernetes Cluster
resource "nava_kubernetes" "main" {
  name    = "k8s-prod-cluster"
  engine  = "9ak"
  version = "1.29"

  node_pool {
    name          = "general"
    instance_type = "9ac.cpu.xlarge"
    min_nodes     = 3
    max_nodes     = 12
    autoscale     = true
  }

  node_pool {
    name          = "gpu-workloads"
    instance_type = "9ac.gpu.a100"
    min_nodes     = 0
    max_nodes     = 4
    autoscale     = true
  }

  networking {
    vpc      = "9av"
    firewall = "9ef"
    edge     = "9ed"
  }
}`;
  } else if (/(storage|bucket|object|file|s3)/.test(lower)) {
    resourceLabel = 'Object Storage';
    terraformBlock = `# Nava Infrastructure — Object Storage
resource "nava_object_store" "assets" {
  name   = "assets-prod"
  engine = "9ao"
  region = "us-east-1"

  versioning = true

  lifecycle {
    transition_to_cold = "90d"
    expiration         = "365d"
  }

  cdn {
    engine = "9ed"
    ttl    = "24h"
  }

  encryption {
    type = "aes-256-gcm"
  }
}`;
  } else {
    resourceLabel = 'Full-Stack Environment';
    terraformBlock = `# Nava Infrastructure — Full-Stack Environment
resource "nava_environment" "production" {
  name   = "prod-env"
  region = "us-east-1"

  compute {
    engine        = "9ac"
    instance_type = "9ac.cpu.large"
    replicas      = 3
  }

  kubernetes {
    engine    = "9ak"
    version   = "1.29"
    autoscale = true
  }

  storage {
    block  = "9pb"
    object = "9ao"
  }

  networking {
    vpc      = "9av"
    firewall = "9ef"
    edge     = "9ed"
  }

  database {
    engine = "9rd"
    tier   = "standard"
  }
}`;
  }

  // Dispatch cross-module event
  window.dispatchEvent(
    new CustomEvent('nava:deploy', {
      detail: { resource: resourceLabel, timestamp: Date.now() },
    })
  );

  return `
    <p>✅ <strong>Provisioning ${resourceLabel}</strong></p>
    <p>I've generated the following Terraform configuration for your environment:</p>
    <pre><code>${escapeHTML(terraformBlock)}</code></pre>
    <p style="margin-top:.75rem;color:hsl(145,70%,50%)">
      ⚡ Resources are being provisioned on your dashboard…
    </p>
    <p style="color:hsl(225,15%,60%);font-size:.85rem;margin-top:.5rem">
      Estimated provisioning time: ~3 minutes. You'll receive a notification once all resources are healthy.
    </p>
  `;
}

/**
 * Builds a GPU comparison / recommendation response.
 */
function handleGPUIntent(lower) {
  const isLlama = /(llama|llm|large language|gpt|transformer)/.test(lower);
  const isInference = /(inference|serving|predict|run)/.test(lower);
  const isTraining = /(train|finetune|fine-tune|pre-?train)/.test(lower);

  let recommendation = '';

  if (isLlama || isTraining) {
    recommendation = `
      <p>For <strong>LLM training</strong> (Llama, GPT-class models), here's my recommendation:</p>
      <div style="margin:.75rem 0;padding:.75rem 1rem;border-left:3px solid hsl(170,85%,55%);background:hsl(225,18%,9%);border-radius:0 .5rem .5rem 0;">
        <strong style="color:hsl(170,85%,55%)">🏆 Recommended: NVIDIA H100 (9AC.GPU.H100)</strong><br>
        Best-in-class for large-scale distributed training.
      </div>
    `;
  } else if (isInference) {
    recommendation = `
      <p>For <strong>inference / model serving</strong>, here's my recommendation:</p>
      <div style="margin:.75rem 0;padding:.75rem 1rem;border-left:3px solid hsl(170,85%,55%);background:hsl(225,18%,9%);border-radius:0 .5rem .5rem 0;">
        <strong style="color:hsl(170,85%,55%)">🏆 Recommended: NVIDIA A100 (9AC.GPU.A100)</strong><br>
        Best price-to-throughput for production inference.
      </div>
    `;
  } else {
    recommendation = `
      <p>Here's a breakdown to help you choose the right GPU on Nava:</p>
    `;
  }

  return `
    ${recommendation}
    <table style="width:100%;border-collapse:collapse;margin:.75rem 0;font-size:.85rem;">
      <thead>
        <tr style="border-bottom:1px solid hsl(225,15%,20%)">
          <th style="text-align:left;padding:.5rem;color:hsl(225,15%,60%)">GPU</th>
          <th style="text-align:left;padding:.5rem;color:hsl(225,15%,60%)">VRAM</th>
          <th style="text-align:left;padding:.5rem;color:hsl(225,15%,60%)">Best For</th>
          <th style="text-align:right;padding:.5rem;color:hsl(225,15%,60%)">$/hr (Nava)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid hsl(225,15%,15%)">
          <td style="padding:.5rem;font-weight:600;color:hsl(170,85%,55%)">H100 80GB</td>
          <td style="padding:.5rem">80 GB HBM3</td>
          <td style="padding:.5rem">LLM training, 70B+ models</td>
          <td style="padding:.5rem;text-align:right">$3.49</td>
        </tr>
        <tr style="border-bottom:1px solid hsl(225,15%,15%)">
          <td style="padding:.5rem;font-weight:600;color:hsl(255,75%,68%)">A100 80GB</td>
          <td style="padding:.5rem">80 GB HBM2e</td>
          <td style="padding:.5rem">Training + inference, 7B–70B</td>
          <td style="padding:.5rem;text-align:right">$1.89</td>
        </tr>
        <tr style="border-bottom:1px solid hsl(225,15%,15%)">
          <td style="padding:.5rem;font-weight:600">A100 40GB</td>
          <td style="padding:.5rem">40 GB HBM2e</td>
          <td style="padding:.5rem">Fine-tuning, mid-size models</td>
          <td style="padding:.5rem;text-align:right">$1.29</td>
        </tr>
        <tr style="border-bottom:1px solid hsl(225,15%,15%)">
          <td style="padding:.5rem;font-weight:600">L4 24GB</td>
          <td style="padding:.5rem">24 GB GDDR6</td>
          <td style="padding:.5rem">Inference, small models</td>
          <td style="padding:.5rem;text-align:right">$0.59</td>
        </tr>
        <tr>
          <td style="padding:.5rem;font-weight:600">T4 16GB</td>
          <td style="padding:.5rem">16 GB GDDR6</td>
          <td style="padding:.5rem">Budget inference, ≤7B models</td>
          <td style="padding:.5rem;text-align:right">$0.29</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size:.85rem;color:hsl(225,15%,60%)">
      💡 <strong>Tip:</strong> For Llama 3 70B, you'll need ≥ 140 GB VRAM for full-precision training — that's 2× H100 80 GB or 4× A100 40 GB.
      Nava's <strong>9AC</strong> clusters handle multi-GPU NVLink automatically.
    </p>
  `;
}

/**
 * Builds a response pointing the user to the Simulator tab.
 */
function handleSimulateIntent() {
  window.dispatchEvent(new CustomEvent('nava:openSimulator'));

  return `
    <p>🧪 <strong>Opening the Infrastructure Simulator</strong></p>
    <p>
      I've opened the <strong>Simulator</strong> tab for you. You can use it to
      run cost projections, failure-injection tests, and load simulations
      against your Nava environments before going live.
    </p>
    <p style="margin-top:.75rem">Available simulation modes:</p>
    <ul style="margin:.5rem 0 .5rem 1.25rem;line-height:1.8">
      <li><strong>Cost Forecast</strong> — project 30/60/90-day spend</li>
      <li><strong>Chaos Engineering</strong> — simulate node failures &amp; network partitions</li>
      <li><strong>Load Test</strong> — replay production traffic at 2×–10× scale</li>
      <li><strong>GPU Benchmark</strong> — compare model throughput across GPU types</li>
    </ul>
    <p style="font-size:.85rem;color:hsl(225,15%,60%)">
      Tip: You can also ask me to "simulate deploying X" and I'll generate a dry-run plan.
    </p>
  `;
}

/**
 * Builds a cost / pricing comparison response.
 */
function handleCostIntent(lower) {
  const isGPU = /(gpu|h100|a100|l4|t4)/.test(lower);

  let intro = '';
  if (isGPU) {
    intro = `<p>💰 <strong>GPU Pricing — Nava vs. Major Cloud Providers</strong></p>`;
  } else {
    intro = `<p>💰 <strong>Nava Platform Pricing Comparison</strong></p>`;
  }

  return `
    ${intro}
    <table style="width:100%;border-collapse:collapse;margin:.75rem 0;font-size:.85rem;">
      <thead>
        <tr style="border-bottom:1px solid hsl(225,15%,20%)">
          <th style="text-align:left;padding:.5rem;color:hsl(225,15%,60%)">Resource</th>
          <th style="text-align:right;padding:.5rem;color:hsl(225,15%,60%)">Nava</th>
          <th style="text-align:right;padding:.5rem;color:hsl(225,15%,60%)">AWS</th>
          <th style="text-align:right;padding:.5rem;color:hsl(225,15%,60%)">GCP</th>
          <th style="text-align:right;padding:.5rem;color:hsl(225,15%,60%)">Azure</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid hsl(225,15%,15%)">
          <td style="padding:.5rem">H100 80GB ($/hr)</td>
          <td style="padding:.5rem;text-align:right;color:hsl(145,70%,50%);font-weight:700">$3.49</td>
          <td style="padding:.5rem;text-align:right">$5.12</td>
          <td style="padding:.5rem;text-align:right">$4.76</td>
          <td style="padding:.5rem;text-align:right">$4.90</td>
        </tr>
        <tr style="border-bottom:1px solid hsl(225,15%,15%)">
          <td style="padding:.5rem">A100 80GB ($/hr)</td>
          <td style="padding:.5rem;text-align:right;color:hsl(145,70%,50%);font-weight:700">$1.89</td>
          <td style="padding:.5rem;text-align:right">$3.06</td>
          <td style="padding:.5rem;text-align:right">$2.94</td>
          <td style="padding:.5rem;text-align:right">$3.40</td>
        </tr>
        <tr style="border-bottom:1px solid hsl(225,15%,15%)">
          <td style="padding:.5rem">Block Storage 1TB/mo</td>
          <td style="padding:.5rem;text-align:right;color:hsl(145,70%,50%);font-weight:700">$38</td>
          <td style="padding:.5rem;text-align:right">$80</td>
          <td style="padding:.5rem;text-align:right">$68</td>
          <td style="padding:.5rem;text-align:right">$77</td>
        </tr>
        <tr style="border-bottom:1px solid hsl(225,15%,15%)">
          <td style="padding:.5rem">Managed K8s ($/mo)</td>
          <td style="padding:.5rem;text-align:right;color:hsl(145,70%,50%);font-weight:700">$0</td>
          <td style="padding:.5rem;text-align:right">$73</td>
          <td style="padding:.5rem;text-align:right">$73</td>
          <td style="padding:.5rem;text-align:right">$73</td>
        </tr>
        <tr>
          <td style="padding:.5rem">Egress per GB</td>
          <td style="padding:.5rem;text-align:right;color:hsl(145,70%,50%);font-weight:700">$0.005</td>
          <td style="padding:.5rem;text-align:right">$0.09</td>
          <td style="padding:.5rem;text-align:right">$0.08</td>
          <td style="padding:.5rem;text-align:right">$0.087</td>
        </tr>
      </tbody>
    </table>
    <div style="margin:.75rem 0;padding:.75rem 1rem;border-left:3px solid hsl(145,70%,50%);background:hsl(225,18%,9%);border-radius:0 .5rem .5rem 0;">
      <strong style="color:hsl(145,70%,50%)">Estimated savings with Nava: 40–65%</strong><br>
      <span style="font-size:.85rem;color:hsl(225,15%,60%)">
        Based on typical AI/ML workloads running 720 hrs/mo. Nava's 9AK managed
        Kubernetes is free — you only pay for compute and storage.
      </span>
    </div>
    <p style="font-size:.85rem;color:hsl(225,15%,60%)">
      Ask me to <em>"deploy"</em> any resource and I'll generate the Terraform config automatically.
    </p>
  `;
}

/**
 * Builds a scaling confirmation response with a YAML config block.
 */
function handleScaleIntent(lower) {
  let target = 'cluster';
  let yamlConfig = '';

  if (/(gpu|compute|node)/.test(lower)) {
    target = 'compute nodes';
    yamlConfig = `# Nava 9AK — Scaling Configuration
apiVersion: nava.io/v1
kind: ScalingPolicy
metadata:
  name: gpu-compute-autoscaler
  namespace: production
spec:
  target:
    kind: NodePool
    name: gpu-workloads
  engine: 9ak
  compute: 9ac
  scaling:
    minReplicas: 2
    maxReplicas: 16
    metrics:
      - type: gpu-utilization
        target: 75%
      - type: queue-depth
        target: 100
    cooldown:
      scaleUp: 60s
      scaleDown: 300s
  storage:
    engine: 9pb
    autoExpand: true
    maxSize: 10TB`;
  } else if (/(database|db|data)/.test(lower)) {
    target = 'database cluster';
    yamlConfig = `# Nava 9RD — Database Scaling
apiVersion: nava.io/v1
kind: DatabaseScaling
metadata:
  name: primary-db-scaling
spec:
  engine: 9rd
  readReplicas:
    min: 2
    max: 8
    targetCPU: 70%
  storage:
    engine: 9pb
    autoExpand: true
    maxSize: 5TB
  connectionPool:
    maxConnections: 500
    idleTimeout: 30s`;
  } else {
    target = 'infrastructure';
    yamlConfig = `# Nava Platform — Horizontal Scaling
apiVersion: nava.io/v1
kind: ScalingPolicy
metadata:
  name: infra-autoscaler
  namespace: production
spec:
  compute:
    engine: 9ac
    minInstances: 3
    maxInstances: 24
    targetCPU: 65%
  kubernetes:
    engine: 9ak
    nodeAutoProvisioning: true
  networking:
    edge: 9ed
    loadBalancing: round-robin
    healthCheck:
      interval: 10s
      threshold: 3
  alerts:
    slack: "#infra-alerts"
    pagerduty: true`;
  }

  return `
    <p>📈 <strong>Scaling ${target}</strong></p>
    <p>I've generated a scaling policy for your ${target}. Review the configuration below:</p>
    <pre><code>${escapeHTML(yamlConfig)}</code></pre>
    <p style="margin-top:.75rem;color:hsl(170,85%,55%)">
      ✅ Auto-scaling policy is ready to apply. The system will dynamically adjust
      resources based on your defined metrics.
    </p>
    <p style="font-size:.85rem;color:hsl(225,15%,60%);margin-top:.5rem">
      Current utilisation will be reflected on the dashboard within 30 seconds.
    </p>
  `;
}

/**
 * Returns a helpful fallback when no intent is matched.
 */
function handleFallback() {
  return `
    <p>👋 I'm <strong>Nava AI</strong>, your infrastructure co-pilot. Here's what I can help with:</p>
    <ul style="margin:.5rem 0 .5rem 1.25rem;line-height:1.9">
      <li><strong>Deploy resources</strong> — <em>"Deploy an LLM training cluster"</em></li>
      <li><strong>GPU guidance</strong> — <em>"Which GPU is best for Llama 3?"</em></li>
      <li><strong>Cost analysis</strong> — <em>"Compare GPU pricing vs AWS"</em></li>
      <li><strong>Scale infra</strong> — <em>"Scale up my compute nodes"</em></li>
      <li><strong>Simulate</strong> — <em>"Run a load test simulation"</em></li>
      <li><strong>Generate configs</strong> — <em>"Create a Kubernetes cluster"</em></li>
    </ul>
    <p style="font-size:.85rem;color:hsl(225,15%,60%)">
      You can also use the quick-action chips below the input box to get started.
    </p>
  `;
}

// ─── Message Rendering ───────────────────────────────────────

/**
 * Adds a styled message bubble to the AI messages container.
 * @param {'user'|'bot'} type — Who sent the message
 * @param {string} content — HTML string to render inside the bubble
 */
export function addMessage(type, content) {
  if (!messagesContainer) {
    messagesContainer = document.getElementById('ai-messages');
  }
  if (!messagesContainer) return;

  const wrapper = document.createElement('div');
  wrapper.className = `ai-message ai-message--${type}`;

  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (type === 'bot') {
    wrapper.innerHTML = `
      <div class="ai-message__avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(170,85%,55%)" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="ai-message__body">
        <div class="ai-message__content">${content}</div>
        <span class="ai-message__time">${timestamp}</span>
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="ai-message__body">
        <div class="ai-message__content">${content}</div>
        <span class="ai-message__time">${timestamp}</span>
      </div>
    `;
  }

  messagesContainer.appendChild(wrapper);
  scrollToBottom();
}

// ─── Typing Indicator ───────────────────────────────────────

/**
 * Shows a typing indicator with three bouncing dots inside the
 * AI messages container.
 */
export function showTyping() {
  if (!messagesContainer) {
    messagesContainer = document.getElementById('ai-messages');
  }
  if (!messagesContainer) return;

  // Prevent duplicate indicators
  hideTyping();

  const indicator = document.createElement('div');
  indicator.className = 'ai-message ai-message--bot ai-typing-indicator';
  indicator.innerHTML = `
    <div class="ai-message__avatar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(170,85%,55%)" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div class="ai-message__body">
      <div class="ai-typing-dots">
        <span class="ai-typing-dot" style="animation-delay:0s"></span>
        <span class="ai-typing-dot" style="animation-delay:0.15s"></span>
        <span class="ai-typing-dot" style="animation-delay:0.3s"></span>
      </div>
    </div>
  `;

  messagesContainer.appendChild(indicator);
  scrollToBottom();
}

/**
 * Removes the typing indicator from the messages container.
 */
export function hideTyping() {
  if (!messagesContainer) {
    messagesContainer = document.getElementById('ai-messages');
  }
  if (!messagesContainer) return;

  const existing = messagesContainer.querySelector('.ai-typing-indicator');
  if (existing) existing.remove();
}

// ─── Utilities ───────────────────────────────────────────────

/**
 * Scrolls the messages container to its bottom edge.
 */
function scrollToBottom() {
  if (!messagesContainer) return;
  requestAnimationFrame(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

/**
 * Escapes HTML entities in a string to prevent injection.
 * @param {string} str — Raw string
 * @returns {string} Escaped string safe for innerHTML
 */
function escapeHTML(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}
