/**
 * Tests for src/lib/security.ts — the shared server-side security helpers.
 *
 * Run with: npm test  (tsx --test tests/security.test.ts)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateProxyUrl,
  resolveMediaPath,
  sanitizeMediaInput,
  sanitizeUploadFilename,
  clampBenchmarkBytes,
  MAX_BENCHMARK_BYTES,
} from "../src/lib/security.ts";

describe("validateProxyUrl", () => {
  it("allows a bundled allowlist host over https", () => {
    const url = validateProxyUrl("https://v3-cinemeta.strem.io/manifest.json");
    assert.equal(url.hostname, "v3-cinemeta.strem.io");
    assert.equal(url.protocol, "https:");
  });

  it("rewrites stremio:// to https:// for an allowlisted host", () => {
    const url = validateProxyUrl("stremio://torrentio.strem.fun/manifest.json");
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "torrentio.strem.fun");
  });

  it("rejects the cloud metadata endpoint (SSRF)", () => {
    assert.throws(
      () => validateProxyUrl("http://169.254.169.254/latest/meta-data/"),
      /not allowed|must use https/
    );
  });

  it("rejects localhost", () => {
    assert.throws(
      () => validateProxyUrl("https://localhost:3000/api/media"),
      /not allowed/
    );
    assert.throws(
      () => validateProxyUrl("https://127.0.0.1/api/media"),
      /not allowed/
    );
  });

  it("rejects non-https URLs even for allowlisted hosts", () => {
    assert.throws(
      () => validateProxyUrl("http://v3-cinemeta.strem.io/manifest.json"),
      /must use https/
    );
  });

  it("rejects hosts not on the allowlist", () => {
    assert.throws(
      () => validateProxyUrl("https://evil.example.com/manifest.json"),
      /not allowed/
    );
  });

  it("rejects missing / invalid URLs", () => {
    assert.throws(() => validateProxyUrl(""), /Missing url/);
    assert.throws(() => validateProxyUrl("not a url"), /Invalid proxy URL|not allowed/);
  });
});

describe("resolveMediaPath", () => {
  const mediaDir = "/srv/media";

  it("resolves a plain filename inside MEDIA_DIR", () => {
    assert.equal(
      resolveMediaPath(mediaDir, "BigBuckBunny.mp4"),
      "/srv/media/BigBuckBunny.mp4"
    );
  });

  it("rejects parent-directory traversal", () => {
    assert.equal(resolveMediaPath(mediaDir, "../../server.ts"), null);
    assert.equal(resolveMediaPath(mediaDir, "../.env"), null);
  });

  it("rejects absolute paths", () => {
    assert.equal(resolveMediaPath(mediaDir, "/etc/passwd"), null);
  });

  it("rejects filenames containing a subdirectory", () => {
    assert.equal(resolveMediaPath(mediaDir, "sub/file.mp4"), null);
  });
});

describe("sanitizeMediaInput", () => {
  it("strips a caller-supplied id and playCount (no mass assignment)", () => {
    const item = sanitizeMediaInput({
      id: "hacked-id",
      playCount: 999,
      playProgress: 50,
      title: "Test Movie",
      url: "https://example.com/x.mp4",
    });
    assert.ok(item);
    assert.equal("id" in item, false);
    assert.equal("playCount" in item, false);
    assert.equal("playProgress" in item, false);
    assert.equal(item.title, "Test Movie");
  });

  it("forces isLocal=false when the filename is a traversal attempt", () => {
    const item = sanitizeMediaInput({
      title: "Traversal Test",
      filename: "../../server.ts",
      isLocal: true,
      url: "https://example.com/x.mp4",
    });
    assert.ok(item);
    assert.equal(item.isLocal, false);
    assert.equal("filename" in item, false);
  });

  it("keeps isLocal=true for a safe local filename", () => {
    const item = sanitizeMediaInput({
      title: "Local Movie",
      filename: "movie.mp4",
      isLocal: true,
      url: "https://example.com/x.mp4",
    });
    assert.ok(item);
    assert.equal(item.isLocal, true);
    assert.equal(item.filename, "movie.mp4");
  });

  it("drops non-http(s) URLs", () => {
    const item = sanitizeMediaInput({ title: "X", url: "javascript:alert(1)" });
    assert.ok(item);
    assert.equal("url" in item, false);
  });

  it("returns null for a body with no usable title or url", () => {
    assert.equal(sanitizeMediaInput({}), null);
    assert.equal(sanitizeMediaInput("not an object"), null);
  });
});

describe("sanitizeUploadFilename", () => {
  it("rejects non-video extensions", () => {
    assert.equal(sanitizeUploadFilename("evil.exe"), null);
    assert.equal(sanitizeUploadFilename("script.js"), null);
    assert.equal(sanitizeUploadFilename("no-extension"), null);
  });

  it("accepts video files and returns a timestamped safe name", () => {
    const name = sanitizeUploadFilename("movie.mp4");
    assert.ok(name);
    assert.ok(name.endsWith(".mp4"));
    assert.ok(!name.includes("/"));
  });
});

describe("clampBenchmarkBytes", () => {
  it("clamps a 1 GB request to 1 MiB", () => {
    assert.equal(clampBenchmarkBytes("1000000000"), MAX_BENCHMARK_BYTES);
    assert.equal(clampBenchmarkBytes("1000000000"), 1024 * 1024);
  });

  it("passes through values under the cap", () => {
    assert.equal(clampBenchmarkBytes("1024"), 1024);
  });

  it("defaults to 64 KiB for missing / invalid values", () => {
    assert.equal(clampBenchmarkBytes(undefined), 64 * 1024);
    assert.equal(clampBenchmarkBytes("not-a-number"), 64 * 1024);
    assert.equal(clampBenchmarkBytes("0"), 64 * 1024);
  });
});
