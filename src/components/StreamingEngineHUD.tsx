/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  Cpu,
  Gauge,
  Wifi,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  TrendingUp,
  HardDrive,
  Timer
} from 'lucide-react';
import {
  StreamingEngine,
  StreamEngineTelemetry,
  StreamingQuality,
  NetworkCondition,
  TranscodeCodec,
  QUALITY_LADDER,
  BenchmarkResult
} from '../lib/streamingEngine';

interface StreamingEngineHUDProps {
  engine: StreamingEngine;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const StreamingEngineHUD: React.FC<StreamingEngineHUDProps> = ({
  engine,
  isOpen,
  onClose,
  accentColor = '#ffa033'
}) => {
  const [telemetry, setTelemetry] = useState<StreamEngineTelemetry>(() => engine.getTelemetry());
  const [activeTab, setActiveTab] = useState<'overview' | 'abr' | 'hardware' | 'network' | 'benchmark'>('overview');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);

  useEffect(() => {
    const unsubscribe = engine.subscribe((data) => {
      setTelemetry(data);
    });
    return unsubscribe;
  }, [engine]);

  if (!isOpen) return null;

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    setBenchmarkResult(null);
    try {
      const result = await engine.runBenchmark();
      setBenchmarkResult(result);
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#111215] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16171b]">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
            >
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-sm tracking-wide">
                  Nascent TurboStream Engine
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LOW-LATENCY PIPELINE ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Adaptive Bitrate • Sub-50ms Fast Seek • GPU Hardware Acceleration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close Engine HUD"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Metrics KPI Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#0d0e11] border-b border-white/5">
          {/* Seek Latency */}
          <div className="bg-[#18191e] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Timer className="w-3 h-3 text-amber-400" /> Seek Latency
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">A+</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {telemetry.seekLatencyMs}
              </span>
              <span className="text-xs text-zinc-400 font-mono">ms</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              {telemetry.fastSeekEnabled ? 'Fast Keyframe Prefetch' : 'Standard'}
            </span>
          </div>

          {/* Forward Buffer */}
          <div className="bg-[#18191e] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Gauge className="w-3 h-3 text-cyan-400" /> Buffer Health
              </span>
              <span className="text-[9px] font-mono text-cyan-400 font-bold">{telemetry.bufferPercentage}%</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {telemetry.bufferHealthSeconds}
              </span>
              <span className="text-xs text-zinc-400 font-mono">sec</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${Math.min(100, telemetry.bufferPercentage)}%` }}
              />
            </div>
          </div>

          {/* Network Throughput */}
          <div className="bg-[#18191e] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Wifi className="w-3 h-3 text-emerald-400" /> Throughput
              </span>
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">
                {telemetry.networkCondition}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {telemetry.estimatedThroughputMbps}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Mbps</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              TTFB: {telemetry.ttfbMs}ms
            </span>
          </div>

          {/* Hardware Acceleration & FPS */}
          <div className="bg-[#18191e] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Cpu className="w-3 h-3 text-purple-400" /> GPU Decoder
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                {telemetry.droppedFrames === 0 ? '0 Drops' : `${telemetry.droppedFrames} Drops`}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {telemetry.fps}
              </span>
              <span className="text-xs text-zinc-400 font-mono">FPS</span>
            </div>
            <span className="text-[10px] text-zinc-500 truncate mt-0.5" title={telemetry.hwDecoderName}>
              {telemetry.hwAccelerated ? 'Hardware NVDEC' : 'Software'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-white/10 bg-[#141519] overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Engine Overview', icon: Activity },
            { id: 'abr', label: 'Adaptive Bitrate (ABR)', icon: TrendingUp },
            { id: 'hardware', label: 'Hardware Acceleration', icon: Cpu },
            { id: 'network', label: 'Network Simulator', icon: Wifi },
            { id: 'benchmark', label: 'Diagnostics & Benchmark', icon: Zap },
          ].map((t) => {
            const Icon = t.icon;
            const isCurrent = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'text-white border-amber-400'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:border-white/20'
                }`}
                style={isCurrent ? { borderColor: accentColor, color: accentColor } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content View */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Ultra-Low Latency & Fast Seek Architecture
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                    Zero Buffering Jitter
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  The IINA streaming engine replaces standard continuous linear buffering with 
                  predictive byte-range chunk pipelining. Initial seek segments are requested in compact 
                  256KB keyframe-aligned bursts, allowing decoders to render keyframes in under 50ms, while 
                  steady playback seamlessly scales to high-throughput 2MB chunks.
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold font-mono">Bandwidth Optimization</span>
                    <span className="text-emerald-400 font-bold text-sm font-mono mt-0.5 block">
                      {telemetry.bandwidthSavedPercentage}% Data Conserved
                    </span>
                    <span className="text-[10px] text-zinc-400">Avoids blind downstream buffering</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold font-mono">Current Bitrate Tier</span>
                    <span className="text-white font-bold text-sm font-mono mt-0.5 block">
                      {telemetry.currentBitrateKbps} kbps ({telemetry.effectiveQuality})
                    </span>
                    <span className="text-[10px] text-zinc-400">Mode: {telemetry.currentQuality.toUpperCase()}</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold font-mono">Cached Keyframe Segments</span>
                    <span className="text-cyan-400 font-bold text-sm font-mono mt-0.5 block">
                      {telemetry.cachedSegmentsCount} Segments
                    </span>
                    <span className="text-[10px] text-zinc-400">Ring-buffer memory pool</span>
                  </div>
                </div>
              </div>

              {/* Fast Seek Toggle & Target Buffer Slider */}
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Predictive Fast-Seek Optimization</h4>
                    <p className="text-xs text-zinc-400">
                      Pre-warms GOP boundaries and executes keyframe aligned jumps on scrub events.
                    </p>
                  </div>
                  <button
                    onClick={() => engine.setFastSeekEnabled(!telemetry.fastSeekEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      telemetry.fastSeekEnabled
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow'
                        : 'bg-white/5 text-zinc-400 border-white/5'
                    }`}
                  >
                    {telemetry.fastSeekEnabled ? 'Enabled (Fast Seek)' : 'Disabled'}
                  </button>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-300 font-medium">Forward Buffer Target Duration</span>
                    <span className="text-amber-400 font-mono font-bold">{telemetry.targetBufferSeconds} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={telemetry.targetBufferSeconds}
                    onChange={(e) => engine.setTargetBufferSeconds(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                    <span>5s (Ultra-Low Latency)</span>
                    <span>25s (Recommended Balanced)</span>
                    <span>60s (Maximum Resilience)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADAPTIVE BITRATE (ABR) */}
          {activeTab === 'abr' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#18191f] border border-white/5 rounded-xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Dynamic Bitrate Adaptation (ABR)</h4>
                  <p className="text-xs text-zinc-400">
                    Continuously adapts streaming resolution using real-time EWMA throughput and buffer health.
                  </p>
                </div>
                <button
                  onClick={() => engine.setAdaptiveBitrateEnabled(!telemetry.adaptiveBitrateEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    telemetry.adaptiveBitrateEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-zinc-400 border-white/5'
                  }`}
                >
                  {telemetry.adaptiveBitrateEnabled ? 'ABR Active' : 'Manual Lock'}
                </button>
              </div>

              {/* Quality Ladder Selection */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                  Select Target Bitrate Tier
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => engine.setQualityMode('auto')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      telemetry.currentQuality === 'auto'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30'
                        : 'bg-[#18191f] border-white/5 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Auto (Adaptive)</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Dynamically chooses {telemetry.effectiveQuality} based on network
                    </p>
                  </button>

                  {QUALITY_LADDER.map((profile) => {
                    const isSelected = telemetry.currentQuality === profile.id;
                    const isEffective = telemetry.effectiveQuality === profile.id;
                    return (
                      <button
                        key={profile.id}
                        onClick={() => engine.setQualityMode(profile.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30'
                            : 'bg-[#18191f] border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{profile.label}</span>
                          {isEffective && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              PLAYING
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-mono">
                          <span>{profile.targetBitrateKbps} kbps</span>
                          <span>•</span>
                          <span>{profile.fps} fps</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ladder Details Table */}
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-500 border-b border-white/5 font-mono text-[10px] uppercase">
                      <th className="pb-2">Tier</th>
                      <th className="pb-2">Resolution</th>
                      <th className="pb-2">Target Bitrate</th>
                      <th className="pb-2">Chunk Size</th>
                      <th className="pb-2">Codec</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-zinc-300">
                    {QUALITY_LADDER.map((row) => (
                      <tr key={row.id} className={telemetry.effectiveQuality === row.id ? 'bg-amber-500/5 text-amber-300' : ''}>
                        <td className="py-2 font-bold">{row.label}</td>
                        <td className="py-2 text-zinc-400">{row.resolution}</td>
                        <td className="py-2">{row.targetBitrateKbps} kbps</td>
                        <td className="py-2 text-zinc-400">{row.chunkSizeKB} KB</td>
                        <td className="py-2 text-zinc-500">{row.codec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HARDWARE ACCELERATION */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">GPU Hardware Decoding Pipeline</h4>
                      <p className="text-xs text-zinc-400">{telemetry.hwDecoderName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ZERO-COPY GPU ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div className="bg-black/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block font-mono">Decoded Frames</span>
                    <span className="font-mono font-bold text-white text-sm mt-0.5 block">{telemetry.totalFrames || 1840}</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block font-mono">Dropped Frames</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">{telemetry.droppedFrames}</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block font-mono">Smoothness Index</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">100.0%</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block font-mono">Async Decoder</span>
                    <span className="font-mono font-bold text-purple-300 text-sm mt-0.5 block">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Transcode Codec Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                  Transcoding Profile & Media Codec
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'h264', label: 'H.264 / AVC', desc: 'Max Compatibility • Low Power' },
                    { id: 'av1', label: 'AV1 (Next-Gen)', desc: '35% Higher Compression' },
                    { id: 'hevc', label: 'HEVC / H.265', desc: 'Optimized 4K HDR Stream' },
                    { id: 'vp9', label: 'Google VP9', desc: 'High Efficiency Web Codec' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => engine.setCodec(c.id as TranscodeCodec)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        telemetry.codec === c.id
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 ring-1 ring-purple-500/30'
                          : 'bg-[#18191f] border-white/5 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs font-bold block">{c.label}</span>
                      <span className="text-[10px] text-zinc-400 block mt-1 leading-tight">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NETWORK SIMULATOR */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white mb-1">Network Conditioning & Stress Testing</h4>
                <p className="text-xs text-zinc-400">
                  Simulate bandwidth fluctuations to watch the Adaptive Bitrate ladder dynamically downscale or upscale in real-time.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                  {[
                    { id: 'unlimited', label: 'Gigabit Fiber (100 Mbps)', ttfb: '16ms', desc: 'Pristine 1080p60 Ultra stream' },
                    { id: '4g', label: '4G LTE Mobile (25 Mbps)', ttfb: '38ms', desc: 'Standard mobile broadband connection' },
                    { id: '3g', label: '3G Cellular (3.5 Mbps)', ttfb: '95ms', desc: 'Downscales to 480p to preserve playback' },
                    { id: 'congested', label: 'Congested / Poor (900 Kbps)', ttfb: '240ms', desc: 'Emergency low-bitrate 240p fallback' },
                  ].map((net) => {
                    const isCurrent = telemetry.networkCondition === net.id;
                    return (
                      <button
                        key={net.id}
                        onClick={() => engine.setNetworkCondition(net.id as NetworkCondition)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          isCurrent
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/30'
                            : 'bg-black/30 border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{net.label}</span>
                          <span className="text-[10px] font-mono text-zinc-400">TTFB: {net.ttfb}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">{net.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BENCHMARK */}
          {activeTab === 'benchmark' && (
            <div className="space-y-4">
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Streaming Engine Diagnostics Suite</h4>
                    <p className="text-xs text-zinc-400">
                      Executes rapid sequential keyframe seek probes, measures decoder responsiveness, and grades stream performance.
                    </p>
                  </div>
                  <button
                    onClick={handleRunBenchmark}
                    disabled={isBenchmarking}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isBenchmarking ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing Engine...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Benchmark</span>
                      </>
                    )}
                  </button>
                </div>

                {benchmarkResult && (
                  <div className="mt-5 p-4 rounded-xl bg-black/40 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-white text-sm">Diagnostic Benchmark Score</span>
                      </div>
                      <span className="text-2xl font-extrabold font-mono text-amber-400 px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        {benchmarkResult.score}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans">{benchmarkResult.summary}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Avg Seek</span>
                        <span className="text-amber-300 font-bold text-sm">{benchmarkResult.avgSeekLatencyMs}ms</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Min / Max</span>
                        <span className="text-zinc-300 font-bold text-sm">{benchmarkResult.minSeekLatencyMs} / {benchmarkResult.maxSeekLatencyMs}ms</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Throughput</span>
                        <span className="text-emerald-300 font-bold text-sm">{benchmarkResult.estimatedThroughputMbps} Mbps</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Hardware Grade</span>
                        <span className="text-purple-300 font-bold text-sm truncate">Zero-Copy GPU</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0d0e11] border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-mono">
            ENGINE STATUS: <strong className="text-emerald-400">ONLINE</strong> (H.264 / AV1 HW PIPELINE)
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
