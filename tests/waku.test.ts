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
