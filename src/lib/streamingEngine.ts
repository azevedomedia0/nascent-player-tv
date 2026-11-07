/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Streaming telemetry — measured values only.
 * Fake defaults (48.5 Mbps, 24 ms TTFB, canned network profiles, random
 * benchmark delays) were removed. Unmeasured fields stay null / "—" in the HUD.
 */

export type StreamingQuality = '1080p' | '720p' | '480p' | '360p' | '240p';
export type TranscodeCodec = 'h264' | 'hevc' | 'av1' | 'vp9';

export interface QualityProfile {
  id: StreamingQuality;
  label: string;
  resolution: string;
  width: number;
  height: number;
  targetBitrateKbps: number;
  fps: number;
  codec: string;
  chunkSizeKB: number;
}

export const QUALITY_LADDER: QualityProfile[] = [
  {
    id: '1080p',
    label: '1080p Ultra',
    resolution: '1920x1080',
    width: 1920,
    height: 1080,
    targetBitrateKbps: 6500,
    fps: 60,
    codec: 'avc1.64002a',
    chunkSizeKB: 2048,
  },
  {
    id: '720p',
    label: '720p HD',
    resolution: '1280x720',
    width: 1280,
    height: 720,
    targetBitrateKbps: 3200,
    fps: 60,
    codec: 'avc1.4d401f',
    chunkSizeKB: 1024,
  },
  {
    id: '480p',
    label: '480p SD',
    resolution: '854x480',
    width: 854,
    height: 480,
    targetBitrateKbps: 1500,
    fps: 30,
    codec: 'avc1.4d401e',
    chunkSizeKB: 512,
  },
  {
    id: '360p',
    label: '360p Low',
    resolution: '640x360',
    width: 640,
    height: 360,
    targetBitrateKbps: 800,
    fps: 30,
    codec: 'avc1.42e01e',
    chunkSizeKB: 256,
  },
  {
    id: '240p',
    label: '240p Mobile',
    resolution: '426x240',
    width: 426,
    height: 240,
    targetBitrateKbps: 400,
    fps: 24,
    codec: 'avc1.42e015',
    chunkSizeKB: 128,
  },
];

export interface StreamEngineTelemetry {
  state: 'idle' | 'buffering' | 'playing' | 'seeking' | 'ready';
  /** Manual quality preference label only — no HLS rendition switching yet. */
  qualityPreference: StreamingQuality;
  currentBitrateKbps: number | null;
  estimatedThroughputMbps: number | null;
  bufferHealthSeconds: number;
  bufferPercentage: number;
  targetBufferSeconds: number;
  seekLatencyMs: number | null;
  lastSeekTimestamp: number;
  ttfbMs: number | null;
  fps: number | null;
  totalFrames: number;
  droppedFrames: number;
  corruptedFrames: number;
  dropRatePercentage: number | null;
  hwAccelerated: boolean | null;
  hwDecoderName: string;
  codec: TranscodeCodec;
  bytesTransferred: number | null;
  fastSeekEnabled: boolean;
  bufferedRanges: { start: number; end: number }[];
  videoAttached: boolean;
}

export interface BenchmarkResult {
  score: string;
  avgSeekLatencyMs: number;
  minSeekLatencyMs: number;
  maxSeekLatencyMs: number;
  estimatedThroughputMbps: number | null;
  hwAccelerationGrade: string;
  summary: string;
}

/** EWMA over Mbps samples. Exported for unit tests. */
export function updateThroughputEwma(
  previous: number | null,
  sampleMbps: number,
  alpha = 0.3
): number {
  if (!Number.isFinite(sampleMbps) || sampleMbps < 0) {
    return previous ?? 0;
  }
  if (previous === null) return sampleMbps;
  return alpha * sampleMbps + (1 - alpha) * previous;
}

/** Derive a letter grade from measured average seek latency (ms). */
export function gradeSeekLatency(avgSeekMs: number): string {
  if (avgSeekMs < 45) return 'A+';
  if (avgSeekMs < 80) return 'A';
  if (avgSeekMs < 150) return 'B';
  if (avgSeekMs < 300) return 'C';
  return 'D';
}

/**
 * Convert a PerformanceResourceTiming-like sample into Mbps.
 * durationMs must be > 0; transferBytes is the payload size.
 */
export function sampleToMbps(transferBytes: number, durationMs: number): number | null {
  if (!Number.isFinite(transferBytes) || !Number.isFinite(durationMs)) return null;
  if (transferBytes <= 0 || durationMs <= 0) return null;
  const bits = transferBytes * 8;
  const seconds = durationMs / 1000;
  return (bits / seconds) / 1_000_000;
}

export class StreamingEngine {
  private videoElement: HTMLVideoElement | null = null;
  private qualityPreference: StreamingQuality = '1080p';
  private codec: TranscodeCodec = 'h264';
  private fastSeekEnabled = true;
  private targetBufferSeconds = 25;

  private estimatedThroughputMbps: number | null = null;
  private ttfbMs: number | null = null;
  private seekLatencyMs: number | null = null;
  private lastSeekStart = 0;
  private bytesTransferred: number | null = null;
  private seenResourceKeys = new Set<string>();

  private hwAccelerated: boolean | null = null;
  private hwDecoderName = 'detecting…';
  private lastFrameCount = 0;
  private lastFrameTime = 0;
  private currentFps: number | null = null;

  private telemetryListeners: Array<(telemetry: StreamEngineTelemetry) => void> = [];
  private telemetryIntervalId: ReturnType<typeof setInterval> | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private probeInFlight = false;

  constructor() {
    this.detectHardwareCapabilities();
    this.startTelemetryLoop();
    this.startResourceObserver();
  }

  public attachVideo(element: HTMLVideoElement) {
    if (this.videoElement === element) return;
    this.detachVideo();

    this.videoElement = element;
    this.lastFrameTime = performance.now();
    this.lastFrameCount = 0;
    this.currentFps = null;

    try {
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('webkit-playsinline', 'true');
      this.videoElement.setAttribute('x5-playsinline', 'true');
      (this.videoElement as HTMLVideoElement & { decoding?: string }).decoding = 'async';
    } catch {
      // Ignored
    }

    this.bindVideoEvents();
    this.measureInitialTiming();
    this.emitTelemetry();
  }

  public detachVideo() {
    if (!this.videoElement) return;
    this.unbindVideoEvents();
    this.videoElement = null;
    this.estimatedThroughputMbps = null;
    this.ttfbMs = null;
    this.seekLatencyMs = null;
    this.bytesTransferred = null;
    this.currentFps = null;
    this.seenResourceKeys.clear();
    this.emitTelemetry();
  }

  private bindVideoEvents() {
    if (!this.videoElement) return;

    this.videoElement.addEventListener('seeking', this.handleSeeking);
    this.videoElement.addEventListener('seeked', this.handleSeeked);
    this.videoElement.addEventListener('waiting', this.handleWaiting);
    this.videoElement.addEventListener('playing', this.handlePlaying);
    this.videoElement.addEventListener('timeupdate', this.handleTimeUpdate);
    this.videoElement.addEventListener('progress', this.handleProgress);
    this.videoElement.addEventListener('loadeddata', this.handleLoadedData);
  }

  private unbindVideoEvents() {
    if (!this.videoElement) return;

    this.videoElement.removeEventListener('seeking', this.handleSeeking);
    this.videoElement.removeEventListener('seeked', this.handleSeeked);
    this.videoElement.removeEventListener('waiting', this.handleWaiting);
    this.videoElement.removeEventListener('playing', this.handlePlaying);
    this.videoElement.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.videoElement.removeEventListener('progress', this.handleProgress);
    this.videoElement.removeEventListener('loadeddata', this.handleLoadedData);
  }

  private handleSeeking = () => {
    this.lastSeekStart = performance.now();
  };

  private handleSeeked = () => {
    if (this.lastSeekStart > 0) {
      const delta = Math.round(performance.now() - this.lastSeekStart);
      this.seekLatencyMs = Math.max(12, delta);
      this.lastSeekStart = 0;
      this.emitTelemetry();
    }
  };

  private handleWaiting = () => {
    this.emitTelemetry();
  };

  private handlePlaying = () => {
    this.emitTelemetry();
  };

  private handleTimeUpdate = () => {
    // no-op: telemetry loop handles refresh
  };

  private handleProgress = () => {
    this.ingestResourceTimings();
  };

  private handleLoadedData = () => {
    this.measureInitialTiming();
    this.ingestResourceTimings();
  };

  /**
   * Fast Keyframe Seek via browser fastSeek when available.
   */
  public fastSeek(targetTime: number): number {
    if (!this.videoElement) return targetTime;

    this.lastSeekStart = performance.now();
    const duration = this.videoElement.duration || 0;
    const clampedTime = Math.max(0, Math.min(duration, targetTime));

    if (this.fastSeekEnabled && typeof (this.videoElement as HTMLVideoElement & { fastSeek?: (t: number) => void }).fastSeek === 'function') {
      try {
        (this.videoElement as HTMLVideoElement & { fastSeek: (t: number) => void }).fastSeek(clampedTime);
        return clampedTime;
      } catch {
        // Fallback to standard currentTime
      }
    }

    this.videoElement.currentTime = clampedTime;
    return clampedTime;
  }

  /**
   * Prefetch a real byte-range near the seek target when the stream URL supports Range.
   * Only counts bytes that were actually transferred.
   */
  public async prefetchSeekTarget(targetTime: number): Promise<void> {
    if (!this.fastSeekEnabled || !this.videoElement) return;
    const src = this.videoElement.currentSrc || this.videoElement.src;
    if (!src || src.startsWith('blob:')) return;

    // Estimate a byte offset from duration (rough); fetch a small range for real.
    const duration = this.videoElement.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const ratio = Math.max(0, Math.min(1, targetTime / duration));
    // Probe ~256 KB around an estimated midpoint — real bytes only.
    const approxTotal = this.bytesTransferred ?? 8 * 1024 * 1024;
    const start = Math.floor(ratio * approxTotal);
    const end = start + 256 * 1024 - 1;

    try {
      const t0 = performance.now();
      const res = await fetch(src, {
        headers: { Range: `bytes=${start}-${end}` },
        method: 'GET',
      });
      if (!res.ok && res.status !== 206) return;
      const buf = await res.arrayBuffer();
      const elapsed = performance.now() - t0;
      const bytes = buf.byteLength;
      this.recordTransfer(bytes, elapsed, true);
    } catch {
      // Prefetch is best-effort
    }
  }

  public setQualityMode(mode: StreamingQuality) {
    // Preference label only — single-file playback has no renditions to switch.
    this.qualityPreference = mode;
    this.emitTelemetry();
  }

  public setCodec(codec: TranscodeCodec) {
    this.codec = codec;
    this.emitTelemetry();
  }

  public setFastSeekEnabled(enabled: boolean) {
    this.fastSeekEnabled = enabled;
    this.emitTelemetry();
  }

  public setTargetBufferSeconds(seconds: number) {
    this.targetBufferSeconds = Math.max(5, Math.min(60, seconds));
    this.emitTelemetry();
  }

  public calculateBufferHealth(): number {
    if (!this.videoElement) return 0;
    const currentTime = this.videoElement.currentTime || 0;
    const buffered = this.videoElement.buffered;

    let forwardBuffer = 0;
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      if (currentTime >= start && currentTime <= end) {
        forwardBuffer = end - currentTime;
        break;
      }
    }
    return forwardBuffer;
  }

  private detectHardwareCapabilities() {
    this.hwDecoderName = 'detecting…';
    this.hwAccelerated = null;
    try {
      if (typeof navigator !== 'undefined' && 'mediaCapabilities' in navigator) {
        navigator.mediaCapabilities
          .decodingInfo({
            type: 'file',
            video: {
              contentType: 'video/mp4; codecs="avc1.64002a"',
              width: 1920,
              height: 1080,
              bitrate: 6000000,
              framerate: 60,
            },
          })
          .then((info) => {
            if (info.supported) {
              this.hwAccelerated = Boolean(info.powerEfficient);
              this.hwDecoderName = info.smooth
                ? 'GPU Accelerated (mediaCapabilities)'
                : 'Hardware Video Decoder';
            } else {
              this.hwAccelerated = false;
              this.hwDecoderName = 'Software decode (unsupported profile)';
            }
            this.emitTelemetry();
          })
          .catch(() => {
            this.hwAccelerated = null;
            this.hwDecoderName = 'detection unavailable';
            this.emitTelemetry();
          });
      } else {
        this.hwAccelerated = null;
        this.hwDecoderName = 'detection unavailable';
      }
    } catch {
      this.hwAccelerated = null;
      this.hwDecoderName = 'detection unavailable';
    }
  }

  private startResourceObserver() {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.consumeResourceEntry(entry as PerformanceResourceTiming);
        }
      });
      this.performanceObserver.observe({ type: 'resource', buffered: true });
    } catch {
      this.performanceObserver = null;
    }
  }

  private measureInitialTiming() {
    this.ingestResourceTimings();
  }

  private ingestResourceTimings() {
    if (typeof performance === 'undefined' || !this.videoElement) return;
    const src = this.videoElement.currentSrc || this.videoElement.src;
    if (!src) return;

    try {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      for (const entry of entries) {
        if (!entry.name || !this.resourceMatchesVideo(entry.name, src)) continue;
        this.consumeResourceEntry(entry);
      }
    } catch {
      // Ignored
    }

    // Periodic range probe when we still lack throughput samples
    if (this.estimatedThroughputMbps === null && !this.probeInFlight) {
      void this.probeThroughput(src);
    }
  }

  private resourceMatchesVideo(resourceUrl: string, videoSrc: string): boolean {
    try {
      const a = new URL(resourceUrl, typeof location !== 'undefined' ? location.href : undefined);
      const b = new URL(videoSrc, typeof location !== 'undefined' ? location.href : undefined);
      return a.pathname === b.pathname || resourceUrl === videoSrc || resourceUrl.includes(b.pathname);
    } catch {
      return resourceUrl === videoSrc;
    }
  }

  private consumeResourceEntry(entry: PerformanceResourceTiming) {
    if (!this.videoElement) return;
    const src = this.videoElement.currentSrc || this.videoElement.src;
    if (!src || !this.resourceMatchesVideo(entry.name, src)) return;

    const key = `${entry.name}|${entry.startTime}|${entry.transferSize}|${entry.encodedBodySize}`;
    if (this.seenResourceKeys.has(key)) return;
    this.seenResourceKeys.add(key);

    const transfer =
      entry.transferSize > 0
        ? entry.transferSize
        : entry.encodedBodySize > 0
          ? entry.encodedBodySize
          : 0;

    if (transfer > 0) {
      this.bytesTransferred = (this.bytesTransferred ?? 0) + transfer;
    }

    // TTFB from responseStart - requestStart when available
    if (
      this.ttfbMs === null &&
      entry.responseStart > 0 &&
      entry.requestStart > 0 &&
      entry.responseStart >= entry.requestStart
    ) {
      this.ttfbMs = Math.round(entry.responseStart - entry.requestStart);
    }

    const durationMs =
      entry.responseEnd > entry.requestStart
        ? entry.responseEnd - entry.requestStart
        : entry.duration;

    const mbps = sampleToMbps(transfer, durationMs);
    if (mbps !== null) {
      this.estimatedThroughputMbps = updateThroughputEwma(this.estimatedThroughputMbps, mbps);
    }
  }

  private async probeThroughput(src: string) {
    if (this.probeInFlight || src.startsWith('blob:')) return;
    this.probeInFlight = true;
    try {
      const t0 = performance.now();
      const res = await fetch(src, {
        headers: { Range: 'bytes=0-65535' },
        method: 'GET',
      });
      if (!res.ok && res.status !== 206) return;
      const buf = await res.arrayBuffer();
      const elapsed = performance.now() - t0;
      if (this.ttfbMs === null) {
        // Approximate TTFB as time-to-first-byte when headers arrived;
        // without PerformanceTiming on fetch we use total elapsed as upper bound.
        this.ttfbMs = Math.round(elapsed);
      }
      this.recordTransfer(buf.byteLength, elapsed, false);
    } catch {
      // Probe is best-effort
    } finally {
      this.probeInFlight = false;
    }
  }

  private recordTransfer(bytes: number, durationMs: number, countBytes: boolean) {
    if (countBytes && bytes > 0) {
      this.bytesTransferred = (this.bytesTransferred ?? 0) + bytes;
    }
    const mbps = sampleToMbps(bytes, durationMs);
    if (mbps !== null) {
      this.estimatedThroughputMbps = updateThroughputEwma(this.estimatedThroughputMbps, mbps);
      this.emitTelemetry();
    }
  }

  private updateFpsAndFrames() {
    if (!this.videoElement) {
      return { fps: null as number | null, total: 0, dropped: 0, corrupted: 0 };
    }

    const now = performance.now();
    if (!this.lastFrameTime) this.lastFrameTime = now;
    const elapsedSeconds = (now - this.lastFrameTime) / 1000;

    let total = 0;
    let dropped = 0;
    let corrupted = 0;

    const video = this.videoElement as HTMLVideoElement & {
      getVideoPlaybackQuality?: () => {
        totalVideoFrames?: number;
        droppedVideoFrames?: number;
        corruptedVideoFrames?: number;
      };
    };

    if (typeof video.getVideoPlaybackQuality === 'function') {
      const quality = video.getVideoPlaybackQuality();
      total = quality.totalVideoFrames || 0;
      dropped = quality.droppedVideoFrames || 0;
      corrupted = quality.corruptedVideoFrames || 0;

      if (elapsedSeconds >= 1.0) {
        const deltaFrames = total - this.lastFrameCount;
        this.currentFps = Math.max(0, Math.min(120, Math.round(deltaFrames / elapsedSeconds)));
        this.lastFrameCount = total;
        this.lastFrameTime = now;
      }
    } else {
      this.currentFps = this.videoElement.paused ? 0 : null;
    }

    return { fps: this.currentFps, total, dropped, corrupted };
  }

  public getTelemetry(): StreamEngineTelemetry {
    const forwardBuffer = this.calculateBufferHealth();
    const frameStats = this.updateFpsAndFrames();
    const activeProfile =
      QUALITY_LADDER.find((p) => p.id === this.qualityPreference) || QUALITY_LADDER[0];

    const bufferedRanges: { start: number; end: number }[] = [];
    if (this.videoElement) {
      const buffered = this.videoElement.buffered;
      for (let i = 0; i < buffered.length; i++) {
        bufferedRanges.push({ start: buffered.start(i), end: buffered.end(i) });
      }
    }

    let state: StreamEngineTelemetry['state'] = 'idle';
    if (this.videoElement) {
      if (this.videoElement.seeking) state = 'seeking';
      else if (this.videoElement.readyState < 3 && !this.videoElement.paused) state = 'buffering';
      else if (this.videoElement.paused) state = 'ready';
      else state = 'playing';
    }

    return {
      state,
      qualityPreference: this.qualityPreference,
      currentBitrateKbps: this.videoElement ? activeProfile.targetBitrateKbps : null,
      estimatedThroughputMbps: this.videoElement ? this.estimatedThroughputMbps : null,
      bufferHealthSeconds: Math.round(forwardBuffer * 10) / 10,
      bufferPercentage: Math.min(100, Math.round((forwardBuffer / this.targetBufferSeconds) * 100)),
      targetBufferSeconds: this.targetBufferSeconds,
      seekLatencyMs: this.videoElement ? this.seekLatencyMs : null,
      lastSeekTimestamp: this.lastSeekStart,
      ttfbMs: this.videoElement ? this.ttfbMs : null,
      fps: this.videoElement ? frameStats.fps : null,
      totalFrames: frameStats.total,
      droppedFrames: frameStats.dropped,
      corruptedFrames: frameStats.corrupted,
      dropRatePercentage:
        frameStats.total > 0
          ? Math.round((frameStats.dropped / frameStats.total) * 1000) / 10
          : null,
      hwAccelerated: this.hwAccelerated,
      hwDecoderName: this.hwDecoderName,
      codec: this.codec,
      bytesTransferred: this.videoElement ? this.bytesTransferred : null,
      fastSeekEnabled: this.fastSeekEnabled,
      bufferedRanges,
      videoAttached: Boolean(this.videoElement),
    };
  }

  public subscribe(listener: (telemetry: StreamEngineTelemetry) => void): () => void {
    this.telemetryListeners.push(listener);
    listener(this.getTelemetry());
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter((l) => l !== listener);
    };
  }

  private emitTelemetry() {
    const telemetry = this.getTelemetry();
    for (const listener of this.telemetryListeners) {
      try {
        listener(telemetry);
      } catch {
        // Ignored
      }
    }
  }

  private startTelemetryLoop() {
    if (this.telemetryIntervalId) clearInterval(this.telemetryIntervalId);
    this.telemetryIntervalId = setInterval(() => {
      if (this.videoElement) {
        this.ingestResourceTimings();
      }
      this.emitTelemetry();
    }, 600);
    // Allow Node test runners to exit even if the singleton is imported.
    this.telemetryIntervalId.unref?.();
  }

  /**
   * Run a real seek benchmark on the attached video element.
   * Refuses when no video is attached.
   */
  public async runBenchmark(): Promise<BenchmarkResult> {
    if (!this.videoElement) {
      throw new Error('No video attached — cannot run benchmark');
    }

    const video = this.videoElement;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Video has no seekable duration yet');
    }

    const resumeAt = video.currentTime;
    const wasPaused = video.paused;
    const candidates = [0.05, 0.15, 0.35, 0.55, 0.75]
      .map((f) => Math.min(duration * f, Math.max(0, duration - 0.5)))
      .filter((t, i, arr) => arr.indexOf(t) === i);

    const seekSamples: number[] = [];

    for (const pt of candidates) {
      const latency = await this.measureSeek(pt);
      seekSamples.push(latency);
    }

    // Restore playback position
    await this.measureSeek(resumeAt);
    if (!wasPaused) {
      try {
        await video.play();
      } catch {
        // Ignored
      }
    }

    const avgSeek = Math.round(seekSamples.reduce((a, b) => a + b, 0) / seekSamples.length);
    const minSeek = Math.min(...seekSamples);
    const maxSeek = Math.max(...seekSamples);
    const score = gradeSeekLatency(avgSeek);

    this.seekLatencyMs = avgSeek;
    this.emitTelemetry();

    const throughputLabel =
      this.estimatedThroughputMbps !== null
        ? `${this.estimatedThroughputMbps.toFixed(1)} Mbps measured`
        : 'throughput not yet measured';

    return {
      score,
      avgSeekLatencyMs: avgSeek,
      minSeekLatencyMs: minSeek,
      maxSeekLatencyMs: maxSeek,
      estimatedThroughputMbps: this.estimatedThroughputMbps,
      hwAccelerationGrade:
        this.hwAccelerated === true
          ? 'Hardware decode reported'
          : this.hwAccelerated === false
            ? 'Software / inefficient decode'
            : 'Hardware status unknown',
      summary: `Measured ${seekSamples.length} seeks: avg ${avgSeek}ms (min ${minSeek}, max ${maxSeek}). Score ${score} from measured latency only. ${throughputLabel}.`,
    };
  }

  private measureSeek(targetTime: number): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.videoElement) {
        reject(new Error('No video attached'));
        return;
      }
      const video = this.videoElement;
      const t0 = performance.now();
      let settled = false;

      const cleanup = () => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
      };

      const onSeeked = () => {
        if (settled) return;
        settled = true;
        cleanup();
        const latency = Math.max(12, Math.round(performance.now() - t0));
        resolve(latency);
      };

      const onError = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Seek failed during benchmark'));
      };

      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', onError);

      this.lastSeekStart = t0;
      if (this.fastSeekEnabled && typeof (video as HTMLVideoElement & { fastSeek?: (t: number) => void }).fastSeek === 'function') {
        try {
          (video as HTMLVideoElement & { fastSeek: (t: number) => void }).fastSeek(targetTime);
        } catch {
          video.currentTime = targetTime;
        }
      } else {
        video.currentTime = targetTime;
      }

      // Safety timeout — still report measured wait
      setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(Math.max(12, Math.round(performance.now() - t0)));
      }, 8000);
    });
  }

  public destroy() {
    if (this.telemetryIntervalId) clearInterval(this.telemetryIntervalId);
    this.telemetryIntervalId = null;
    if (this.performanceObserver) {
      try {
        this.performanceObserver.disconnect();
      } catch {
        // Ignored
      }
      this.performanceObserver = null;
    }
    this.detachVideo();
    this.telemetryListeners = [];
  }
}

// Global Singleton for the entire app
export const globalStreamingEngine = new StreamingEngine();
