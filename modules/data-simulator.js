// ─────────────────────────────────────────────────────────────
//  data-simulator.js  —  Nava Platform Hub · Data Simulator
//  Generates realistic simulated cloud-infrastructure & AI engine data
// ─────────────────────────────────────────────────────────────

/* ═══════════════════════════════════════════════════════════
   Constants & Pricing
   ═══════════════════════════════════════════════════════════ */

export const GPU_PRICING = Object.freeze({
  h100: 3.50,
  a100: 2.10,
  b200: 5.20,
  l40s: 1.40,
});

export const COMPETITOR_PRICING = Object.freeze([
  { name: 'Nava',        h100: 3.50,  a100: 2.10 },
  { name: 'Lambda Labs', h100: 2.49,  a100: 1.49 },
  { name: 'CoreWeave',   h100: 4.76,  a100: 2.21 },
  { name: 'RunPod',      h100: 3.89,  a100: 2.19 },
  { name: 'AWS',         h100: 12.29, a100: 4.10 },
]);

/* ─── Internal helpers ─────────────────────────────────────── */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const randFloat = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(randFloat(min, max + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const pad2 = (n) => String(n).padStart(2, '0');

/* ─── GPU model catalogue ─────────────────────────────────── */
const GPU_MODELS = [
  { model: 'NVIDIA H100 SXM 80GB',  vramTotal: 80,  powerMax: 700 },
  { model: 'NVIDIA A100 SXM 80GB',  vramTotal: 80,  powerMax: 400 },
  { model: 'NVIDIA B200 SXM 192GB', vramTotal: 192, powerMax: 1000 },
  { model: 'NVIDIA A100 PCIe 40GB', vramTotal: 40,  powerMax: 300 },
  { model: 'NVIDIA H100 NVL 94GB',  vramTotal: 94,  powerMax: 400 },
  { model: 'NVIDIA L40S 48GB',      vramTotal: 48,  powerMax: 350 },
];

/* ─── Activity templates ──────────────────────────────────── */
const ACTIVITY_TEMPLATES = [
  {
    type: 'deploy',
    texts: [
      '<strong>gpu-cluster-01</strong> deployed with 4x H100 nodes',
      '<strong>vLLM inference-svc</strong> rolled out to prod-inference-01',
      '<strong>SGLang deepseek-r1</strong> deployed to ap-south-1 region',
      '<strong>TensorRT-LLM server</strong> deployed on 8x B200 SXM',
    ],
  },
  {
    type: 'scale',
    texts: [
      '<strong>prod-inference-01</strong> scaled from 6 → 8 nodes',
      '<strong>vLLM worker pool</strong> autoscaled to 16 replicas',
      '<strong>embedding-svc</strong> scaled down to 2 replicas (low traffic)',
      '<strong>gpu-pool-us-east</strong> expanded by 4 H100 nodes',
    ],
  },
  {
    type: 'alert',
    texts: [
      'High KV-Cache pressure on <strong>gpu-node-04</strong> (92% VRAM Paged)',
      'RoCEv2 PFC pause frame spike in <strong>leaf-sw-02</strong>',
      'TTFT latency threshold exceeded on <strong>llama3-70b-vllm</strong> (↑ 42ms)',
      'DCGM thermal throttling warning on <strong>gpu-node-03</strong> (84°C)',
    ],
  },
  {
    type: 'error',
    texts: [
      '<strong>gpu-node-06</strong> Xid 79 (GPU fallen off bus) — isolated by Operator',
      'OOM kill on <strong>sglang-qwen-2.5</strong> (requested 78 GB VRAM)',
      'PCIe bus width degradation on <strong>gpu-node-02</strong> (x16 → x4)',
      'GPUDirect RDMA link failure on <strong>connectx-7-port-1</strong>',
    ],
  },
];

const TIME_LABELS = [
  '1m ago', '2m ago', '4m ago', '7m ago',
  '12m ago', '18m ago', '25m ago', '34m ago',
  '42m ago', '1h ago', '1h 15m ago', '2h ago',
];

/* ═══════════════════════════════════════════════════════════
   Exported generators
   ═══════════════════════════════════════════════════════════ */

export const generateGPUFleet = (count = 6) => {
  const idleIndices = new Set();
  const errorIndices = new Set();
  const idleCount = count >= 4 ? randInt(1, 2) : (count >= 2 ? 1 : 0);

  while (idleIndices.size < idleCount) {
    idleIndices.add(randInt(0, count - 1));
  }

  if (count >= 5 && Math.random() < 0.3) {
    let idx;
    do { idx = randInt(0, count - 1); } while (idleIndices.has(idx));
    errorIndices.add(idx);
  }

  return Array.from({ length: count }, (_, i) => {
    const spec = GPU_MODELS[i % GPU_MODELS.length];
    const isIdle  = idleIndices.has(i);
    const isError = errorIndices.has(i);

    let status = 'active';
    let utilization, vram, temperature, power;

    if (isError) {
      status = 'error';
      utilization = 0;
      vram = 0;
      temperature = randInt(28, 35);
      power = randInt(40, 80);
    } else if (isIdle) {
      status = 'idle';
      utilization = randInt(0, 5);
      vram = +(randFloat(0.5, spec.vramTotal * 0.08)).toFixed(1);
      temperature = randInt(30, 42);
      power = randInt(50, 120);
    } else {
      utilization = randInt(55, 98);
      vram = +(randFloat(spec.vramTotal * 0.45, spec.vramTotal * 0.92)).toFixed(1);
      temperature = randInt(58, 85);
      power = randInt(Math.round(spec.powerMax * 0.4), Math.round(spec.powerMax * 0.85));
    }

    return {
      id: `gpu-node-${pad2(i + 1)}`,
      name: `GPU Node ${pad2(i + 1)}`,
      model: spec.model,
      status,
      utilization,
      vram,
      vramTotal: spec.vramTotal,
      temperature,
      power,
      powerMax: spec.powerMax,
    };
  });
};

export const generateK8sClusters = () => {
  const regions = ['ap-south-1', 'us-east-1', 'eu-west-1'];
  const names   = ['prod-inference-01', 'staging-ml-02', 'batch-training-03'];

  return names.map((name, i) => {
    const nodes   = randInt(4, 16);
    const running = randInt(30, 72);
    const pending = randInt(0, 4);
    const failed  = i === 0 ? 0 : randInt(0, 2);

    let status = 'healthy';
    if (failed > 0 || pending > 3) status = 'degraded';
    if (failed > 1) status = 'critical';

    return {
      name,
      nodes,
      pods: { running, pending, failed },
      status,
      cpu: randInt(35, 88),
      memory: randInt(40, 82),
      region: regions[i],
    };
  });
};

export const generateActivityFeed = () => {
  const feed = [];
  const usedTexts = new Set();
  const requiredTypes = ['deploy', 'scale', 'alert', 'error'];

  requiredTypes.forEach((type) => {
    const group = ACTIVITY_TEMPLATES.find((g) => g.type === type);
    const text  = pick(group.texts);
    usedTexts.add(text);
    feed.push({ type, time: '', text });
  });

  while (feed.length < 8) {
    const group = pick(ACTIVITY_TEMPLATES);
    const text  = pick(group.texts);
    if (!usedTexts.has(text)) {
      usedTexts.add(text);
      feed.push({ type: group.type, time: '', text });
    }
  }

  const result = feed.slice(0, 8);
  for (let i = result.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  result.forEach((item, i) => {
    item.time = TIME_LABELS[i] || `${randInt(2, 5)}h ago`;
  });

  return result;
};

export const updateMetrics = (fleet) => {
  fleet.forEach((node) => {
    if (node.status === 'error') return;
    const delta = () => randFloat(-3, 3);
    node.utilization = Math.round(clamp(node.utilization + delta(), node.status === 'idle' ? 0 : 30, 100));
    node.vram = +(clamp(node.vram + randFloat(-1.5, 1.5), 0.1, node.vramTotal * 0.95)).toFixed(1);
    node.temperature = Math.round(clamp(node.temperature + delta(), 28, 92));
    node.power = Math.round(clamp(node.power + randFloat(-8, 8), 40, node.powerMax * 0.9));
  });
  return fleet;
};

export const generateTimeSeriesData = (points = 60, baseValue = 50, variance = 20) => {
  const frequency  = randFloat(0.8, 1.6);
  const phase      = randFloat(0, Math.PI * 2);
  const noiseScale = variance * 0.35;

  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const sine  = Math.sin(2 * Math.PI * frequency * t + phase);
    const noise = (Math.random() - 0.5) * 2 * noiseScale;
    const y     = baseValue + sine * (variance * 0.65) + noise;

    return {
      x: i,
      y: +clamp(y, 0, baseValue * 2.5).toFixed(2),
    };
  });
};

export const generateStatsData = () => {
  const totalGPUs  = randInt(20, 32);
  const activeGPUs = totalGPUs - randInt(1, 4);
  const totalVMs   = randInt(120, 200);

  const throughput = randInt(700, 980);
  const storageTB  = +(randFloat(8, 18)).toFixed(1);
  const uptime     = +(randFloat(99.90, 99.99)).toFixed(2);

  return {
    totalGPUs,
    activeGPUs,
    totalVMs,
    networkThroughput: `${throughput} Gbps`,
    storageUsed: `${storageTB} TB`,
    uptimePercent: uptime,
  };
};

/* ═══════════════════════════════════════════════════════════
   NEW GENERATORS: Inference Stack, SRE DCGM & Network Fabric
   ═══════════════════════════════════════════════════════════ */

/**
 * Generate Live Inference Engine Telemetry (vLLM, SGLang, TensorRT-LLM).
 */
export const generateInferenceMetrics = () => {
  return {
    engines: [
      { name: 'vLLM (PagedAttention)', activeModels: 4, avgTTFT: '14 ms', avgITL: '9 ms', throughput: '184 t/s', kvCacheUsage: 78, efficiency: '94%' },
      { name: 'SGLang (RadixAttention)', activeModels: 3, avgTTFT: '11 ms', avgITL: '8 ms', throughput: '210 t/s', kvCacheUsage: 64, efficiency: '97%' },
      { name: 'TensorRT-LLM (CUDA Graphs)', activeModels: 2, avgTTFT: '9 ms', avgITL: '6 ms', throughput: '245 t/s', kvCacheUsage: 82, efficiency: '99%' }
    ],
    deployments: [
      { model: 'LLaMA-3-70B-Instruct', engine: 'vLLM', quantization: 'FP8', gpus: '4x H100 SXM', ttft: '14 ms', itl: '9 ms', throughput: '184 t/s', status: 'Healthy' },
      { model: 'DeepSeek-R1-671B', engine: 'SGLang', quantization: 'AWQ 4-bit', gpus: '8x B200 SXM', ttft: '18 ms', itl: '11 ms', throughput: '210 t/s', status: 'Healthy' },
      { model: 'Qwen-2.5-Coder-32B', engine: 'TensorRT-LLM', quantization: 'FP8', gpus: '2x H100 NVL', ttft: '9 ms', itl: '6 ms', throughput: '245 t/s', status: 'Optimal' },
      { model: 'Whisper-Large-v3 (Voice)', engine: 'vLLM', quantization: 'FP16', gpus: '1x L40S', ttft: '8 ms', itl: '4 ms', throughput: '310 t/s', status: 'Healthy' }
    ]
  };
};

/**
 * Generate DCGM Bare-Metal Hardware Telemetry & Xid Error Stream.
 */
export const generateDCGMMetrics = () => {
  return {
    dcgmStats: {
      smOccupancy: 88,
      avgPowerWatts: 420,
      maxPowerWatts: 700,
      pcieBandwidth: '61.4 GB/s',
      nvlinkBandwidth: '880 GB/s',
      driverVersion: 'NVIDIA 550.54.14',
      cudaVersion: '12.4'
    },
    xidLogs: [
      { id: 'ERR-901', time: '1m ago', node: 'gpu-node-06', code: 'Xid 79', desc: 'GPU fallen off bus — PCIe link lost', severity: 'CRITICAL', action: 'Auto-Isolate via Operator' },
      { id: 'ERR-884', time: '14m ago', node: 'gpu-node-03', code: 'Xid 62', desc: 'Page Retirement — Dynamic memory page isolation', severity: 'WARNING', action: 'Page Retired' },
      { id: 'ERR-872', time: '45m ago', node: 'gpu-node-04', code: 'Thermal', desc: 'GPU Temp reached 84°C — Fan speed increased to 100%', severity: 'WARNING', action: 'Cooling Tuned' },
      { id: 'ERR-850', time: '2h ago', node: 'gpu-node-02', code: 'Xid 31', desc: 'Memory Exception — Single-bit ECC corrected', severity: 'INFO', action: 'Logged' }
    ]
  };
};

/**
 * Generate Network Fabric Metrics (InfiniBand / RoCEv2 / GPUDirect RDMA).
 */
export const generateNetworkFabricData = () => {
  return {
    fabricType: 'RoCEv2 over 800G Ethernet',
    topology: 'Clos / Leaf-Spine (24-Leaf, 8-Spine)',
    rdmaLatency: '1.4 µs',
    throughputGbps: 784,
    pfcPauseFrames: 14,
    ecnCongestionRate: '0.02%',
    dpuHardware: 'NVIDIA BlueField-3 DPU & ConnectX-7 NICs',
    switches: 'NVIDIA Quantum-2 & Spectrum-4'
  };
};
