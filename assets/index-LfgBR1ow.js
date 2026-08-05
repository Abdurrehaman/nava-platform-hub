(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),Object.freeze({h100:3.5,a100:2.1,b200:5.2,l40s:1.4}),Object.freeze([{name:`Nava`,h100:3.5,a100:2.1},{name:`Lambda Labs`,h100:2.49,a100:1.49},{name:`CoreWeave`,h100:4.76,a100:2.21},{name:`RunPod`,h100:3.89,a100:2.19},{name:`AWS`,h100:12.29,a100:4.1}]);var e=()=>({dcgmStats:{smOccupancy:88,avgPowerWatts:420,maxPowerWatts:700,pcieBandwidth:`61.4 GB/s`,nvlinkBandwidth:`880 GB/s`,driverVersion:`NVIDIA 550.54.14`,cudaVersion:`12.4`},xidLogs:[{id:`ERR-901`,time:`1m ago`,node:`gpu-node-06`,code:`Xid 79`,desc:`GPU fallen off bus — PCIe link lost`,severity:`CRITICAL`,action:`Auto-Isolate via Operator`},{id:`ERR-884`,time:`14m ago`,node:`gpu-node-03`,code:`Xid 62`,desc:`Page Retirement — Dynamic memory page isolation`,severity:`WARNING`,action:`Page Retired`},{id:`ERR-872`,time:`45m ago`,node:`gpu-node-04`,code:`Thermal`,desc:`GPU Temp reached 84°C — Fan speed increased to 100%`,severity:`WARNING`,action:`Cooling Tuned`},{id:`ERR-850`,time:`2h ago`,node:`gpu-node-02`,code:`Xid 31`,desc:`Memory Exception — Single-bit ECC corrected`,severity:`INFO`,action:`Logged`}]});function t(e){let t=window.devicePixelRatio||1,n=e.getBoundingClientRect();e.width=n.width*t,e.height=n.height*t;let r=e.getContext(`2d`);return r.scale(t,t),{ctx:r,width:n.width,height:n.height}}function n(e){let t=e.getContext(`2d`),n=window.devicePixelRatio||1;t.clearRect(0,0,e.width/n,e.height/n)}function r(e,r,i,a={}){let{ctx:o,width:s,height:c}=t(e);n(e);let l=s/2,u=c/2+10,d=Math.min(s,c)/2-15,f=Math.PI*.75,p=Math.PI*2.25,m=p-f;o.beginPath(),o.arc(l,u,d,f,p),o.strokeStyle=`#1a1d2e`,o.lineWidth=12,o.lineCap=`round`,o.stroke();let h=Math.min(Math.max(r/i,0),1),g=f+m*h,_=a.color||`#00E5C8`;a.warningThreshold&&h>a.warningThreshold&&(_=`#f5b041`),a.dangerThreshold&&h>a.dangerThreshold&&(_=`#e74c3c`),o.beginPath(),o.arc(l,u,d,f,g),o.strokeStyle=_,o.lineWidth=12,o.lineCap=`round`,o.stroke()}function i(){document.getElementById(`sre-ops-container`)&&(a(),o())}function a(){let t=e(),n=document.getElementById(`dcgm-stats-grid`);n&&(n.innerHTML=`
      <div class="dcgm-card">
        <span class="dcgm-label">SM Occupancy</span>
        <span class="dcgm-val text-primary">${t.dcgmStats.smOccupancy}%</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Avg Power Draw</span>
        <span class="dcgm-val">${t.dcgmStats.avgPowerWatts} W / ${t.dcgmStats.maxPowerWatts} W</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">PCIe Bus Bandwidth</span>
        <span class="dcgm-val">${t.dcgmStats.pcieBandwidth}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">NVLink Interconnect</span>
        <span class="dcgm-val text-secondary">${t.dcgmStats.nvlinkBandwidth}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Driver / CUDA</span>
        <span class="dcgm-val">${t.dcgmStats.driverVersion} (${t.dcgmStats.cudaVersion})</span>
      </div>
    `);let i=document.getElementById(`xid-error-feed`);i&&(i.innerHTML=t.xidLogs.map(e=>`
      <div class="xid-item ${e.severity.toLowerCase()}">
        <div class="xid-header">
          <span class="xid-code">${e.code}</span>
          <span class="xid-node">Node: ${e.node}</span>
          <span class="xid-time">${e.time}</span>
        </div>
        <div class="xid-desc">${e.desc}</div>
        <div class="xid-footer">
          <span class="xid-status">Action: ${e.action}</span>
          <button class="btn-remediate-action" data-node="${e.node}" data-code="${e.code}">⚡ Remediate via Operator</button>
        </div>
      </div>
    `).join(``));let a=document.getElementById(`dcgm-occupancy-gauge`);a&&r(a,t.dcgmStats.smOccupancy,100,{color:`#7C5CFC`,label:`SM OCCUPANCY`,unit:`%`,warningThreshold:85,dangerThreshold:95})}function o(){document.addEventListener(`click`,e=>{if(e.target&&e.target.classList.contains(`btn-remediate-action`)){let t=e.target.getAttribute(`data-node`),n=e.target.getAttribute(`data-code`);e.target.textContent=`⏳ Executing Runbook...`,e.target.disabled=!0,setTimeout(()=>{e.target.textContent=`✅ Node Drained & Isolated`,e.target.style.background=`rgba(0, 229, 200, 0.2)`,e.target.style.color=`#00E5C8`;let r=document.getElementById(`sre-toast-notification`);r&&(r.textContent=`[Self-Healing Runbook] Successfully cordoned ${t} (NVIDIA GPU Operator isolated ${n})`,r.classList.remove(`hidden`),setTimeout(()=>r.classList.add(`hidden`),4e3))},1200)}})}var s=`http://localhost:8000`;document.addEventListener(`DOMContentLoaded`,()=>{i();let e=document.querySelectorAll(`.nav-tab[data-view]`),t=document.querySelectorAll(`.view`);e.forEach(n=>{n.addEventListener(`click`,()=>{e.forEach(e=>e.classList.remove(`active`)),t.forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`);let r=n.getAttribute(`data-view`),a=`view-`+r,o=document.getElementById(a);o&&o.classList.add(`active`),r===`sre`&&i()})});let n=document.getElementById(`diag-form`),r=document.getElementById(`diag-results-output`);document.getElementById(`diag-health-score`),n&&n.addEventListener(`submit`,async e=>{e.preventDefault();let t={gpu_count:parseInt(document.getElementById(`diag-gpu-count`).value)||8,gpu_model:document.getElementById(`diag-gpu-model`).value,workload_type:document.getElementById(`diag-workload`).value,cooling_type:document.getElementById(`diag-cooling`).value,pcie_gen:document.getElementById(`diag-pcie`).value,power_limit_w:parseInt(document.getElementById(`diag-power`).value)||700,vram_gb:parseInt(document.getElementById(`diag-vram`).value)||80};r&&(r.innerHTML=`<div class="placeholder-msg">⚡ Running Python Backend Flaw Analysis...</div>`);try{let e=await fetch(`${s}/api/v1/diagnose`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)});if(!e.ok)throw Error(`HTTP Error ${e.status}`);c(await e.json())}catch{c(l(t))}});let a=document.querySelectorAll(`.api-endpoint-btn`),o=document.getElementById(`api-response-box`);a.forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.getAttribute(`data-endpoint`);o&&(o.textContent=`GET ${t}\nFetching from Python FastAPI backend...`);try{let e=await fetch(`${s}${t}`);if(!e.ok)throw Error(`HTTP Error ${e.status}`);let n=await e.json();o&&(o.textContent=`// 200 OK — ${s}${t}\n\n`+JSON.stringify(n,null,2))}catch{o&&(o.textContent=`// Note: Ensure Python FastAPI server is running (python -m uvicorn backend.app:app --reload)\n// Demo Standalone Response for ${t}:\n\n`+JSON.stringify({status:`STANDALONE_DEMO`,endpoint:t,info:`Start Python backend server for live SQLite database connection`,sample_data:t.includes(`nodes`)?[{id:`gpu-node-01`,name:`GPU Node 01`,model:`NVIDIA H100 SXM 80GB`,status:`healthy`},{id:`gpu-node-06`,name:`GPU Node 06`,model:`NVIDIA L40S 48GB`,status:`isolated`,k8s_cordoned:!0}]:{info:`FastAPI REST Server API Ready`}},null,2))}})})});function c(e){let t=document.getElementById(`diag-results-output`),n=document.getElementById(`diag-health-score`);n&&(n.textContent=`Fleet Score: ${e.health_score}%`,e.health_score<70?(n.style.color=`#FF6B6B`,n.style.borderColor=`#FF6B6B`):(n.style.color=`#00E5C8`,n.style.borderColor=`#00E5C8`)),t&&(t.innerHTML=`
    ${e.flaws.map(e=>`
    <div class="flaw-card ${e.severity.toLowerCase()}">
      <div class="flaw-header">
        <span>${e.category.toUpperCase()}: ${e.title}</span>
        <span>${e.severity}</span>
      </div>
      <div class="flaw-desc">${e.description}</div>
      <div class="flaw-impact">Expected Impact: ${e.impact}</div>
    </div>
  `).join(``)}
    <div class="rec-box">
      <h4>🛠️ Recommended SRE Optimization Actions:</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; margin-top: 6px;">
        ${e.recommendations.map(e=>`<li>💡 ${e}</li>`).join(``)}
      </ul>
    </div>
  `)}function l(e){let t=100,n=[],r=[];return e.gpu_model.includes(`H100`)&&e.cooling_type===`air`&&(n.append||n.push({category:`Thermal`,severity:`CRITICAL`,title:`Thermal Throttling Vulnerability (>85°C)`,description:`Air cooling is insufficient for ${e.gpu_model} running at ${e.power_limit_w}W. Dynamic SM clock downclocking (Xid 43) will occur.`,impact:`20-35% computing throughput degradation`}),r.push(`Switch to Direct Liquid Cooling (DLC) to keep junction temps under 72°C.`),t-=25),e.pcie_gen===`gen4`&&e.gpu_count>=8&&(n.push({category:`Interconnect`,severity:`WARNING`,title:`PCIe Gen 4 Host-to-Device Bottleneck`,description:`PCIe Gen 4 (32 GB/s) limits multi-node gradient synchronization across ${e.gpu_count} GPUs.`,impact:`Increases inter-node latency by 2.2x`}),r.push(`Upgrade host bus to PCIe Gen 5 (64 GB/s) or configure GPUDirect RDMA over 800G RoCEv2.`),t-=15),n.length===0&&(n.push({category:`Optimal`,severity:`INFO`,title:`No Critical Hardware Flaws Detected`,description:`Configuration is well-balanced for ${e.workload_type}.`,impact:`Operating at peak theoretical capacity`}),r.push(`Configuration is optimal for day-2 operations.`)),{health_score:Math.max(15,t),flaws:n,recommendations:r}}