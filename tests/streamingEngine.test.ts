/**
 * StreamingEngine measurement helpers + idle telemetry contracts.
 * Run with: npm test
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  updateThroughputEwma,
  gradeSeekLatency,
  sampleToMbps,
  StreamingEngine,
} from "../src/lib/streamingEngine.ts";

describe("sampleToMbps", () => {
  it("converts transfer size and duration into Mbps", () => {
    // 1_250_000 bytes in 1 second = 10 Mbps
    const mbps = sampleToMbps(1_250_000, 1000);
    assert.equal(mbps, 10);
  });

  it("returns null for zero/invalid inputs", () => {
    assert.equal(sampleToMbps(0, 1000), null);
    assert.equal(sampleToMbps(1000, 0), null);
    assert.equal(sampleToMbps(-1, 100), null);
  });
});

describe("updateThroughputEwma", () => {
  it("returns the first sample when previous is null", () => {
    assert.equal(updateThroughputEwma(null, 12.5), 12.5);
  });

  it("blends subsequent samples with alpha=0.3", () => {
    const next = updateThroughputEwma(10, 20, 0.3);
    assert.ok(Math.abs(next - 13) < 1e-9);
  });

  it("ignores non-finite samples", () => {
    assert.equal(updateThroughputEwma(8, Number.NaN), 8);
    assert.equal(updateThroughputEwma(null, -5), 0);
  });
});

describe("gradeSeekLatency", () => {
  it("grades from measured averages only", () => {
    assert.equal(gradeSeekLatency(30), "A+");
    assert.equal(gradeSeekLatency(60), "A");
    assert.equal(gradeSeekLatency(100), "B");
    assert.equal(gradeSeekLatency(200), "C");
    assert.equal(gradeSeekLatency(500), "D");
  });
});

describe("StreamingEngine idle telemetry", () => {
  it("reports unknown/empty fields when no video is attached", () => {
    const engine = new StreamingEngine();
    try {
      const t = engine.getTelemetry();
      assert.equal(t.videoAttached, false);
      assert.equal(t.state, "idle");
      assert.equal(t.estimatedThroughputMbps, null);
      assert.equal(t.ttfbMs, null);
      assert.equal(t.seekLatencyMs, null);
      assert.equal(t.bytesTransferred, null);
      assert.equal(t.fps, null);
      assert.equal(t.currentBitrateKbps, null);
      // hwDecoderName starts as detecting… (async mediaCapabilities may resolve later)
      assert.match(t.hwDecoderName, /detecting|unavailable|Hardware|GPU|Software/i);
    } finally {
      engine.destroy();
    }
  });

  it("refuses benchmark without an attached video", async () => {
    const engine = new StreamingEngine();
    try {
      await assert.rejects(
        () => engine.runBenchmark(),
        /No video attached/
      );
    } finally {
      engine.destroy();
    }
  });

  it("quality preference is label-only and does not invent throughput", () => {
    const engine = new StreamingEngine();
    try {
      engine.setQualityMode("480p");
      const t = engine.getTelemetry();
      assert.equal(t.qualityPreference, "480p");
      assert.equal(t.estimatedThroughputMbps, null);
      assert.equal(t.ttfbMs, null);
    } finally {
      engine.destroy();
    }
  });
});
