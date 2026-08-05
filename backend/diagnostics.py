"""
diagnostics.py — Real-time GPU Hardware & Infrastructure Flaw Analysis Engine
Analyzes user-provided cluster configurations and detects hardware bottlenecks,
thermal throttling risks, PCIe bandwidth limits, VRAM OOM risks, and power sag vulnerabilities.
"""

def analyze_cluster_flaws(config: dict) -> dict:
    gpu_count = int(config.get("gpu_count", 8))
    gpu_model = config.get("gpu_model", "H100 SXM")
    workload_type = config.get("workload_type", "LLM Fine-tuning")
    cooling_type = config.get("cooling_type", "air") # 'air' or 'liquid'
    pcie_gen = config.get("pcie_gen", "gen4") # 'gen4' or 'gen5'
    power_limit_w = int(config.get("power_limit_w", 700))
    vram_gb = int(config.get("vram_gb", 80))

    flaws = []
    recommendations = []
    health_score = 100

    # 1. Thermal Throttling Flaw Analysis
    if gpu_model in ["H100 SXM", "B200 SXM"] and cooling_type == "air":
        flaws.append({
            "category": "Thermal",
            "severity": "CRITICAL",
            "title": "Severe Thermal Throttling Risk (>85°C)",
            "description": f"{gpu_model} running at {power_limit_w}W generates excessive heat density. Standard Air Cooling will cause dynamic SM clock downclocking (Xid 43) under sustained load.",
            "impact": "18-35% loss in computing throughput"
        })
        recommendations.append("Switch from Air Cooling to Direct Liquid Cooling (DLC) to maintain junction temps below 72°C.")
        health_score -= 25

    # 2. PCIe Bandwidth Bottleneck Analysis
    if pcie_gen == "gen4" and gpu_count >= 8:
        flaws.append({
            "category": "Interconnect",
            "severity": "WARNING",
            "title": "PCIe Gen 4 Bandwidth Bottleneck (32 GB/s limit)",
            "description": f"PCIe Gen 4 restricts host-to-device transfers. Distributed {workload_type} across {gpu_count} nodes will experience CPU-to-GPU data starvation.",
            "impact": "Gradient synchronization latency increases by ~2.4x"
        })
        recommendations.append("Upgrade host bus to PCIe Gen 5 (64 GB/s) or enable GPUDirect RDMA over 800G RoCEv2.")
        health_score -= 15

    # 3. VRAM OOM Memory Footprint Flaw
    if workload_type in ["LLM Fine-tuning", "Hyperscale Inference"] and vram_gb < 80:
        flaws.append({
            "category": "Memory",
            "severity": "CRITICAL",
            "title": "VRAM Out-Of-Memory (OOM) Crash Risk",
            "description": f"Selected VRAM capacity ({vram_gb} GB) is insufficient for 70B+ model KV-Cache paging during peak concurrency.",
            "impact": "High probability of CUDA OOM process kills"
        })
        recommendations.append("Upgrade VRAM capacity to 80GB/192GB or enable FP8 / AWQ 4-bit Quantization.")
        health_score -= 30

    # 4. Power Delivery / Voltage Sag Flaw
    if power_limit_w < 500 and gpu_model == "H100 SXM":
        flaws.append({
            "category": "Power",
            "severity": "WARNING",
            "title": "Power Under-provisioning (Capped at 500W)",
            "description": "Artificially capping H100 SXM power below 700W limits Tensor Core boost clock frequencies.",
            "impact": "Reduces peak FP8 FLOPS by 22%"
        })
        recommendations.append("Set GPU power cap to maximum TDP (700W) with dual-redundant PDU power feeds.")
        health_score -= 15

    # Default Optimal Result if no critical flaws
    if not flaws:
        flaws.append({
            "category": "Optimal",
            "severity": "INFO",
            "title": "No Critical Hardware Flaws Detected",
            "description": f"The cluster configuration ({gpu_count}x {gpu_model}, {cooling_type.upper()} cooling, {pcie_gen.upper()}) is well-balanced for {workload_type}.",
            "impact": "Operating at peak theoretical performance"
        })
        recommendations.append("Configuration is optimal. Enable automated SRE monitoring for day-2 operations.")

    return {
        "status": "COMPLETED",
        "health_score": max(10, health_score),
        "cluster_config": {
            "gpu_count": gpu_count,
            "gpu_model": gpu_model,
            "workload_type": workload_type,
            "cooling_type": cooling_type,
            "pcie_gen": pcie_gen,
            "power_limit_w": power_limit_w,
            "vram_gb": vram_gb
        },
        "flaws_detected_count": len([f for f in flaws if f["severity"] != "INFO"]),
        "flaws": flaws,
        "recommendations": recommendations
    }
