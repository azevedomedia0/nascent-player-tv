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
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Sliders,
} from 'lucide-react';
import {
  StreamingEngine,
  StreamEngineTelemetry,
  StreamingQuality,
  TranscodeCodec,
  QUALITY_LADDER,
  BenchmarkResult,
} from '../lib/streamingEngine';

interface StreamingEngineHUDProps {
  engine: StreamingEngine;
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

function formatMbps(v: number | null): string {
  if (v === null) return '—';
  return v < 10 ? v.toFixed(2) : v.toFixed(1);
}

function formatMs(v: number | null): string {
  if (v === null) return '—';
  return String(v);
}

function formatBytes(v: number | null): string {
  if (v === null) return '—';
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(2)} MB`;
}

export const StreamingEngineHUD: React.FC<StreamingEngineHUDProps> = ({
  engine,
  isOpen,
  onClose,
  accentColor = '#ffa033',
}) => {
  const [telemetry, setTelemetry] = useState<StreamEngineTelemetry>(() => engine.getTelemetry());
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'hardware' | 'benchmark'>('overview');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

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
    setBenchmarkError(null);
    try {
      const result = await engine.runBenchmark();
      setBenchmarkResult(result);
    } catch (err) {
      setBenchmarkError(err instanceof Error ? err.message : 'Benchmark failed');
    } finally {
      setIsBenchmarking(false);
    }
  };

  const idle = !telemetry.videoAttached;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#111215] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
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
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    idle
                      ? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${idle ? 'bg-zinc-400' : 'bg-emerald-400 animate-pulse'}`}
                  />
                  {idle ? 'IDLE — NO VIDEO' : 'MEASURING'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Measured throughput • Seek latency • Buffer health — no simulated numbers
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#0d0e11] border-b border-white/5">
          <div className="bg-[#18191e] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Timer className="w-3 h-3 text-amber-400" /> Seek Latency
              </span>
              <span className="text-[9px] font-mono text-zinc-500 font-bold">measured</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {formatMs(telemetry.seekLatencyMs)}
              </span>
              <span className="text-xs text-zinc-400 font-mono">ms</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              {telemetry.fastSeekEnabled ? 'Fast seek enabled' : 'Standard seek'}
            </span>
          </div>

          <div className="bg-[#18191e] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Gauge className="w-3 h-3 text-cyan-400" /> Buffer Health
              </span>
              <span className="text-[9px] font-mono text-cyan-400 font-bold">
                {idle ? '—' : `${telemetry.bufferPercentage}%`}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {idle ? '—' : telemetry.bufferHealthSeconds}
              </span>
              <span className="text-xs text-zinc-400 font-mono">sec</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: idle ? '0%' : `${Math.min(100, telemetry.bufferPercentage)}%` }}
              />
            </div>
          </div>

          <div className="bg-[#18191e] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Wifi className="w-3 h-3 text-emerald-400" /> Throughput
              </span>
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">
                {telemetry.estimatedThroughputMbps === null ? 'measuring' : 'measured'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {formatMbps(telemetry.estimatedThroughputMbps)}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Mbps</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              TTFB: {formatMs(telemetry.ttfbMs)}
              {telemetry.ttfbMs !== null ? 'ms' : ''}
            </span>
          </div>

          <div className="bg-[#18191e] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Cpu className="w-3 h-3 text-purple-400" /> Decoder
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                {idle
                  ? '—'
                  : telemetry.droppedFrames === 0
                    ? '0 drops'
                    : `${telemetry.droppedFrames} drops`}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white">
                {telemetry.fps === null ? '—' : telemetry.fps}
              </span>
              <span className="text-xs text-zinc-400 font-mono">FPS</span>
            </div>
            <span className="text-[10px] text-zinc-500 truncate mt-0.5" title={telemetry.hwDecoderName}>
              {telemetry.hwDecoderName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-6 border-b border-white/10 bg-[#141519] overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'quality', label: 'Quality Preference', icon: Sliders },
            { id: 'hardware', label: 'Hardware', icon: Cpu },
            { id: 'benchmark', label: 'Benchmark', icon: Zap },
          ].map((t) => {
            const Icon = t.icon;
            const isCurrent = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
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

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Live playback telemetry
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-semibold">
                    {idle ? 'Attach a video to measure' : 'Values update every ~600ms'}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Throughput and TTFB come from Performance Resource Timing and optional Range
                  probes against the active stream URL. Bytes transferred are accumulated from
                  those real transfers only. Seek latency is measured between seeking and seeked
                  events on the video element.
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold font-mono">
                      Bytes transferred
                    </span>
                    <span className="text-emerald-400 font-bold text-sm font-mono mt-0.5 block">
                      {formatBytes(telemetry.bytesTransferred)}
                    </span>
                    <span className="text-[10px] text-zinc-400">measured</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold font-mono">
                      Quality preference
                    </span>
                    <span className="text-white font-bold text-sm font-mono mt-0.5 block">
                      {telemetry.qualityPreference}
                      {telemetry.currentBitrateKbps !== null
                        ? ` · ${telemetry.currentBitrateKbps} kbps`
                        : ''}
                    </span>
                    <span className="text-[10px] text-zinc-400">label only — no HLS ladder yet</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold font-mono">
                      Engine state
                    </span>
                    <span className="text-cyan-400 font-bold text-sm font-mono mt-0.5 block uppercase">
                      {telemetry.state}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {telemetry.bufferedRanges.length} buffered range
                      {telemetry.bufferedRanges.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Fast-seek preference</h4>
                    <p className="text-xs text-zinc-400">
                      Uses the browser fastSeek API when available; otherwise currentTime.
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
                    {telemetry.fastSeekEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-300 font-medium">Forward buffer target</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {telemetry.targetBufferSeconds} seconds
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={telemetry.targetBufferSeconds}
                    onChange={(e) => engine.setTargetBufferSeconds(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-[#18191f] border border-amber-500/20 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Manual preference only</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Playback is a single file — there are no alternate renditions to switch.
                    Selecting a tier updates the preference label only. Real HLS/MSE adaptive
                    bitrate is a follow-up.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                  Preferred quality label
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUALITY_LADDER.map((profile) => {
                    const isSelected = telemetry.qualityPreference === profile.id;
                    return (
                      <button
                        key={profile.id}
                        onClick={() => engine.setQualityMode(profile.id as StreamingQuality)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30'
                            : 'bg-[#18191f] border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{profile.label}</span>
                          {isSelected && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              PREFERRED
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
                      <tr
                        key={row.id}
                        className={
                          telemetry.qualityPreference === row.id
                            ? 'bg-amber-500/5 text-amber-300'
                            : ''
                        }
                      >
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

          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Hardware decode detection</h4>
                      <p className="text-xs text-zinc-400">{telemetry.hwDecoderName}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                      telemetry.hwAccelerated === true
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : telemetry.hwAccelerated === false
                          ? 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}
                  >
                    {telemetry.hwAccelerated === true
                      ? 'HW EFFICIENT'
                      : telemetry.hwAccelerated === false
                        ? 'SOFTWARE / INEFFICIENT'
                        : 'DETECTING…'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div className="bg-black/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block font-mono">Decoded frames</span>
                    <span className="font-mono font-bold text-white text-sm mt-0.5 block">
                      {idle ? '—' : telemetry.totalFrames}
                    </span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block font-mono">Dropped frames</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                      {idle ? '—' : telemetry.droppedFrames}
                    </span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block font-mono">Drop rate</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                      {telemetry.dropRatePercentage === null
                        ? '—'
                        : `${telemetry.dropRatePercentage}%`}
                    </span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block font-mono">Corrupted</span>
                    <span className="font-mono font-bold text-purple-300 text-sm mt-0.5 block">
                      {idle ? '—' : telemetry.corruptedFrames}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                  Codec preference (label)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'h264', label: 'H.264 / AVC', desc: 'Max compatibility' },
                    { id: 'av1', label: 'AV1', desc: 'Next-gen compression' },
                    { id: 'hevc', label: 'HEVC / H.265', desc: '4K / HDR profile' },
                    { id: 'vp9', label: 'VP9', desc: 'Web codec' },
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
                      <span className="text-[10px] text-zinc-400 block mt-1 leading-tight">
                        {c.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benchmark' && (
            <div className="space-y-4">
              <div className="bg-[#18191f] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">Measured seek benchmark</h4>
                    <p className="text-xs text-zinc-400">
                      Performs real seeks on the attached video and times seeking → seeked.
                      Score is derived from measured average latency only.
                    </p>
                  </div>
                  <button
                    onClick={handleRunBenchmark}
                    disabled={isBenchmarking || idle}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isBenchmarking ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Measuring…</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Benchmark</span>
                      </>
                    )}
                  </button>
                </div>

                {idle && (
                  <p className="mt-3 text-xs text-amber-300/90 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Attach and load a video before running the benchmark.
                  </p>
                )}

                {benchmarkError && (
                  <p className="mt-3 text-xs text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {benchmarkError}
                  </p>
                )}

                {benchmarkResult && (
                  <div className="mt-5 p-4 rounded-xl bg-black/40 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-white text-sm">Measured score</span>
                      </div>
                      <span className="text-2xl font-extrabold font-mono text-amber-400 px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        {benchmarkResult.score}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans">{benchmarkResult.summary}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Avg seek</span>
                        <span className="text-amber-300 font-bold text-sm">
                          {benchmarkResult.avgSeekLatencyMs}ms
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Min / Max</span>
                        <span className="text-zinc-300 font-bold text-sm">
                          {benchmarkResult.minSeekLatencyMs} / {benchmarkResult.maxSeekLatencyMs}ms
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Throughput</span>
                        <span className="text-emerald-300 font-bold text-sm">
                          {benchmarkResult.estimatedThroughputMbps === null
                            ? '—'
                            : `${formatMbps(benchmarkResult.estimatedThroughputMbps)} Mbps`}
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Hardware</span>
                        <span className="text-purple-300 font-bold text-sm truncate">
                          {benchmarkResult.hwAccelerationGrade}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-[#0d0e11] border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-mono">
            STATUS:{' '}
            <strong className={idle ? 'text-zinc-400' : 'text-emerald-400'}>
              {idle ? 'IDLE' : telemetry.state.toUpperCase()}
            </strong>
            {' · '}
            preference {telemetry.qualityPreference} / {telemetry.codec}
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
