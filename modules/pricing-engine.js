/**
 * Pricing Engine Module
 * Manages the cost sidebar.
 */
import { GPU_PRICING, COMPETITOR_PRICING } from './data-simulator.js';

let resources = [];
let currentScenario = 'current';

export function initPricing() {
  const exportBtn = document.getElementById('export-pdf');
  if (exportBtn) exportBtn.addEventListener('click', exportPDF);
  
  const scenarioBtns = document.querySelectorAll('.scenario-btn');
  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      scenarioBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentScenario = e.target.dataset.scenario;
      renderScenarioComparison();
    });
  });
  
  window.addEventListener('nava:resourceAdded', (e) => {
    addResource(e.detail);
  });
  
  window.addEventListener('nava:resourceRemoved', (e) => {
    removeResource(e.detail.id);
  });
  
  renderCompetitorPrices();
  renderPerfScores();
  renderCostItems();
  renderScenarioComparison();
}

export function addResource(resource) {
  resources.push(resource);
  renderCostItems();
  updateTotalCost();
  renderScenarioComparison();
}

export function removeResource(id) {
  resources = resources.filter(r => r.id !== id);
  renderCostItems();
  updateTotalCost();
  renderScenarioComparison();
}

function renderCostItems() {
  const container = document.getElementById('cost-items');
  if (!container) return;
  
  if (resources.length === 0) {
    container.innerHTML = '<div class="cost-empty">No resources provisioned</div>';
    return;
  }
  
  let html = '';
  let totalHourly = 0;
  
  resources.forEach(r => {
    totalHourly += r.hourlyRate;
    html += `
      <div class="cost-item">
        <div class="cost-item-name">
          <div>${r.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-tertiary)">${r.gpuCount}x ${r.gpuType.toUpperCase()}</div>
        </div>
        <div class="cost-item-value">$${r.monthlyRate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</div>
      </div>
    `;
  });
  
  html += `
    <div style="margin-top: 8px; text-align: right; font-size: 0.75rem; color: var(--text-secondary)">
      Hourly rate: $${totalHourly.toFixed(2)}/hr
    </div>
  `;
  
  container.innerHTML = html;
}

function updateTotalCost() {
  const total = resources.reduce((sum, r) => sum + r.monthlyRate, 0);
  const el = document.getElementById('total-cost');
  if (el) el.textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}`;
}

function renderPerfScores() {
  const container = document.getElementById('perf-scores');
  if (!container) return;
  
  const scores = [
    { name: 'L40S', score: 92, color: 'var(--success)' },
    { name: 'H100', score: 85, color: 'var(--primary)' },
    { name: 'A100', score: 72, color: 'var(--info)' },
    { name: 'B200', score: 65, color: 'var(--secondary)' }
  ];
  
  container.innerHTML = scores.map(s => `
    <div class="perf-score-item">
      <span class="perf-gpu-name">${s.name}</span>
      <div class="perf-bar"><div class="perf-bar-fill" style="width: ${s.score}%; background: ${s.color}"></div></div>
      <span class="perf-score-val">${s.score}</span>
    </div>
  `).join('');
}

function renderScenarioComparison() {
  const container = document.getElementById('scenario-comparison');
  if (!container) return;
  
  const totalMonthly = resources.reduce((sum, r) => sum + r.monthlyRate, 0);
  const storageCost = 160; // simulated base cost
  const netCost = 45; // simulated base cost
  
  let computeCost = totalMonthly;
  let savings = 0;
  
  if (currentScenario === 'optimized') {
    // Simulate 20% savings via spot / right-sizing
    savings = computeCost * 0.20;
    computeCost = computeCost - savings;
  }
  
  const total = computeCost + storageCost + netCost;
  
  container.innerHTML = `
    <div class="scenario-row">
      <span class="scenario-label">Compute (9AC/9AK)</span>
      <span class="scenario-value">$${computeCost.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
    </div>
    <div class="scenario-row">
      <span class="scenario-label">Storage (9PB)</span>
      <span class="scenario-value">$${storageCost.toFixed(2)}</span>
    </div>
    <div class="scenario-row">
      <span class="scenario-label">Networking (9AV)</span>
      <span class="scenario-value">$${netCost.toFixed(2)}</span>
    </div>
    <div class="scenario-row" style="margin-top: 8px; border-top: 1px solid var(--glass-border); padding-top: 8px;">
      <span class="scenario-label" style="font-weight: 600; color: var(--text-primary)">Total Estimated</span>
      <span class="scenario-value" style="color: var(--text-primary)">$${total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
    </div>
    ${savings > 0 ? `
    <div class="scenario-row">
      <span class="scenario-label">Optimization Savings</span>
      <span class="scenario-value savings">-$${savings.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} (20%)</span>
    </div>
    ` : ''}
  `;
}

function renderCompetitorPrices() {
  const container = document.getElementById('competitor-prices');
  if (!container) return;
  
  // Sort by H100 price
  const sorted = [...COMPETITOR_PRICING].sort((a, b) => a.h100 - b.h100);
  const navaPrice = COMPETITOR_PRICING.find(c => c.name === 'Nava').h100;
  
  container.innerHTML = sorted.map(c => {
    let priceClass = '';
    if (c.name === 'Nava') priceClass = 'ours';
    else if (c.h100 < navaPrice) priceClass = 'lower';
    else if (c.h100 > navaPrice) priceClass = 'higher';
    
    return `
      <div class="competitor-item">
        <span class="competitor-name">
          ${c.name}
          ${c.name === 'Nava' ? '<span style="font-size: 0.6rem; background: var(--primary-glow); padding: 2px 6px; border-radius: 10px; color: var(--primary)">YOU</span>' : ''}
        </span>
        <span class="competitor-price ${priceClass}">$${c.h100.toFixed(2)} /hr</span>
      </div>
    `;
  }).join('');
}

function exportPDF() {
  const totalMonthly = resources.reduce((sum, r) => sum + r.monthlyRate, 0);
  let text = `=======================================\n`;
  text += `NAVA PLATFORM HUB - COST ESTIMATE\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  text += `=======================================\n\n`;
  
  text += `PROVISIONED RESOURCES:\n`;
  if (resources.length === 0) text += `(No resources provisioned)\n`;
  
  resources.forEach(r => {
    text += `- ${r.name} (${r.gpuCount}x ${r.gpuType.toUpperCase()}): $${r.monthlyRate.toFixed(2)} /mo\n`;
  });
  
  text += `\n---------------------------------------\n`;
  text += `ESTIMATED MONTHLY TOTAL: $${totalMonthly.toFixed(2)}\n`;
  text += `---------------------------------------\n\n`;
  
  text += `*Estimate assumes 730 hours per month.\n`;
  text += `*Does not include variable data egress fees.\n`;
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nava-cost-estimate.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
