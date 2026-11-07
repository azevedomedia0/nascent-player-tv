/**
 * Waku publish validation + offline service behaviour.
 * Run with: npm test
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateWakuPublish } from "../src/lib/waku/validate.ts";
import { WakuNodeService } from "../src/lib/waku/node.ts";

describe("validateWakuPublish", () => {
  it("rejects a missing payload with 400", () => {
    const result = validateWakuPublish("/iina-player/1/lounge/proto", {});
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 400);
      assert.match(result.error, /payload required/i);
    }
  });

  it("rejects payloads over 64 KB with 413", () => {
    const huge = "x".repeat(65537);
    const result = validateWakuPublish("/iina-player/1/lounge/proto", { payload: huge });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 413);
      assert.match(result.error, /64 KB/i);
    }
  });

  it("rejects oversized content topics with 400", () => {
    const topic = "a".repeat(201);
    const result = validateWakuPublish(topic, { payload: "ok" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 400);
      assert.match(result.error, /too long/i);
    }
  });

  it("accepts a valid publish body", () => {
    const result = validateWakuPublish("/iina-player/1/lounge/proto", {
      payload: Buffer.from("hello").toString("base64"),
      version: 0,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.message.contentTopic, "/iina-player/1/lounge/proto");
      assert.ok(result.message.payload.length > 0);
    }
  });
});

describe("WakuNodeService offline state", () => {
  it("reports unavailable before start and getInfo throws", () => {
    const service = new WakuNodeService();
    assert.equal(service.isAvailable(), false);
    assert.throws(() => service.getInfo(), /unavailable/i);
    assert.deepEqual(service.getCached("/iina-player/1/lounge/proto"), []);
  });

  it("publish rejects when the node is offline", async () => {
    const service = new WakuNodeService();
    await assert.rejects(
      () =>
        service.publish("/iina-player/1/lounge/proto", {
          payload: "aGVsbG8=",
          contentTopic: "/iina-player/1/lounge/proto",
          version: 0,
          timestamp: Date.now(),
        }),
      /unavailable/i
    );
  });
});

describe("Waku ESM load safety (CJS production bundle)", () => {
  it("does not statically import @waku/sdk at module evaluation time", async () => {
    // Guard against regressing to `import { … } from "@waku/sdk"` which
    // becomes require() in dist/server.cjs and crashes Node on boot.
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.resolve("src/lib/waku/node.ts"),
      "utf8"
    );
    assert.match(source, /import\(["']@waku\/sdk["']\)/);
    assert.match(source, /import\(["']@waku\/utils["']\)/);
    // Static runtime import lines must not exist (import type / typeof import OK).
    const runtimeImports = source
      .split("\n")
      .filter((line) => /^\s*import\s+(?!type\b)/.test(line))
      .filter((line) => /from\s+["']@waku\//.test(line));
    assert.deepEqual(
      runtimeImports,
      [],
      `Unexpected static @waku runtime imports:\n${runtimeImports.join("\n")}`
    );
  });
});
