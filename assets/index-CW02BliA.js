(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),Object.freeze({h100:3.5,a100:2.1,b200:5.2,l40s:1.4});var e=Object.freeze([{name:`Nava`,h100:3.5,a100:2.1},{name:`Lambda Labs`,h100:2.49,a100:1.49},{name:`CoreWeave`,h100:4.76,a100:2.21},{name:`RunPod`,h100:3.89,a100:2.19},{name:`AWS`,h100:12.29,a100:4.1}]),t=(e,t,n)=>Math.min(n,Math.max(t,e)),n=(e,t)=>e+Math.random()*(t-e),r=(e,t)=>Math.floor(n(e,t+1)),i=e=>e[r(0,e.length-1)],a=e=>String(e).padStart(2,`0`),o=[{model:`NVIDIA H100 SXM 80GB`,vramTotal:80,powerMax:700},{model:`NVIDIA A100 SXM 80GB`,vramTotal:80,powerMax:400},{model:`NVIDIA B200 SXM 192GB`,vramTotal:192,powerMax:1e3},{model:`NVIDIA A100 PCIe 40GB`,vramTotal:40,powerMax:300},{model:`NVIDIA H100 NVL 94GB`,vramTotal:94,powerMax:400},{model:`NVIDIA L40S 48GB`,vramTotal:48,powerMax:350}],s=[{type:`deploy`,texts:[`<strong>gpu-cluster-01</strong> deployed with 4x H100 nodes`,`<strong>vLLM inference-svc</strong> rolled out to prod-inference-01`,`<strong>SGLang deepseek-r1</strong> deployed to ap-south-1 region`,`<strong>TensorRT-LLM server</strong> deployed on 8x B200 SXM`]},{type:`scale`,texts:[`<strong>prod-inference-01</strong> scaled from 6 → 8 nodes`,`<strong>vLLM worker pool</strong> autoscaled to 16 replicas`,`<strong>embedding-svc</strong> scaled down to 2 replicas (low traffic)`,`<strong>gpu-pool-us-east</strong> expanded by 4 H100 nodes`]},{type:`alert`,texts:[`High KV-Cache pressure on <strong>gpu-node-04</strong> (92% VRAM Paged)`,`RoCEv2 PFC pause frame spike in <strong>leaf-sw-02</strong>`,`TTFT latency threshold exceeded on <strong>llama3-70b-vllm</strong> (↑ 42ms)`,`DCGM thermal throttling warning on <strong>gpu-node-03</strong> (84°C)`]},{type:`error`,texts:[`<strong>gpu-node-06</strong> Xid 79 (GPU fallen off bus) — isolated by Operator`,`OOM kill on <strong>sglang-qwen-2.5</strong> (requested 78 GB VRAM)`,`PCIe bus width degradation on <strong>gpu-node-02</strong> (x16 → x4)`,`GPUDirect RDMA link failure on <strong>connectx-7-port-1</strong>`]}],c=[`1m ago`,`2m ago`,`4m ago`,`7m ago`,`12m ago`,`18m ago`,`25m ago`,`34m ago`,`42m ago`,`1h ago`,`1h 15m ago`,`2h ago`],l=(e=6)=>{let t=new Set,i=new Set,s=e>=4?r(1,2):+(e>=2);for(;t.size<s;)t.add(r(0,e-1));if(e>=5&&Math.random()<.3){let n;do n=r(0,e-1);while(t.has(n));i.add(n)}return Array.from({length:e},(e,s)=>{let c=o[s%o.length],l=t.has(s),u=i.has(s),d=`active`,f,p,m,h;return u?(d=`error`,f=0,p=0,m=r(28,35),h=r(40,80)):l?(d=`idle`,f=r(0,5),p=+n(.5,c.vramTotal*.08).toFixed(1),m=r(30,42),h=r(50,120)):(f=r(55,98),p=+n(c.vramTotal*.45,c.vramTotal*.92).toFixed(1),m=r(58,85),h=r(Math.round(c.powerMax*.4),Math.round(c.powerMax*.85))),{id:`gpu-node-${a(s+1)}`,name:`GPU Node ${a(s+1)}`,model:c.model,status:d,utilization:f,vram:p,vramTotal:c.vramTotal,temperature:m,power:h,powerMax:c.powerMax}})},u=()=>{let e=[`ap-south-1`,`us-east-1`,`eu-west-1`];return[`prod-inference-01`,`staging-ml-02`,`batch-training-03`].map((t,n)=>{let i=r(4,16),a=r(30,72),o=r(0,4),s=n===0?0:r(0,2),c=`healthy`;return(s>0||o>3)&&(c=`degraded`),s>1&&(c=`critical`),{name:t,nodes:i,pods:{running:a,pending:o,failed:s},status:c,cpu:r(35,88),memory:r(40,82),region:e[n]}})},d=()=>{let e=[],t=new Set;for([`deploy`,`scale`,`alert`,`error`].forEach(n=>{let r=i(s.find(e=>e.type===n).texts);t.add(r),e.push({type:n,time:``,text:r})});e.length<8;){let n=i(s),r=i(n.texts);t.has(r)||(t.add(r),e.push({type:n.type,time:``,text:r}))}let n=e.slice(0,8);for(let e=n.length-1;e>0;e--){let t=r(0,e);[n[e],n[t]]=[n[t],n[e]]}return n.forEach((e,t)=>{e.time=c[t]||`${r(2,5)}h ago`}),n},f=e=>(e.forEach(e=>{if(e.status===`error`)return;let r=()=>n(-3,3);e.utilization=Math.round(t(e.utilization+r(),e.status===`idle`?0:30,100)),e.vram=+t(e.vram+n(-1.5,1.5),.1,e.vramTotal*.95).toFixed(1),e.temperature=Math.round(t(e.temperature+r(),28,92)),e.power=Math.round(t(e.power+n(-8,8),40,e.powerMax*.9))}),e),p=(e=60,r=50,i=20)=>{let a=n(.8,1.6),o=n(0,Math.PI*2),s=i*.35;return Array.from({length:e},(n,c)=>{let l=c/(e-1),u=Math.sin(2*Math.PI*a*l+o),d=(Math.random()-.5)*2*s;return{x:c,y:+t(r+i*.65*u+d,0,r*2.5).toFixed(2)}})},m=()=>{let e=r(20,32),t=e-r(1,4),i=r(120,200),a=r(700,980),o=+n(8,18).toFixed(1),s=+n(99.9,99.99).toFixed(2);return{totalGPUs:e,activeGPUs:t,totalVMs:i,networkThroughput:`${a} Gbps`,storageUsed:`${o} TB`,uptimePercent:s}},h=()=>({engines:[{name:`vLLM (PagedAttention)`,activeModels:4,avgTTFT:`14 ms`,avgITL:`9 ms`,throughput:`184 t/s`,kvCacheUsage:78,efficiency:`94%`},{name:`SGLang (RadixAttention)`,activeModels:3,avgTTFT:`11 ms`,avgITL:`8 ms`,throughput:`210 t/s`,kvCacheUsage:64,efficiency:`97%`},{name:`TensorRT-LLM (CUDA Graphs)`,activeModels:2,avgTTFT:`9 ms`,avgITL:`6 ms`,throughput:`245 t/s`,kvCacheUsage:82,efficiency:`99%`}],deployments:[{model:`LLaMA-3-70B-Instruct`,engine:`vLLM`,quantization:`FP8`,gpus:`4x H100 SXM`,ttft:`14 ms`,itl:`9 ms`,throughput:`184 t/s`,status:`Healthy`},{model:`DeepSeek-R1-671B`,engine:`SGLang`,quantization:`AWQ 4-bit`,gpus:`8x B200 SXM`,ttft:`18 ms`,itl:`11 ms`,throughput:`210 t/s`,status:`Healthy`},{model:`Qwen-2.5-Coder-32B`,engine:`TensorRT-LLM`,quantization:`FP8`,gpus:`2x H100 NVL`,ttft:`9 ms`,itl:`6 ms`,throughput:`245 t/s`,status:`Optimal`},{model:`Whisper-Large-v3 (Voice)`,engine:`vLLM`,quantization:`FP16`,gpus:`1x L40S`,ttft:`8 ms`,itl:`4 ms`,throughput:`310 t/s`,status:`Healthy`}]}),g=()=>({dcgmStats:{smOccupancy:88,avgPowerWatts:420,maxPowerWatts:700,pcieBandwidth:`61.4 GB/s`,nvlinkBandwidth:`880 GB/s`,driverVersion:`NVIDIA 550.54.14`,cudaVersion:`12.4`},xidLogs:[{id:`ERR-901`,time:`1m ago`,node:`gpu-node-06`,code:`Xid 79`,desc:`GPU fallen off bus — PCIe link lost`,severity:`CRITICAL`,action:`Auto-Isolate via Operator`},{id:`ERR-884`,time:`14m ago`,node:`gpu-node-03`,code:`Xid 62`,desc:`Page Retirement — Dynamic memory page isolation`,severity:`WARNING`,action:`Page Retired`},{id:`ERR-872`,time:`45m ago`,node:`gpu-node-04`,code:`Thermal`,desc:`GPU Temp reached 84°C — Fan speed increased to 100%`,severity:`WARNING`,action:`Cooling Tuned`},{id:`ERR-850`,time:`2h ago`,node:`gpu-node-02`,code:`Xid 31`,desc:`Memory Exception — Single-bit ECC corrected`,severity:`INFO`,action:`Logged`}]}),ee=()=>({fabricType:`RoCEv2 over 800G Ethernet`,topology:`Clos / Leaf-Spine (24-Leaf, 8-Spine)`,rdmaLatency:`1.4 µs`,throughputGbps:784,pfcPauseFrames:14,ecnCongestionRate:`0.02%`,dpuHardware:`NVIDIA BlueField-3 DPU & ConnectX-7 NICs`,switches:`NVIDIA Quantum-2 & Spectrum-4`});function _(e){let t=window.devicePixelRatio||1,n=e.getBoundingClientRect();e.width=n.width*t,e.height=n.height*t;let r=e.getContext(`2d`);return r.scale(t,t),{ctx:r,width:n.width,height:n.height}}function v(e){let t=e.getContext(`2d`),n=window.devicePixelRatio||1;t.clearRect(0,0,e.width/n,e.height/n)}function y(e,t,n={}){let{ctx:r,width:i,height:a}=_(e);v(e);let o=n.yMax||100,s=n.yMin||0,c={top:20,right:20,bottom:20,left:40},l=i-c.left-c.right,u=a-c.top-c.bottom;if(n.gridLines!==!1){r.strokeStyle=`rgba(255,255,255,0.05)`,r.lineWidth=1,r.beginPath();for(let e=0;e<=4;e++){let t=c.top+u/4*e;r.moveTo(c.left,t),r.lineTo(i-c.right,t),r.fillStyle=`#8A8FA8`,r.font=`10px "JetBrains Mono", monospace`,r.textAlign=`right`,r.textBaseline=`middle`;let n=o-(o-s)/4*e;r.fillText(Math.round(n),c.left-10,t)}r.stroke()}t.forEach(e=>{if(!e.data||e.data.length===0)return;let t=l/Math.max(1,e.data.length-1);if(r.beginPath(),e.data.forEach((n,i)=>{let a=c.left+i*t,l=(n.y-s)/(o-s),d=c.top+u-l*u;if(i===0)r.moveTo(a,d);else{let n=c.left+(i-1)*t,l=(e.data[i-1].y-s)/(o-s),f=c.top+u-l*u,p=n+t/2,m=f,h=n+t/2,g=d;r.bezierCurveTo(p,m,h,g,a,d)}}),r.strokeStyle=e.color,r.lineWidth=2,r.stroke(),e.fill){let n=r.createLinearGradient(0,c.top,0,a-c.bottom),i=`0, 229, 200`;e.color===`#00E5C8`&&(i=`0, 229, 200`),e.color===`#7C5CFC`&&(i=`124, 92, 252`),n.addColorStop(0,`rgba(${i}, 0.2)`),n.addColorStop(1,`rgba(${i}, 0)`),r.lineTo(c.left+(e.data.length-1)*t,c.top+u),r.lineTo(c.left,c.top+u),r.closePath(),r.fillStyle=n,r.fill()}})}function b(e,t,n,r={}){let{ctx:i,width:a,height:o}=_(e);v(e);let s=a/2,c=o/2+10,l=Math.min(a,o)/2-15,u=Math.PI*.75,d=Math.PI*2.25,f=d-u;i.beginPath(),i.arc(s,c,l,u,d),i.strokeStyle=`#1a1d2e`,i.lineWidth=12,i.lineCap=`round`,i.stroke();let p=Math.min(Math.max(t/n,0),1),m=u+f*p,h=r.color||`#00E5C8`;r.warningThreshold&&p>r.warningThreshold&&(h=`#f5b041`),r.dangerThreshold&&p>r.dangerThreshold&&(h=`#e74c3c`),i.beginPath(),i.arc(s,c,l,u,m),i.strokeStyle=h,i.lineWidth=12,i.lineCap=`round`,i.stroke()}var x=[],S=[],C=[],w=[],T=[],E=60;function te(){x=l(6),S=u(),C=d(),w=p(E,65,15),T=p(E,450,100),re(),D(),ae(),O(),k(),setInterval(ne,2e3),window.addEventListener(`nava:deploy`,ce);let e=document.getElementById(`provision-btn`);e&&e.addEventListener(`click`,le);let t=document.getElementById(`prov-cancel`),n=document.getElementById(`prov-deploy`),r=document.getElementById(`prov-nodes`);t&&t.addEventListener(`click`,A),n&&n.addEventListener(`click`,ue),r&&r.addEventListener(`input`,()=>{document.getElementById(`prov-nodes-val`).textContent=r.value})}function ne(){f(x),ie(),se(),k(),Math.random()<.15&&oe()}function re(){let e=m(),t=document.getElementById(`stats-row`);t&&(t.innerHTML=`
    <div class="stat-card">
      <div class="stat-label">Total GPUs</div>
      <div class="stat-value gradient">${e.totalGPUs}</div>
      <div class="stat-change up">↑ ${e.activeGPUs} active</div>
      <div class="stat-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M10 14h4v4h-4zm8 0h4v4h-4z" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active VMs</div>
      <div class="stat-value gradient">${e.totalVMs}</div>
      <div class="stat-change up">↑ 12 today</div>
      <div class="stat-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" stroke-width="2"/><path d="M10 10h12M10 14h8M10 18h10" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Network</div>
      <div class="stat-value gradient">${e.networkThroughput}</div>
      <div class="stat-change up">↑ 3.2% from yesterday</div>
      <div class="stat-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 24l7-8 5 4 5-6 7-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Uptime</div>
      <div class="stat-value gradient">${e.uptimePercent}%</div>
      <div class="stat-change up">↑ 30-day SLA met</div>
      <div class="stat-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2"/><path d="M12 16l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
  `)}function D(){let e=document.getElementById(`gpu-fleet`);e&&(e.innerHTML=x.map((e,t)=>`
    <div class="gpu-card" id="gpu-card-${t}" style="animation-delay: ${t*.08}s">
      <div class="gpu-card-header">
        <span class="gpu-name">${e.name}</span>
        <span class="gpu-status ${e.status}">${e.status}</span>
      </div>
      <div class="gpu-model">${e.model}</div>
      <div class="gpu-metrics">
        <div class="gpu-metric">
          <span class="gpu-metric-label">Util</span>
          <div class="gpu-metric-bar"><div class="gpu-metric-fill util" style="width: ${e.utilization}%"></div></div>
          <span class="gpu-metric-val" id="gpu-util-${t}">${e.utilization}%</span>
        </div>
        <div class="gpu-metric">
          <span class="gpu-metric-label">VRAM</span>
          <div class="gpu-metric-bar"><div class="gpu-metric-fill vram" style="width: ${(e.vram/e.vramTotal*100).toFixed(0)}%"></div></div>
          <span class="gpu-metric-val" id="gpu-vram-${t}">${e.vram.toFixed(1)} GB</span>
        </div>
        <div class="gpu-metric">
          <span class="gpu-metric-label">Temp</span>
          <div class="gpu-metric-bar"><div class="gpu-metric-fill temp" style="width: ${(e.temperature/100*100).toFixed(0)}%"></div></div>
          <span class="gpu-metric-val" id="gpu-temp-${t}">${e.temperature}°C</span>
        </div>
        <div class="gpu-metric">
          <span class="gpu-metric-label">Power</span>
          <div class="gpu-metric-bar"><div class="gpu-metric-fill power" style="width: ${(e.power/e.powerMax*100).toFixed(0)}%"></div></div>
          <span class="gpu-metric-val" id="gpu-power-${t}">${e.power}W</span>
        </div>
      </div>
    </div>
  `).join(``))}function ie(){x.forEach((e,t)=>{let n=document.getElementById(`gpu-card-${t}`);if(!n)return;let r=n.querySelector(`.gpu-metric-fill.util`),i=n.querySelector(`.gpu-metric-fill.vram`),a=n.querySelector(`.gpu-metric-fill.temp`),o=n.querySelector(`.gpu-metric-fill.power`);r&&(r.style.width=`${e.utilization}%`),i&&(i.style.width=`${(e.vram/e.vramTotal*100).toFixed(0)}%`),a&&(a.style.width=`${(e.temperature/100*100).toFixed(0)}%`),o&&(o.style.width=`${(e.power/e.powerMax*100).toFixed(0)}%`);let s=document.getElementById(`gpu-util-${t}`),c=document.getElementById(`gpu-vram-${t}`),l=document.getElementById(`gpu-temp-${t}`),u=document.getElementById(`gpu-power-${t}`);s&&(s.textContent=`${e.utilization}%`),c&&(c.textContent=`${e.vram.toFixed(1)} GB`),l&&(l.textContent=`${e.temperature}°C`),u&&(u.textContent=`${e.power}W`)})}function ae(){let e=document.getElementById(`k8s-clusters`);e&&(e.innerHTML=S.map(e=>`
    <div class="k8s-item">
      <div class="k8s-icon">☸️</div>
      <div class="k8s-info">
        <div class="k8s-name">${e.name}</div>
        <div class="k8s-meta">${e.nodes} nodes · ${e.pods.running} pods running · ${e.region}</div>
      </div>
      <span class="k8s-status-badge">${e.status}</span>
    </div>
  `).join(``))}function O(){let e=document.getElementById(`activity-feed`);e&&(e.innerHTML=C.map(e=>`
    <div class="activity-item ${e.type}">
      <span class="activity-time">${e.time}</span>
      <span class="activity-text">${e.text}</span>
    </div>
  `).join(``))}function oe(){let e=[{type:`deploy`,text:`<strong>9AC-gpu-07</strong> instance provisioned in ap-south-1`},{type:`scale`,text:`<strong>prod-inference-01</strong> auto-scaled to 12 replicas`},{type:`alert`,text:`<strong>gpu-node-03</strong> temperature threshold reached (82°C)`},{type:`deploy`,text:`<strong>9AK-cluster-02</strong> Kubernetes upgrade to v1.30 complete`},{type:`scale`,text:`<strong>edge-cdn-apac</strong> (9ED) cache invalidation completed`},{type:`alert`,text:`<strong>9PB-vol-12</strong> storage utilization at 85%`},{type:`deploy`,text:`<strong>model-registry</strong> new model artifact v2.4 pushed`}],t=e[Math.floor(Math.random()*e.length)];t.time=`now`,C.unshift(t),C.length>12&&C.pop(),O()}function se(){let e=x.reduce((e,t)=>e+t.utilization,0)/x.length;w.push({x:w.length,y:e+(Math.random()-.5)*5}),w.length>E&&w.shift();let t=400+Math.sin(Date.now()/5e3)*150+(Math.random()-.5)*60;T.push({x:T.length,y:Math.max(0,t)}),T.length>E&&T.shift()}function k(){let e=document.getElementById(`chart-compute`),t=document.getElementById(`chart-network`);e&&y(e,[{data:w,color:`#00E5C8`,label:`GPU Avg`,fill:!0}],{gridLines:!0,yMax:100,yMin:0}),t&&y(t,[{data:T,color:`#7C5CFC`,label:`Throughput (Gbps)`,fill:!0}],{gridLines:!0,yMax:800,yMin:0})}function ce(e){let t=e.detail||{},n={id:`gpu-node-${String(x.length+1).padStart(2,`0`)}`,name:t.name||`GPU Node ${String(x.length+1).padStart(2,`0`)}`,model:t.model||`NVIDIA H100 SXM 80GB`,status:`active`,utilization:5+Math.floor(Math.random()*15),vram:2+Math.random()*8,vramTotal:80,temperature:35+Math.floor(Math.random()*10),power:80+Math.floor(Math.random()*50),powerMax:700};x.push(n),D(),window.dispatchEvent(new CustomEvent(`nava:resourceAdded`,{detail:{id:n.id,name:n.name,type:`9AC`,gpuType:`h100`,gpuCount:t.gpuCount||1,hourlyRate:3.5,monthlyRate:3.5*730}})),C.unshift({type:`deploy`,time:`now`,text:`<strong>${n.name}</strong> deployed via AI Assistant`}),O()}function le(){document.getElementById(`provision-modal`)?.classList.remove(`hidden`)}function A(){document.getElementById(`provision-modal`)?.classList.add(`hidden`)}function ue(){let e=document.getElementById(`prov-name`)?.value||`gpu-cluster`,t=document.getElementById(`prov-type`)?.value||`9ac`,n=document.getElementById(`prov-gpu`)?.value||`h100`,r=parseInt(document.getElementById(`prov-nodes`)?.value||`4`),i={h100:`NVIDIA H100 SXM 80GB`,a100:`NVIDIA A100 80GB`,b200:`NVIDIA B200 SXM 192GB`},a={h100:3.5,a100:2.1,b200:5.2};for(let t=0;t<Math.min(r,4);t++){let r={id:`gpu-node-${String(x.length+1).padStart(2,`0`)}`,name:`${e}-${String(t+1).padStart(2,`0`)}`,model:i[n]||`NVIDIA H100 SXM 80GB`,status:`active`,utilization:Math.floor(Math.random()*20),vram:Math.random()*10,vramTotal:n===`b200`?192:80,temperature:35+Math.floor(Math.random()*10),power:80+Math.floor(Math.random()*60),powerMax:n===`b200`?1e3:700};x.push(r)}D(),window.dispatchEvent(new CustomEvent(`nava:resourceAdded`,{detail:{id:`cluster-${Date.now()}`,name:e,type:t.toUpperCase(),gpuType:n,gpuCount:r,hourlyRate:(a[n]||3.5)*r,monthlyRate:(a[n]||3.5)*r*730}})),C.unshift({type:`deploy`,time:`now`,text:`<strong>${e}</strong> provisioned with ${r}x ${i[n]||`H100`}`}),O(),A()}var j=[],M=`current`;function de(){let e=document.getElementById(`export-pdf`);e&&e.addEventListener(`click`,ge);let t=document.querySelectorAll(`.scenario-btn`);t.forEach(e=>{e.addEventListener(`click`,e=>{t.forEach(e=>e.classList.remove(`active`)),e.target.classList.add(`active`),M=e.target.dataset.scenario,F()})}),window.addEventListener(`nava:resourceAdded`,e=>{fe(e.detail)}),window.addEventListener(`nava:resourceRemoved`,e=>{pe(e.detail.id)}),he(),me(),N(),F()}function fe(e){j.push(e),N(),P(),F()}function pe(e){j=j.filter(t=>t.id!==e),N(),P(),F()}function N(){let e=document.getElementById(`cost-items`);if(!e)return;if(j.length===0){e.innerHTML=`<div class="cost-empty">No resources provisioned</div>`;return}let t=``,n=0;j.forEach(e=>{n+=e.hourlyRate,t+=`
      <div class="cost-item">
        <div class="cost-item-name">
          <div>${e.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-tertiary)">${e.gpuCount}x ${e.gpuType.toUpperCase()}</div>
        </div>
        <div class="cost-item-value">$${e.monthlyRate.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
      </div>
    `}),t+=`
    <div style="margin-top: 8px; text-align: right; font-size: 0.75rem; color: var(--text-secondary)">
      Hourly rate: $${n.toFixed(2)}/hr
    </div>
  `,e.innerHTML=t}function P(){let e=j.reduce((e,t)=>e+t.monthlyRate,0),t=document.getElementById(`total-cost`);t&&(t.textContent=`$${e.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}`)}function me(){let e=document.getElementById(`perf-scores`);e&&(e.innerHTML=[{name:`L40S`,score:92,color:`var(--success)`},{name:`H100`,score:85,color:`var(--primary)`},{name:`A100`,score:72,color:`var(--info)`},{name:`B200`,score:65,color:`var(--secondary)`}].map(e=>`
    <div class="perf-score-item">
      <span class="perf-gpu-name">${e.name}</span>
      <div class="perf-bar"><div class="perf-bar-fill" style="width: ${e.score}%; background: ${e.color}"></div></div>
      <span class="perf-score-val">${e.score}</span>
    </div>
  `).join(``))}function F(){let e=document.getElementById(`scenario-comparison`);if(!e)return;let t=j.reduce((e,t)=>e+t.monthlyRate,0),n=0;M===`optimized`&&(n=t*.2,t-=n);let r=t+160+45;e.innerHTML=`
    <div class="scenario-row">
      <span class="scenario-label">Compute (9AC/9AK)</span>
      <span class="scenario-value">$${t.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
    </div>
    <div class="scenario-row">
      <span class="scenario-label">Storage (9PB)</span>
      <span class="scenario-value">$${160 .toFixed(2)}</span>
    </div>
    <div class="scenario-row">
      <span class="scenario-label">Networking (9AV)</span>
      <span class="scenario-value">$${45 .toFixed(2)}</span>
    </div>
    <div class="scenario-row" style="margin-top: 8px; border-top: 1px solid var(--glass-border); padding-top: 8px;">
      <span class="scenario-label" style="font-weight: 600; color: var(--text-primary)">Total Estimated</span>
      <span class="scenario-value" style="color: var(--text-primary)">$${r.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
    </div>
    ${n>0?`
    <div class="scenario-row">
      <span class="scenario-label">Optimization Savings</span>
      <span class="scenario-value savings">-$${n.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})} (20%)</span>
    </div>
    `:``}
  `}function he(){let t=document.getElementById(`competitor-prices`);if(!t)return;let n=[...e].sort((e,t)=>e.h100-t.h100),r=e.find(e=>e.name===`Nava`).h100;t.innerHTML=n.map(e=>{let t=``;return e.name===`Nava`?t=`ours`:e.h100<r?t=`lower`:e.h100>r&&(t=`higher`),`
      <div class="competitor-item">
        <span class="competitor-name">
          ${e.name}
          ${e.name===`Nava`?`<span style="font-size: 0.6rem; background: var(--primary-glow); padding: 2px 6px; border-radius: 10px; color: var(--primary)">YOU</span>`:``}
        </span>
        <span class="competitor-price ${t}">$${e.h100.toFixed(2)} /hr</span>
      </div>
    `}).join(``)}function ge(){let e=j.reduce((e,t)=>e+t.monthlyRate,0),t=`=======================================
`;t+=`NAVA PLATFORM HUB - COST ESTIMATE
`,t+=`Date: ${new Date().toLocaleDateString()}\n`,t+=`=======================================

`,t+=`PROVISIONED RESOURCES:
`,j.length===0&&(t+=`(No resources provisioned)
`),j.forEach(e=>{t+=`- ${e.name} (${e.gpuCount}x ${e.gpuType.toUpperCase()}): $${e.monthlyRate.toFixed(2)} /mo\n`}),t+=`
---------------------------------------
`,t+=`ESTIMATED MONTHLY TOTAL: $${e.toFixed(2)}\n`,t+=`---------------------------------------

`,t+=`*Estimate assumes 730 hours per month.
`,t+=`*Does not include variable data egress fees.
`;let n=new Blob([t],{type:`text/plain`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`nava-cost-estimate.txt`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)}var I=null;function _e(){I=document.getElementById(`ai-messages`);let e=document.getElementById(`ai-assistant`),t=document.getElementById(`ai-toggle`),n=document.getElementById(`ai-close`),r=document.getElementById(`ai-send`),i=document.getElementById(`ai-input`);t&&e&&t.addEventListener(`click`,()=>e.classList.toggle(`open`)),n&&e&&n.addEventListener(`click`,()=>e.classList.remove(`open`)),r&&r.addEventListener(`click`,()=>{let e=document.getElementById(`ai-input`);e&&e.value.trim()&&(L(e.value.trim()),e.value=``)}),i&&i.addEventListener(`keydown`,e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),i.value.trim()&&(L(i.value.trim()),i.value=``))}),document.querySelectorAll(`.ai-chip`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-prompt`);t&&L(t)})})}function L(e){if(!e)return;R(`user`,V(e)),Te();let t=1e3+Math.random()*1e3;setTimeout(()=>{z(),R(`bot`,ve(e))},t)}function ve(e){let t=e.toLowerCase();return/(deploy|provision|create|launch|setup)\b/.test(t)?ye(t,e):/(best gpu|which gpu|recommend gpu|gpu for)\b/i.test(t)?be(t):/(simulate|simulation|test run|flight)\b/.test(t)?xe():/(cost|price|pricing|compare|cheaper|expensive)\b/.test(t)?Se(t):/(scale|resize|expand|add nodes)\b/.test(t)?Ce(t):we()}function ye(e,t){let n=`infrastructure`,r=``;return/(llm|training|model|ml|machine learning|ai)/.test(e)?(n=`LLM Training Environment`,r=`# Nava Infrastructure — LLM Training Environment
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
}`):/(api|gateway|backend|service|microservice)/.test(e)?(n=`API Backend Service`,r=`# Nava Infrastructure — API Backend Service
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
}`):/(database|db|postgres|mysql|data)/.test(e)?(n=`Managed Database Cluster`,r=`# Nava Infrastructure — Managed Database Cluster
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
}`):/(kubernetes|k8s|cluster|container)/.test(e)?(n=`Kubernetes Cluster`,r=`# Nava Infrastructure — Kubernetes Cluster
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
}`):/(storage|bucket|object|file|s3)/.test(e)?(n=`Object Storage`,r=`# Nava Infrastructure — Object Storage
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
}`):(n=`Full-Stack Environment`,r=`# Nava Infrastructure — Full-Stack Environment
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
}`),window.dispatchEvent(new CustomEvent(`nava:deploy`,{detail:{resource:n,timestamp:Date.now()}})),`
    <p>✅ <strong>Provisioning ${n}</strong></p>
    <p>I've generated the following Terraform configuration for your environment:</p>
    <pre><code>${V(r)}</code></pre>
    <p style="margin-top:.75rem;color:hsl(145,70%,50%)">
      ⚡ Resources are being provisioned on your dashboard…
    </p>
    <p style="color:hsl(225,15%,60%);font-size:.85rem;margin-top:.5rem">
      Estimated provisioning time: ~3 minutes. You'll receive a notification once all resources are healthy.
    </p>
  `}function be(e){let t=/(llama|llm|large language|gpt|transformer)/.test(e),n=/(inference|serving|predict|run)/.test(e),r=/(train|finetune|fine-tune|pre-?train)/.test(e),i=``;return i=t||r?`
      <p>For <strong>LLM training</strong> (Llama, GPT-class models), here's my recommendation:</p>
      <div style="margin:.75rem 0;padding:.75rem 1rem;border-left:3px solid hsl(170,85%,55%);background:hsl(225,18%,9%);border-radius:0 .5rem .5rem 0;">
        <strong style="color:hsl(170,85%,55%)">🏆 Recommended: NVIDIA H100 (9AC.GPU.H100)</strong><br>
        Best-in-class for large-scale distributed training.
      </div>
    `:n?`
      <p>For <strong>inference / model serving</strong>, here's my recommendation:</p>
      <div style="margin:.75rem 0;padding:.75rem 1rem;border-left:3px solid hsl(170,85%,55%);background:hsl(225,18%,9%);border-radius:0 .5rem .5rem 0;">
        <strong style="color:hsl(170,85%,55%)">🏆 Recommended: NVIDIA A100 (9AC.GPU.A100)</strong><br>
        Best price-to-throughput for production inference.
      </div>
    `:`
      <p>Here's a breakdown to help you choose the right GPU on Nava:</p>
    `,`
    ${i}
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
  `}function xe(){return window.dispatchEvent(new CustomEvent(`nava:openSimulator`)),`
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
  `}function Se(e){let t=/(gpu|h100|a100|l4|t4)/.test(e),n=``;return n=t?`<p>💰 <strong>GPU Pricing — Nava vs. Major Cloud Providers</strong></p>`:`<p>💰 <strong>Nava Platform Pricing Comparison</strong></p>`,`
    ${n}
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
  `}function Ce(e){let t=`cluster`,n=``;return/(gpu|compute|node)/.test(e)?(t=`compute nodes`,n=`# Nava 9AK — Scaling Configuration
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
    maxSize: 10TB`):/(database|db|data)/.test(e)?(t=`database cluster`,n=`# Nava 9RD — Database Scaling
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
    idleTimeout: 30s`):(t=`infrastructure`,n=`# Nava Platform — Horizontal Scaling
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
    pagerduty: true`),`
    <p>📈 <strong>Scaling ${t}</strong></p>
    <p>I've generated a scaling policy for your ${t}. Review the configuration below:</p>
    <pre><code>${V(n)}</code></pre>
    <p style="margin-top:.75rem;color:hsl(170,85%,55%)">
      ✅ Auto-scaling policy is ready to apply. The system will dynamically adjust
      resources based on your defined metrics.
    </p>
    <p style="font-size:.85rem;color:hsl(225,15%,60%);margin-top:.5rem">
      Current utilisation will be reflected on the dashboard within 30 seconds.
    </p>
  `}function we(){return`
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
  `}function R(e,t){if(I||=document.getElementById(`ai-messages`),!I)return;let n=document.createElement(`div`);n.className=`ai-message ai-message--${e}`;let r=new Date().toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`});e===`bot`?n.innerHTML=`
      <div class="ai-message__avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(170,85%,55%)" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="ai-message__body">
        <div class="ai-message__content">${t}</div>
        <span class="ai-message__time">${r}</span>
      </div>
    `:n.innerHTML=`
      <div class="ai-message__body">
        <div class="ai-message__content">${t}</div>
        <span class="ai-message__time">${r}</span>
      </div>
    `,I.appendChild(n),B()}function Te(){if(I||=document.getElementById(`ai-messages`),!I)return;z();let e=document.createElement(`div`);e.className=`ai-message ai-message--bot ai-typing-indicator`,e.innerHTML=`
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
  `,I.appendChild(e),B()}function z(){if(I||=document.getElementById(`ai-messages`),!I)return;let e=I.querySelector(`.ai-typing-indicator`);e&&e.remove()}function B(){I&&requestAnimationFrame(()=>{I.scrollTop=I.scrollHeight})}function V(e){let t=document.createElement(`span`);return t.textContent=e,t.innerHTML}var H=null,U=0,W={},G=[],K=[],q=0;function Ee(){let e=document.getElementById(`sim-run-btn`);e&&e.addEventListener(`click`,De);let t=document.getElementById(`sim-tweak-btn`);t&&t.addEventListener(`click`,()=>{J(),document.getElementById(`sim-display`).classList.add(`hidden`),document.getElementById(`sim-config`).classList.remove(`hidden`)});let n=document.getElementById(`sim-deploy-btn`);n&&n.addEventListener(`click`,Ne);let r=document.getElementById(`sim-gpu-count`),i=document.getElementById(`sim-gpu-count-val`);r&&i&&r.addEventListener(`input`,()=>i.textContent=r.value);let a=document.getElementById(`sim-dataset-size`),o=document.getElementById(`sim-dataset-val`);a&&o&&a.addEventListener(`input`,()=>o.textContent=`${a.value} GB`)}function De(){document.getElementById(`sim-config`).classList.add(`hidden`),document.getElementById(`sim-display`).classList.remove(`hidden`);let e=document.getElementById(`sim-workload-type`),t=document.getElementById(`sim-engine`),n=document.getElementById(`sim-quantization`),r=document.getElementById(`sim-speculative`),i=document.getElementById(`sim-gpu-type`),a=document.getElementById(`sim-gpu-count`);W={type:e?e.value:`llm-finetune`,engine:t?t.value:`vllm`,quantization:n?n.value:`fp8`,speculative:r?r.value:`eagle`,gpu:i?i.value:`h100`,gpuCount:a?parseInt(a.value):4},U=0,G=[],K=[],q=0;let o=document.getElementById(`sim-alerts`),s=document.getElementById(`sim-recommendations`);o&&(o.innerHTML=``),s&&s.classList.add(`hidden`),document.getElementById(`sim-progress-text`).textContent=`Initializing ${W.engine.toUpperCase()} runtime...`,H&&clearInterval(H),H=setInterval(Oe,100)}function J(){H&&clearInterval(H)}function Oe(){U++;let e=Math.min(100,U/150*100);document.getElementById(`sim-progress-fill`).style.width=`${e}%`;let t=ke(e);document.getElementById(`sim-progress-text`).textContent=t.text;let n=t.utilTarget,r=t.vramTarget,i=t.netTarget;W.quantization===`fp8`&&(r*=.65),W.quantization===`awq`&&(r*=.45);let a=Math.max(0,Math.min(100,n+(Math.random()-.5)*10)),o=Math.max(0,Math.min(100,r+(Math.random()-.5)*5)),s=Math.max(0,i+(Math.random()-.5)*20);G.push({x:U,y:a}),K.push({x:U,y:Math.min(100,s/4)}),G.length>50&&G.shift(),K.length>50&&K.shift();let c=({h100:3.5,a100:2.1,b200:5.2,l40s:1.4}[W.gpu]||3.5)*W.gpuCount;q+=c*.5,Ae(a,o,s),U===60&&je(),U>=150&&(J(),document.getElementById(`sim-progress-text`).textContent=`Benchmark Complete`,Me())}function ke(e){return e<15?{text:`Loading ${W.quantization.toUpperCase()} Model Weights into ${W.engine.toUpperCase()} KV-Cache...`,utilTarget:20,vramTarget:40,netTarget:200}:e<40?{text:`Warmup & PagedAttention Cache Allocation...`,utilTarget:65,vramTarget:60,netTarget:350}:e<85?{text:`Serving Inference Prompts (${W.speculative===`disabled`?`Standard Decoding`:`Speculative EAGLE Draft Engine Active`})...`,utilTarget:96,vramTarget:75,netTarget:480}:{text:`Saving Telemetry Metrics...`,utilTarget:15,vramTarget:20,netTarget:100}}function Ae(e,t,n){document.getElementById(`sim-gpu-util`).textContent=`${e.toFixed(1)}%`;let r=W.gpu===`b200`?192:80,i=t/100*r;document.getElementById(`sim-vram-label`).textContent=`${i.toFixed(1)} / ${r} GB`,document.getElementById(`sim-net-throughput`).textContent=`${n.toFixed(0)} Gbps`,document.getElementById(`sim-cost-ticker`).textContent=`$${q.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}`;let a=q*2.5;document.getElementById(`sim-est-total`).textContent=`Est. Total: ~$${a.toLocaleString(void 0,{maximumFractionDigits:0})}`,document.getElementById(`sim-est-time`).textContent=`Est. Time: ${(8+Math.random()*3).toFixed(1)}h`;let o=document.getElementById(`sim-gpu-chart`),s=document.getElementById(`sim-network-chart`),c=document.getElementById(`sim-vram-gauge`);o&&y(o,[{data:G,color:`#00E5C8`,fill:!0}],{gridLines:!1}),s&&y(s,[{data:K,color:`#7C5CFC`,fill:!0}],{gridLines:!1}),c&&b(c,t,100,{color:`#7C5CFC`,warningThreshold:.85,dangerThreshold:.95})}function je(){let e=document.getElementById(`sim-alerts`);e&&(e.innerHTML=`
    <div class="sim-alert success">
      <div class="sim-alert-icon">⚡</div>
      <div class="sim-alert-text">
        <strong>${W.engine.toUpperCase()} + ${W.quantization.toUpperCase()} Optimized</strong>
        KV-Cache memory pressure reduced by 48%. Speculative Decoding (${W.speculative.toUpperCase()}) boosting throughput by 2.4x.
      </div>
    </div>
  `)}function Me(){let e=document.getElementById(`sim-recommendations`),t=document.getElementById(`sim-rec-list`);!e||!t||(t.innerHTML=`
    <div class="sim-rec-item">
      <div class="sim-rec-icon">🏆</div>
      <div class="sim-rec-text">
        <strong>Deploy with FP8 Quantization + EAGLE Speculative Decoding</strong>
        Saves 52% VRAM memory while increasing Tokens/sec from 92 → 220 t/s.
        <span class="sim-rec-impact">Reduces monthly cloud cost by ~$3,400.</span>
      </div>
    </div>
  `,e.classList.remove(`hidden`))}function Ne(){window.dispatchEvent(new CustomEvent(`nava:deploy`,{detail:{name:`simulated-${W.type}`,model:`NVIDIA ${W.gpu.toUpperCase()}`,gpuCount:W.gpuCount}})),document.querySelectorAll(`.nav-tab`).forEach(e=>e.classList.remove(`active`)),document.getElementById(`nav-dashboard`).classList.add(`active`),document.querySelectorAll(`.view`).forEach(e=>e.classList.remove(`active`)),document.getElementById(`view-dashboard`).classList.add(`active`),J(),document.getElementById(`sim-display`).classList.add(`hidden`),document.getElementById(`sim-config`).classList.remove(`hidden`)}function Y(){document.getElementById(`inference-metrics-container`)&&Pe()}function Pe(){let e=h(),t=document.getElementById(`inference-engines-grid`);t&&(t.innerHTML=e.engines.map(e=>`
      <div class="panel-card engine-card">
        <div class="engine-header">
          <span class="engine-badge">${e.name}</span>
          <span class="engine-eff">Efficiency: ${e.efficiency}</span>
        </div>
        <div class="engine-stats">
          <div class="stat-mini">
            <span class="stat-mini-label">TTFT (First Token)</span>
            <span class="stat-mini-val">${e.avgTTFT}</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-label">ITL (Inter-Token)</span>
            <span class="stat-mini-val">${e.avgITL}</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-label">Throughput</span>
            <span class="stat-mini-val text-primary">${e.throughput}</span>
          </div>
        </div>
        <div class="kv-meter-container">
          <div class="kv-label"><span>KV-Cache Paged Memory</span><span>${e.kvCacheUsage}%</span></div>
          <div class="kv-meter-bar">
            <div class="kv-meter-fill" style="width: ${e.kvCacheUsage}%;"></div>
          </div>
        </div>
      </div>
    `).join(``));let n=document.getElementById(`inference-table-body`);n&&(n.innerHTML=e.deployments.map(e=>`
      <tr>
        <td><strong>${e.model}</strong></td>
        <td><span class="tag-pill">${e.engine}</span></td>
        <td><span class="tag-pill tag-quant">${e.quantization}</span></td>
        <td>${e.gpus}</td>
        <td>${e.ttft}</td>
        <td>${e.itl}</td>
        <td class="text-primary"><strong>${e.throughput}</strong></td>
        <td><span class="status-badge active">${e.status}</span></td>
      </tr>
    `).join(``));let r=document.getElementById(`kv-cache-gauge`);r&&b(r,76,100,{color:`#00E5C8`,label:`KV-CACHE PRESSURE`,unit:`%`,warningThreshold:80,dangerThreshold:90})}function X(){document.getElementById(`sre-ops-container`)&&(Fe(),Ie())}function Fe(){let e=g(),t=document.getElementById(`dcgm-stats-grid`);t&&(t.innerHTML=`
      <div class="dcgm-card">
        <span class="dcgm-label">SM Occupancy</span>
        <span class="dcgm-val text-primary">${e.dcgmStats.smOccupancy}%</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Avg Power Draw</span>
        <span class="dcgm-val">${e.dcgmStats.avgPowerWatts} W / ${e.dcgmStats.maxPowerWatts} W</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">PCIe Bus Bandwidth</span>
        <span class="dcgm-val">${e.dcgmStats.pcieBandwidth}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">NVLink Interconnect</span>
        <span class="dcgm-val text-secondary">${e.dcgmStats.nvlinkBandwidth}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Driver / CUDA</span>
        <span class="dcgm-val">${e.dcgmStats.driverVersion} (${e.dcgmStats.cudaVersion})</span>
      </div>
    `);let n=document.getElementById(`xid-error-feed`);n&&(n.innerHTML=e.xidLogs.map(e=>`
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
    `).join(``));let r=document.getElementById(`dcgm-occupancy-gauge`);r&&b(r,e.dcgmStats.smOccupancy,100,{color:`#7C5CFC`,label:`SM OCCUPANCY`,unit:`%`,warningThreshold:85,dangerThreshold:95})}function Ie(){document.addEventListener(`click`,e=>{if(e.target&&e.target.classList.contains(`btn-remediate-action`)){let t=e.target.getAttribute(`data-node`),n=e.target.getAttribute(`data-code`);e.target.textContent=`⏳ Executing Runbook...`,e.target.disabled=!0,setTimeout(()=>{e.target.textContent=`✅ Node Drained & Isolated`,e.target.style.background=`rgba(0, 229, 200, 0.2)`,e.target.style.color=`#00E5C8`;let r=document.getElementById(`sre-toast-notification`);r&&(r.textContent=`[Self-Healing Runbook] Successfully cordoned ${t} (NVIDIA GPU Operator isolated ${n})`,r.classList.remove(`hidden`),setTimeout(()=>r.classList.add(`hidden`),4e3))},1200)}})}function Z(){let e=document.getElementById(`fabric-canvas`);e&&(Re(e),Le())}function Le(){let e=ee(),t=document.getElementById(`network-info-card`);t&&(t.innerHTML=`
      <div class="dcgm-card">
        <span class="dcgm-label">Fabric Architecture</span>
        <span class="dcgm-val text-primary">${e.fabricType}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Topology</span>
        <span class="dcgm-val">${e.topology}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">GPUDirect RDMA Latency</span>
        <span class="dcgm-val text-secondary">${e.rdmaLatency}</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Fabric Throughput</span>
        <span class="dcgm-val">${e.throughputGbps} Gbps</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">PFC Pause Frames / ECN Rate</span>
        <span class="dcgm-val">${e.pfcPauseFrames} frames (${e.ecnCongestionRate})</span>
      </div>
      <div class="dcgm-card">
        <span class="dcgm-label">Hardware Acceleration</span>
        <span class="dcgm-val">${e.dpuHardware}</span>
      </div>
    `)}function Re(e){let t=e.getContext(`2d`),n=window.devicePixelRatio||1,r=e.getBoundingClientRect();e.width=r.width*n,e.height=r.height*n,t.scale(n,n);let i=r.width,a=r.height;t.clearRect(0,0,i,a);let o=[{x:i*.25,y:50,label:`Spine-01 (NVIDIA Quantum)`},{x:i*.5,y:50,label:`Spine-02 (NVIDIA Quantum)`},{x:i*.75,y:50,label:`Spine-03 (NVIDIA Quantum)`}],s=[{x:i*.15,y:180,label:`Leaf-01`},{x:i*.38,y:180,label:`Leaf-02`},{x:i*.62,y:180,label:`Leaf-03`},{x:i*.85,y:180,label:`Leaf-04`}],c=[{x:i*.1,y:310,label:`H100 Node 1 (GPUDirect)`},{x:i*.23,y:310,label:`H100 Node 2`},{x:i*.35,y:310,label:`B200 Node 3`},{x:i*.5,y:310,label:`B200 Node 4`},{x:i*.65,y:310,label:`A100 Node 5`},{x:i*.78,y:310,label:`A100 Node 6`},{x:i*.9,y:310,label:`L40S Node 7`}];t.lineWidth=1.5,o.forEach(e=>{s.forEach(n=>{t.beginPath(),t.moveTo(e.x,e.y),t.lineTo(n.x,n.y),t.strokeStyle=`rgba(0, 229, 200, 0.15)`,t.stroke()})}),s.forEach((e,n)=>{c.forEach((r,i)=>{Math.abs(i-n*1.8)<2&&(t.beginPath(),t.moveTo(e.x,e.y),t.lineTo(r.x,r.y),t.strokeStyle=`rgba(124, 92, 252, 0.25)`,t.stroke())})}),o.forEach(e=>{t.beginPath(),t.arc(e.x,e.y,14,0,Math.PI*2),t.fillStyle=`#00E5C8`,t.fill(),t.fillStyle=`#8A8FA8`,t.font=`11px Inter`,t.textAlign=`center`,t.fillText(e.label,e.x,e.y-20)}),s.forEach(e=>{t.beginPath(),t.arc(e.x,e.y,12,0,Math.PI*2),t.fillStyle=`#7C5CFC`,t.fill(),t.fillStyle=`#8A8FA8`,t.font=`11px Inter`,t.textAlign=`center`,t.fillText(e.label,e.x,e.y-18)}),c.forEach(e=>{t.beginPath(),t.arc(e.x,e.y,10,0,Math.PI*2),t.fillStyle=`#4ECDC4`,t.fill(),t.fillStyle=`#C8CCD0`,t.font=`10px JetBrains Mono`,t.textAlign=`center`,t.fillText(e.label,e.x,e.y+22)})}document.addEventListener(`DOMContentLoaded`,()=>{te(),de(),_e(),Ee(),Y(),X(),Z();let e=document.querySelectorAll(`.nav-tab[data-view]`),t=document.querySelectorAll(`.view`);e.forEach(n=>{n.addEventListener(`click`,()=>{e.forEach(e=>e.classList.remove(`active`)),t.forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`);let r=n.getAttribute(`data-view`),i=`view-`+r,a=document.getElementById(i);a&&a.classList.add(`active`),r===`network`?Z():r===`inference`?Y():r===`sre`&&X()})});let n=document.getElementById(`cheatsheet-btn`),r=document.getElementById(`cheatsheet-modal`),i=document.getElementById(`cheatsheet-close`);n&&r&&n.addEventListener(`click`,()=>r.classList.remove(`hidden`)),i&&r&&i.addEventListener(`click`,()=>r.classList.add(`hidden`));let a=document.getElementById(`provision-modal`),o=document.getElementById(`prov-cancel`),s=document.getElementById(`prov-deploy`);document.querySelectorAll(`.provision-btn`).forEach(e=>{e.addEventListener(`click`,()=>{a.classList.remove(`hidden`)})}),o&&o.addEventListener(`click`,()=>a.classList.add(`hidden`)),s&&s.addEventListener(`click`,()=>{a.classList.add(`hidden`);let e=document.getElementById(`prov-name`).value,t=document.getElementById(`prov-type`).value,n=document.getElementById(`prov-gpu`).value,r=document.getElementById(`prov-nodes`).value,i=new CustomEvent(`nava:deploy`,{detail:{name:e,type:t,gpu:n,nodes:r}});window.dispatchEvent(i)});let c=document.getElementById(`prov-nodes`),l=document.getElementById(`prov-nodes-val`);c&&l&&c.addEventListener(`input`,e=>{l.textContent=e.target.value}),window.addEventListener(`nava:openSimulator`,()=>{let e=document.querySelector(`.nav-tab[data-view="simulator"]`);e&&e.click()})});var Q=[{target:`#view-dashboard`,title:`1. The Autonomous AI Cloud Console`,script:`Welcome to Nava Platform Hub — an autonomous AI-native GPU cloud. We provide real-time hardware telemetry, live compute utilization, and automated fleet management across H100, A100, and B200 SXM nodes.`,position:`bottom`},{target:`#nav-inference`,title:`2. Inference Stack Telemetry (vLLM & SGLang)`,script:`Nava prioritizes hyperscale inference efficiency. This stack visualizes real-time metrics for vLLM, SGLang, and TensorRT-LLM engines, tracking PagedAttention KV-Cache pressure and Time-To-First-Token (TTFT).`,position:`bottom`},{target:`#nav-sre`,title:`3. GPU SRE & Bare-Metal Self-Healing Ops`,script:`Our SRE observability engine instruments NVIDIA DCGM metrics and monitors kernel Xid errors in real-time. When a critical failure like Xid 79 occurs, automated runbooks isolate the failed GPU node via the NVIDIA Operator.`,position:`bottom`},{target:`#nav-network`,title:`4. High-Throughput GPU Network Fabric`,script:`Modern AI performance relies heavily on networking. This view maps Clos / Leaf-Spine topologies and tracks 800G RoCEv2 / InfiniBand GPUDirect RDMA throughput with PFC pause frame congestion control.`,position:`bottom`},{target:`#nav-simulator`,title:`5. Workload & Quantization Simulator`,script:`Our killer feature! Before spending a single dollar, users can benchmark FP8/AWQ quantization performance, test vLLM vs TensorRT-LLM, and evaluate EAGLE speculative decoding speedups to optimize their cloud spend.`,position:`bottom`}],$=0;document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`pitch-mode-btn`),t=document.getElementById(`pitch-overlay`),n=document.getElementById(`pitch-highlight`),r=document.getElementById(`pitch-tooltip`);e&&e.addEventListener(`click`,i),document.getElementById(`pitch-close`)?.addEventListener(`click`,a),document.getElementById(`pitch-next`)?.addEventListener(`click`,()=>o($+1)),document.getElementById(`pitch-prev`)?.addEventListener(`click`,()=>o($-1));function i(){$=0,t&&t.classList.remove(`hidden`),setTimeout(()=>{t&&t.classList.add(`active`),o(0)},50)}function a(){t&&t.classList.remove(`active`),setTimeout(()=>{t&&t.classList.add(`hidden`)},300)}function o(e){if(e<0||e>=Q.length){a();return}$=e;let t=Q[e];document.getElementById(`pitch-step-num`).textContent=e+1,document.getElementById(`pitch-title`).textContent=t.title,document.getElementById(`pitch-body`).textContent=t.script,t.target===`#view-dashboard`?document.querySelector(`.nav-tab[data-view="dashboard"]`)?.click():t.target===`#nav-inference`?document.querySelector(`.nav-tab[data-view="inference"]`)?.click():t.target===`#nav-sre`?document.querySelector(`.nav-tab[data-view="sre"]`)?.click():t.target===`#nav-network`?document.querySelector(`.nav-tab[data-view="network"]`)?.click():t.target===`#nav-simulator`&&document.querySelector(`.nav-tab[data-view="simulator"]`)?.click(),setTimeout(()=>{let e=document.querySelector(t.target);if(!e)return;let i=e.getBoundingClientRect();n&&(n.style.top=i.top-10+`px`,n.style.left=i.left-10+`px`,n.style.width=i.width+20+`px`,n.style.height=i.height+20+`px`),r&&(t.position===`bottom`?(r.style.top=i.bottom+20+`px`,r.style.left=Math.max(20,i.left+i.width/2-175)+`px`):t.position===`left`?(r.style.top=i.top+`px`,r.style.left=i.left-370+`px`):t.position===`right`&&(r.style.top=i.top+`px`,r.style.left=i.right+20+`px`))},120)}});