// ─────────────────────────────────────────────────────────────
//  data-simulator.js  —  Nava Platform Hub · Data Simulator
//  Generates realistic simulated cloud-infrastructure data
// ─────────────────────────────────────────────────────────────

/* ═══════════════════════════════════════════════════════════
   Constants & Pricing
   ═══════════════════════════════════════════════════════════ */

/**
 * Hourly GPU instance pricing in USD.
 * @type {{ h100: number, a100: number, b200: number, l40s: number }}
 */
export const GPU_PRICING = Object.freeze({
  h100: 3.50,
  a100: 2.10,
  b200: 5.20,
  l40s: 1.40,
});

/**
 * Competitor pricing comparison (hourly, USD).
 * @type {Array<{ name: string, h100: number, a100: number }>}
 */
export const COMPETITOR_PRICING = Object.freeze([
  { name: 'Nava',        h100: 3.50,  a100: 2.10 },
  { name: 'Lambda Labs', h100: 2.49,  a100: 1.49 },
  { name: 'CoreWeave',   h100: 4.76,  a100: 2.21 },
  { name: 'RunPod',      h100: 3.89,  a100: 2.19 },
  { name: 'AWS',         h100: 12.29, a100: 4.10 },
]);

/* ═══════════════════════════════════════════════════════════
   Internal helpers
   ═══════════════════════════════════════════════════════════ */

/** Clamp a number between min and max. */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** Random float in [min, max). */
const randFloat = (min, max) => min + Math.random() * (max - min);

/** Random integer in [min, max] (inclusive). */
const randInt = (min, max) => Math.floor(randFloat(min, max + 1));

/** Pick a random element from an array. */
const pick = (arr) => arr[randInt(0, arr.length - 1)];

/** Zero-pad a number to two digits. */
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
      '<strong>inference-svc-v3</strong> rolled out to prod-inference-01',
      '<strong>llm-gateway</strong> deployed to ap-south-1 region',
      '<strong>model-server-bert</strong> deployed with 2x A100 nodes',
    ],
  },
  {
    type: 'scale',
    texts: [
      '<strong>prod-inference-01</strong> scaled from 6 → 8 nodes',
      '<strong>batch-training</strong> autoscaled to 12 replicas',
      '<strong>embedding-svc</strong> scaled down to 2 replicas (low traffic)',
      '<strong>gpu-pool-us-east</strong> expanded by 3 B200 nodes',
    ],
  },
  {
    type: 'alert',
    texts: [
      'High memory pressure on <strong>gpu-node-04</strong> (91 % VRAM)',
      'Network latency spike in <strong>ap-south-1</strong> (↑ 12 ms)',
      'Disk IOPS threshold exceeded on <strong>storage-nfs-02</strong>',
      'Pod restart loop detected for <strong>metrics-collector</strong>',
    ],
  },
  {
    type: 'error',
    texts: [
      '<strong>gpu-node-06</strong> ECC uncorrectable error — node cordoned',
      'OOM kill on <strong>training-job-8821</strong> (requested 78 GB)',
      'TLS certificate expiry warning for <strong>api.nava.cloud</strong>',
      'NVLink failure between <strong>gpu-node-02</strong> and <strong>gpu-node-03</strong>',
    ],
  },
];

/* ─── Time labels for activity feed ───────────────────────── */
const TIME_LABELS = [
  '1m ago', '2m ago', '4m ago', '7m ago',
  '12m ago', '18m ago', '25m ago', '34m ago',
  '42m ago', '1h ago', '1h 15m ago', '2h ago',
];

/* ═══════════════════════════════════════════════════════════
   Exported generators
   ═══════════════════════════════════════════════════════════ */

/**
 * Generate a fleet of GPU node objects.
 *
 * @param {number} [count=6] — Number of GPU nodes to generate.
 * @returns {Array<{
 *   id: string,
 *   name: string,
 *   model: string,
 *   status: 'active'|'idle'|'error',
 *   utilization: number,
 *   vram: number,
 *   vramTotal: number,
 *   temperature: number,
 *   power: number,
 *   powerMax: number
 * }>}
 */
export const generateGPUFleet = (count = 6) => {
  // Decide which indices will be idle / error
  const idleIndices = new Set();
  const errorIndices = new Set();

  // Guarantee 1-2 idle nodes
  const idleCount = count >= 4 ? randInt(1, 2) : (count >= 2 ? 1 : 0);
  while (idleIndices.size < idleCount) {
    idleIndices.add(randInt(0, count - 1));
  }

  // Optionally one error node (30 % chance, never overlapping idle)
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

/**
 * Generate Kubernetes cluster objects.
 *
 * @returns {Array<{
 *   name: string,
 *   nodes: number,
 *   pods: { running: number, pending: number, failed: number },
 *   status: 'healthy'|'degraded'|'critical',
 *   cpu: number,
 *   memory: number,
 *   region: string
 * }>}
 */
export const generateK8sClusters = () => {
  const regions = ['ap-south-1', 'us-east-1', 'eu-west-1'];
  const names   = ['prod-inference-01', 'staging-ml-02', 'batch-training-03'];

  return names.map((name, i) => {
    const nodes   = randInt(4, 16);
    const running = randInt(30, 72);
    const pending = randInt(0, 4);
    const failed  = i === 0 ? 0 : randInt(0, 2); // prod cluster rarely fails

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

/**
 * Generate a realistic activity feed of recent cloud operations.
 *
 * @returns {Array<{
 *   type: 'deploy'|'scale'|'alert'|'error',
 *   time: string,
 *   text: string
 * }>}
 */
export const generateActivityFeed = () => {
  const feed = [];
  const usedTexts = new Set();

  // Ensure at least one of each type appears
  const requiredTypes = ['deploy', 'scale', 'alert', 'error'];
  requiredTypes.forEach((type) => {
    const group = ACTIVITY_TEMPLATES.find((g) => g.type === type);
    const text  = pick(group.texts);
    usedTexts.add(text);
    feed.push({ type, time: '', text });
  });

  // Fill remaining slots with random types
  while (feed.length < 8) {
    const group = pick(ACTIVITY_TEMPLATES);
    const text  = pick(group.texts);
    if (!usedTexts.has(text)) {
      usedTexts.add(text);
      feed.push({ type: group.type, time: '', text });
    }
    // If we can't find unique text after exhausting options, allow dupes
    if (usedTexts.size >= ACTIVITY_TEMPLATES.reduce((s, g) => s + g.texts.length, 0)) {
      feed.push({ type: group.type, time: '', text });
    }
  }

  // Trim to exactly 8 and assign chronological time labels
  const result = feed.slice(0, 8);
  // Shuffle so the required types aren't always first
  for (let i = result.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  result.forEach((item, i) => {
    item.time = TIME_LABELS[i] || `${randInt(2, 5)}h ago`;
  });

  return result;
};

/**
 * Mutate a GPU fleet's metrics in-place by small random deltas.
 * Simulates live metric streaming.
 *
 * @param {Array<Object>} fleet — The GPU fleet array to mutate.
 * @returns {Array<Object>} The same array (mutated in place).
 */
export const updateMetrics = (fleet) => {
  fleet.forEach((node) => {
    if (node.status === 'error') return; // dead nodes don't fluctuate

    const delta = () => randFloat(-3, 3);

    // Utilization
    node.utilization = Math.round(
      clamp(node.utilization + delta(), node.status === 'idle' ? 0 : 30, 100)
    );

    // VRAM
    node.vram = +(
      clamp(node.vram + randFloat(-1.5, 1.5), 0.1, node.vramTotal * 0.95)
    ).toFixed(1);

    // Temperature
    node.temperature = Math.round(
      clamp(node.temperature + delta(), 28, 92)
    );

    // Power
    node.power = Math.round(
      clamp(node.power + randFloat(-8, 8), 40, node.powerMax * 0.9)
    );
  });

  return fleet;
};

/**
 * Generate time-series data points using a sine wave base with random noise.
 * Useful for rendering sparkline / area / line charts.
 *
 * @param {number} [points=60]      — Number of data points.
 * @param {number} [baseValue=50]   — Central value the wave oscillates around.
 * @param {number} [variance=20]    — Amplitude of the sine wave + noise ceiling.
 * @returns {Array<{ x: number, y: number }>}
 */
export const generateTimeSeriesData = (points = 60, baseValue = 50, variance = 20) => {
  const frequency  = randFloat(0.8, 1.6);  // cycles across the data window
  const phase      = randFloat(0, Math.PI * 2);
  const noiseScale = variance * 0.35;       // noise ≈ 35 % of variance

  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);                          // 0 → 1
    const sine  = Math.sin(2 * Math.PI * frequency * t + phase);
    const noise = (Math.random() - 0.5) * 2 * noiseScale;
    const y     = baseValue + sine * (variance * 0.65) + noise;

    return {
      x: i,
      y: +clamp(y, 0, baseValue * 2.5).toFixed(2),
    };
  });
};

/**
 * Generate top-level dashboard statistics.
 *
 * @returns {{
 *   totalGPUs: number,
 *   activeGPUs: number,
 *   totalVMs: number,
 *   networkThroughput: string,
 *   storageUsed: string,
 *   uptimePercent: number
 * }}
 */
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
