// ─────────────────────────────────────────────────────────────
//  data-simulator.js  —  Nava Platform Hub · Data Simulator
//  Generates realistic simulated cloud-infrastructure & AI engine data
// ─────────────────────────────────────────────────────────────

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

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const randFloat = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(randFloat(min, max + 1));

/**
 * Generate DCGM Bare-Metal Hardware Telemetry with live dynamic fluctuations.
 */
export const generateDCGMMetrics = () => {
  const smOcc = randInt(82, 96);
  const power = randInt(415, 485);
  const pcieBw = (randFloat(58.2, 63.8)).toFixed(1);

  return {
    dcgmStats: {
      smOccupancy: smOcc,
      avgPowerWatts: power,
      maxPowerWatts: 700,
      pcieBandwidth: `${pcieBw} GB/s`,
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
