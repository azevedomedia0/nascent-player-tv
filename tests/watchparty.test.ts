/**
 * Watch-party hostToken hygiene + publicRoom contract (unit-level).
 * Full HTTP coverage lives with the running server; these guards keep
 * the client-facing shape honest.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

/** Mirror of server publicRoom() — hostToken must never leak. */
function publicRoom(room: Record<string, unknown>) {
  const { hostToken, ...publicFields } = room;
  void hostToken;
  return publicFields;
}

describe("watch party publicRoom", () => {
  it("strips hostToken from join/sync responses", () => {
    const hostToken = crypto.randomBytes(32).toString("hex");
    const room = {
      roomId: "room_ABC123",
      hostId: "host_1",
      hostName: "Steven",
      hostToken,
      playbackState: "paused",
      currentTime: 0,
      participants: [{ id: "host_1", name: "Steven", lastSeen: Date.now() }],
      chat: [],
    };
    const pub = publicRoom(room);
    assert.equal("hostToken" in pub, false);
    assert.equal(pub.roomId, "room_ABC123");
    assert.equal(JSON.stringify(pub).includes(hostToken), false);
  });
});
